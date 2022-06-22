import Components from "@/components";
import { Wrapper } from "@vue/test-utils";
import { Factory } from "vue2-components/tests/utils";

describe('track-search.vue', () => {

  let component: Wrapper<Vue, Element>;

  beforeEach(() => {
    // Arrange
    component = Factory.create(Components.TrackSearch);
  });

  it("mounts", () => {

    // Assert
    expect(component.isVueInstance).toBeTruthy();
  });
});
