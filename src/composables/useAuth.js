import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { TOKEN_KEY, REFRESH_TOKEN_KEY, TOKEN_EXPIRY_KEY, ROLE_PERMISSIONS } from '@/utils/constants';
/** Current admin user info stored in reactive state */
const currentUser = ref(null);
const isAuthenticated = ref(!!localStorage.getItem(TOKEN_KEY));
/**
 * Composable for authentication state management
 */
export function useAuth() {
    const router = useRouter();
    /** Check if user has a specific permission */
    function hasPermission(permission) {
        if (!currentUser.value)
            return false;
        const role = currentUser.value.role;
        const perms = ROLE_PERMISSIONS[role] || [];
        // Super admin has wildcard
        if (perms.includes('*'))
            return true;
        // Check exact match or parent match
        return perms.some((p) => permission === p || permission.startsWith(`${p}:`));
    }
    /** Check if user has any of the given permissions */
    function hasAnyPermission(permissions) {
        return permissions.some((p) => hasPermission(p));
    }
    /** Set auth tokens and user data after login */
    function setAuth(accessToken, refreshToken, expiresIn, user) {
        localStorage.setItem(TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + expiresIn * 1000));
        currentUser.value = user;
        isAuthenticated.value = true;
    }
    /** Clear auth state and redirect to login */
    function clearAuth() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(TOKEN_EXPIRY_KEY);
        currentUser.value = null;
        isAuthenticated.value = false;
    }
    /** Logout and redirect */
    async function logout() {
        clearAuth();
        await router.push('/login');
    }
    const userRole = computed(() => currentUser.value?.role || null);
    const userName = computed(() => currentUser.value?.username || '');
    return {
        currentUser,
        isAuthenticated,
        userRole,
        userName,
        hasPermission,
        hasAnyPermission,
        setAuth,
        clearAuth,
        logout,
    };
}
