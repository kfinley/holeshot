import { config } from '@holeshot/web-core/src/config';

//const registrationServiceUri = `${process.env.NODE_ENV === 'production' ? 'https' : 'http'}://${config.Api}`;
const registrationServiceUri = config.Api;

export default {
  get serviceBasePath() {
    return `${registrationServiceUri}/user`;
  },

  get register() {
    return `${this.serviceBasePath}/register`;
  },
};
