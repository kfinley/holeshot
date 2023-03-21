import BaseModule from "@finley/vue2-components/src/store/base-module";

const functionNamePrefix =
  process.env.NODE_ENV === "production"
    ? "Holeshot-Infrastructure"
    : "holeshot-Dev-Event";

export class HoleshotModule extends BaseModule {
  get getUsername() {
    return this.context.rootState.User.username;
  }

  addEntity(
    type: string,
    pk: string,
    sk: string | Date | null,
    entity: any,
    responseCommand: string
  ) {
    this.context.dispatch(
      "WebSockets/sendCommand",
      {
        command: "RunLambda",
        data: {
          name: `${functionNamePrefix}-AddEntity`,
          payload: JSON.stringify({
            pk,
            sk,
            type: {
              S: type,
            },
            entity,
            responseCommand,
          }),
        },
      },
      { root: true }
    );
  }

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

  addOrUpdate<T>(
    item: T,
    items: Array<T>,
    predicate: (value: T, index: number, obj: T[]) => unknown
  ): Array<T> {
    const index = items.findIndex(predicate);
    //Not found, add on end.
    if (-1 === index) {
      return [...items, item];
    }
    //found, so return:
    //Clone of items before item being update.
    //updated item
    //Clone of items after item being updated.
    return [...items.slice(0, index), item, ...items.slice(index + 1)];
  }
}
