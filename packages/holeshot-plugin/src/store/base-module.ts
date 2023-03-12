import BaseModule from "@finley/vue2-components/src/store/base-module";

const functionNamePrefix =
  process.env.NODE_ENV === "production"
    ? "Holeshot-Infrastructure"
    : "holeshot-Dev-Event";

export class HoleshotModule extends BaseModule {
  sendCommand(params: { name: string; payload: any }) {
    this.context.dispatch(
      "WebSockets/sendCommand",
      {
        command: "RunLambda",
        data: {
          name: `${functionNamePrefix}-${params.name}`,
          payload: JSON.stringify(params.payload),
        },
      },
      { root: true }
    );
  }
  mutate<T>(mutation: (state: T) => void) {
    this.context.commit("mutate", mutation);
  }
}