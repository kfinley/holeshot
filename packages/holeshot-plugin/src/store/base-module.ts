import BaseModule from "@finley/vue2-components/src/store/base-module";
import { createEqualsPredicate } from "@finley/vue2-components/src/filter-combinators";
import { notificationModule } from "@finley/vue2-components/src/store";

const functionNamePrefix =
  process.env.NODE_ENV === "production"
    ? "Holeshot-Infrastructure"
    : "holeshot-Dev-Event";

export class HoleshotModule extends BaseModule {
  private timeoutFailureCount = 0;

  sendCommand(params: {
    name: string;
    payload: unknown;
    onTimeout?: () => void;
  }) {

    let count = this.timeoutFailureCount;

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

    const context = this.context;

    return setTimeout(function () {
      params.onTimeout?.();
      console.log("sendCommand timeout:", [params.name, ", ", params.payload]);
      count = count++;
      setTimeout(function () {
        count = 0;
      }, 150000);
      if (count >= 2) {
        context.dispatch(
          "WebSockets/reconnect",
          context.rootState.User.authTokens?.accessToken
        );
        notificationModule.setError({
          message: "Resetting connection...",
        });
        count = 0;
      }
    }, 45000); //TODO: config this...
  }

  mutate<T>(mutation: (state: T) => void) {
    this.context.commit("mutate", mutation);
  }

  addOrUpdate<T>(
    item: T,
    items: Array<T> | null,
    props: Record<string, any>,
    // predicate: (value: T, index: number, obj: T[]) => unknown
  ): Array<T> {
    if (items == null) items = [];
    const index = items.findIndex(createEqualsPredicate(props));
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

  addOrUpdateSorted<T>(
    item: T,
    items: Array<T> | null,
    props: Record<string, any>
  ): Array<T> {
    if (items == null) items = [];
    // (e) => e.name == params.event.name && e.date == params.event.date
    const index = items.findIndex(createEqualsPredicate(props));

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

  addSorted<T>(
    item: T,
    items: Array<T> | null,
    props: Record<string, any>,
    predicate: (value: T, index: number, obj: T[]) => unknown
  ): Array<T> {
    if (items == null) items = [];

    // Check if we already have the item in the array
    let index = items.findIndex(createEqualsPredicate(props));
    if (index > -1) {
      return items;
    }

    // using the predicate decide where to put the item in the array.
    index = items.findIndex(predicate);

    //Not found, add on end.
    if (-1 === index) {
      return [...items, item];
    }
    return [...items.slice(0, index), item, ...items.slice(index)];
  }
}
