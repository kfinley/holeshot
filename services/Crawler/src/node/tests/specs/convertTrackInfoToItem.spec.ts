import 'reflect-metadata';
import trackInfo from '../data/trackInfo.json';
import { convertTrackInfoToItem } from '../../src/commands/ddb-helpers';
import { TrackInfo } from '@holeshot/types/src';

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
