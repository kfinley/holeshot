
import Components from "@/components";
import { Wrapper } from "@vue/test-utils";
import { Factory } from "vue2-components/tests/utils";
import { events } from '../../tests/data'

describe('event-details-modal.vue', () => {

  let component: Wrapper<Vue, Element>;

  beforeEach(() => {
    // Arrange
    component = Factory.create(Components.EventDetailsModal, {
      event: events[0]
    });
  });

  it("mounts", () => {

    // Assert
    expect(component.isVueInstance).toBeTruthy();
  });
});
