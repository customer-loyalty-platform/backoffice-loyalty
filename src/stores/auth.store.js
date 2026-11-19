import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService } from '@/api/services/auth.service';
import { TOKEN_KEY, REFRESH_TOKEN_KEY, TOKEN_EXPIRY_KEY, ROLE_PERMISSIONS } from '@/utils/constants';
export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem(TOKEN_KEY));
    const user = ref(null);
    const isLoading = ref(false);
    const error = ref(null);
    const isAuthenticated = computed(() => !!token.value);
    const userRole = computed(() => user.value?.role || null);
    const username = computed(() => user.value?.username || '');
    // Initialize cached user from localStorage if exists
    const cachedUser = localStorage.getItem('loyalty_admin_user');
    if (cachedUser) {
        try {
            user.value = JSON.parse(cachedUser);
        }
        catch {
            localStorage.removeItem('loyalty_admin_user');
        }
    }
    function hasPermission(permission) {
        if (!user.value)
            return false;
        const role = user.value.role;
        const perms = ROLE_PERMISSIONS[role] || [];
        if (perms.includes('*'))
            return true;
        return perms.some((p) => permission === p || permission.startsWith(`${p}:`));
    }
    async function login(credentials) {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await authService.login(credentials);
            const { access_token, refresh_token, expires_in, admin } = response.data;
            token.value = access_token;
            user.value = admin;
            localStorage.setItem(TOKEN_KEY, access_token);
            localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
            localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + expires_in * 1000));
            localStorage.setItem('loyalty_admin_user', JSON.stringify(admin));
            return response.data;
        }
        catch (err) {
            error.value = err.response?.data?.message || 'Login failed. Please check credentials.';
            throw err;
        }
        finally {
            isLoading.value = false;
        }
    }
    async function fetchCurrentUser() {
        if (!token.value)
            return;
        try {
            const res = await authService.getMe();
            user.value = {
                id: res.data.id,
                username: res.data.username,
                email: res.data.email,
                role: res.data.role,
                status: res.data.status,
            };
            localStorage.setItem('loyalty_admin_user', JSON.stringify(user.value));
        }
        catch {
            // Ignored
        }
    }
    async function logout() {
        try {
            await authService.logout();
        }
        catch {
            // Ignore network errors on logout
        }
        finally {
            token.value = null;
            user.value = null;
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            localStorage.removeItem(TOKEN_EXPIRY_KEY);
            localStorage.removeItem('loyalty_admin_user');
        }
    }
    return {
        token,
        user,
        isLoading,
        error,
        isAuthenticated,
        userRole,
        username,
        hasPermission,
        login,
        fetchCurrentUser,
        logout,
    };
});
