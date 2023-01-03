import Components from "@/components";
import { Wrapper } from "@vue/test-utils";
import { Factory } from "@finley/vue2-components/tests/utils";
import { events } from '../../tests/data'

describe('events-feed.vue', () => {

  let component: Wrapper<Vue, Element>;

  beforeEach(() => {
    // Arrange
    component = Factory.create(Components.EventsFeed, {
      events
    });
  });

  it("mounts", () => {

    // Assert
    expect(component.isVueInstance).toBeTruthy();
  });
});
