import { createApp } from 'vue';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import App from './App.vue';
import router from './router';
import './style.css';
import { ENABLE_MOCKS } from './utils/constants';
async function prepareApp() {
    if (ENABLE_MOCKS) {
        const { worker } = await import('./mocks/browser');
        await worker.start({
            onUnhandledRequest: 'bypass',
            serviceWorker: {
                url: '/mockServiceWorker.js',
            },
        });
        console.log('[MSW] Mock Service Worker started successfully.');
    }
}
prepareApp().then(() => {
    const app = createApp(App);
    app.use(createPinia());
    app.use(router);
    app.use(PrimeVue, {
        theme: {
            preset: Aura,
            options: {
                darkModeSelector: false || 'none',
            },
        },
    });
    app.mount('#app');
});
