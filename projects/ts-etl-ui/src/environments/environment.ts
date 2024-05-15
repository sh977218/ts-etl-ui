import { Environment } from '../model/environment';

export const environment: Environment = {
  /* eslint-disable */
  appVersion: require('../../../../package.json').version + '-prod',
  environmentName: 'prod',
  ticketUrl:'https://utslogin.nlm.nih.gov/serviceValidate',
  loginServiceUrl: 'https://uts.nlm.nih.gov/uts/login',
  apiServer: 'http://localhost:3000/api/'
};
