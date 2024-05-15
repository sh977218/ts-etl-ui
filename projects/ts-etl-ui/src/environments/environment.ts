import { Environment } from '../model/environment';

export const environment: Environment = {
  appVersion: require('../../../../package.json').version + '-prod',
  environmentName: 'prod',
  ticketUrl:'https://utslogin.nlm.nih.gov/serviceValidate',
  apiServer: 'http://localhost:3000/api/'
};
