import { config } from '@holeshot/web-core/src/config';

const registrationServiceUri = config.Api;

// ditch this for now...
// if (config.ApiPorts && config.ApiPorts.includes('user')) {
//   const port = config.ApiPorts.split(',').find(x => x.startsWith('user'))?.split(':')[1];
//   registrationServiceUri = `${registrationServiceUri}:${port}`;
//   console.log(`User Service: ${registrationServiceUri}`);
// }

export default {
  get serviceBasePath() {
    return `${registrationServiceUri}/user`
  },

  get register() {
    return `${this.serviceBasePath}/register`;
  }

}

