import 'reflect-metadata';
import trackInfo from '../../../test-files/trackInfo.json';
import { convertTrackInfoToItem } from '../../src/commands/ddb-helpers';

describe("ddb-helpers.convertTrackInfoToItem", () => {

  describe("Success", () => {
    let result: {} | undefined = undefined;

    beforeAll(() => {
      result = convertTrackInfoToItem(trackInfo.name, trackInfo)
    });

    it("should run", () => {
      expect(result).not.toBeNull();
    });

  });

});
