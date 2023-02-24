import 'reflect-metadata';
import trackInfo from '../../../test-files/trackInfo.json';
import { operatorsToMap } from '../../src/commands/ddb-helpers';

describe("ddb-helpers.operatorsToMap", () => {

  describe("Success", () => {
    let result: {} | undefined = undefined;

    beforeAll(() => {
      result = operatorsToMap(trackInfo.operators)
    });

    it("should run", () => {
      console.log(result);
      expect(result).not.toBeNull();
    });

  });

});
