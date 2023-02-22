import 'reflect-metadata';
import trackInfo from '../data/trackInfo.json';
import { convert } from '../../src/commands/ddb-helpers';

describe("ddb-helpers.convert", () => {

  describe("Success", () => {
    let result: {} | undefined = undefined;

    beforeAll(() => {
      result = convert(trackInfo)
    });

    it("should run", () => {
      console.log(result);
      expect(result).not.toBeNull();
    });

  });

});
