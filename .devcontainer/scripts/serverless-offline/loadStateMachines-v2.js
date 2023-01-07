/*

loadStateMachines-v2.js will load step function state machines individual files located under a state-machines folder.

*/

const fs = require("fs");
const yaml = require("yaml");
const config = require('../../../sls.config');

module.exports = () => {
  const services = config.services;

  let stateMachines = {};
  services.forEach((service) => {
    const basePath = `./services/${service}/`;
    const serviceName = service

    let stateMachinesFiles = fs.readdirSync(`${basePath}infrastructure/state-machines`);

    stateMachinesFiles.forEach((fileName) => {
      if (fileName != '.gitignore') {
        let stateMachine = fs.readFileSync(`${basePath}infrastructure/state-machines/${fileName}`, "utf8");
        stateMachine = stateMachine.replace(/\$\{self:service:::toUpperCase\}/g, serviceName.toUpperCase);
        stateMachine = stateMachine.replace(/\$\{self:service\}/g, serviceName);
        let name = fileName.split('.')[0];

        stateMachines = {
          ...stateMachines,
          ...{
            [`Holeshot-${serviceName}-${name.charAt(0).toUpperCase()}${name.slice(1)}`]: {
              definition: yaml.parse(stateMachine)
            }
          }
        };
        // console.log(stateMachines);
      }
    });

  });

  return stateMachines;
};
