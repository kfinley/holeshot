import BaseControl from "@finley/vue2-components/src/components/base-control";

export default class HoleshotBaseControl extends BaseControl {

  get connecting() {
    return (
      (this.$store as any).state.WebSockets?.status == "None" ||
      (this.$store as any).state.WebSockets?.status == "Connecting"
    );
  }

  setFocus(id) {
    setTimeout(() => window.document.getElementById(id)?.focus(), 1);
  }
}
