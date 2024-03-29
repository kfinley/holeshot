//TODO: rewrite this in ts...

export default {
  name: 'useRegisterSW',
  data() {
    return {
      updateSW: undefined,
      offlineReady: false,
      needRefresh: false,
    };
  },
  async mounted() {
    console.log('use-register-sw mounted');

    const { registerSW } = await import('virtual:pwa-register');
    const vm = this;

    this.updateSW = registerSW({
      immediate: true,
      onOfflineReady() {
        vm.offlineReady = true;
        vm.onOfflineReadyFn();
      },
      onNeedRefresh() {
        vm.needRefresh = true;
        vm.onNeedRefreshFn();
      },
    });

  },
  methods: {
    async closePrompt() {
      this.offlineReady = false;
      this.needRefresh = false;
    },
    onOfflineReadyFn() {
      console.log('onOfflineReady', new Date());
    },
    onNeedRefreshFn() {
      console.log('onNeedRefresh', new Date());
    },
    updateServiceWorker() {
      this.updateSW && this.updateSW(true);
    },
  },
};
