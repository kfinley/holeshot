import Components from "@/components";
import { Wrapper } from "@vue/test-utils";
import { Factory } from "vue2-components/tests/utils";
import { events } from '../../tests/data';

describe('track-list.vue', () => {

  let component: Wrapper<Vue, Element>;

  beforeEach(() => {
    // Arrange
    component = Factory.create(Components.TrackList, {
      tracks: events.map(e => e.track)
    });
  });

  it("mounts", () => {

    // Assert
    expect(component.isVueInstance).toBeTruthy();
  });
});
