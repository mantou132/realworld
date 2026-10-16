export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: false },
  app: {
    head: {
      title: 'Conduit',
      link: [
        { rel: 'icon', href: 'data:,' },
        { rel: 'stylesheet', href: '/ionicons/css/ionicons.min.css' },
        { rel: 'stylesheet', href: '/conduit-theme.css' },
      ],
    },
  },
  runtimeConfig: {
    public: { apiBase: 'http://localhost:3100/api' },
  },
});
