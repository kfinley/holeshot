import BaseControl from "@finley/vue2-components/src/components/base-control";

export default class HoleshotBaseControl extends BaseControl {
  get disconnected() {
    return (this.$store as any).state.WebSockets?.status != "Connected";
  }
}
