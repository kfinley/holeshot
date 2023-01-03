const slsw = require('serverless-webpack');

module.exports = {
    context: __dirname,
    mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
    servicesPath: `./services`,
    services: ['Core', 'User', 'WebSockets'],
};
