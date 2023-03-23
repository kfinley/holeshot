import BaseModule from "@finley/vue2-components/src/store/base-module";

const functionNamePrefix =
  process.env.NODE_ENV === "production"
    ? "Holeshot-Infrastructure"
    : "holeshot-Dev-Event";

//ht: https://codepen.io/Universalist/post/predicates-in-javascript
export const and = (p1, p2) => {
  return function (x) {
    console.log('and', p1(x) && p2(x));
    return p1(x) && p2(x);
  };
};

export const not = (p) => {
  return function (x) {
    console.log('not', !p(x));
    return !p(x);
  };
};

export const equals = (prop, value) => {
  return function (x: any) {
    console.log('equals', x[prop] === value);

    console.log('prop', prop);
    console.log(value);
    console.log(x[prop]);
    return x[prop] == value;
  };
};

export const less = (x) => {
  return function (y) {
    return y < x;
  };
};

export const greater = (x) => {
  return function (y) {
    return y > x;
  };
};

export const createEqualsPredicate = function createNotEqualsPredicate<T>(
  props: Record<string, any>
) {
  const equalsConditions: ((value: T, index: number, obj: T[]) => unknown)[] = [];

  for (const p in props) {
    equalsConditions.push(equals(p, props[p]));
  }

  let condition: (value: T, index: number, obj: T[]) => unknown = equalsConditions[0];

  equalsConditions.forEach((e) => {
    if (e !== condition) {
      condition = and(condition, e);
    }
  });

  return condition;
};

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

  addOrUpdate<T>(
    item: T,
    items: Array<T> | null,
    predicate: (value: T, index: number, obj: T[]) => unknown
  ): Array<T> {
    if (items == null) items = [];
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
    predicate: (value: T, index: number, obj: T[]) => unknown
  ): Array<T> {
    if (items == null) items = [];

    // using the predicate sent in in decide where to put it
    // find the index of the predicate and put the item 1 after it.
    const index = items.findIndex(predicate);

    //Not found, add on end.
    if (-1 === index) {
      return [...items, item];
    }
    return [...items.slice(0, index), item, ...items.slice(index)];
  }
}
