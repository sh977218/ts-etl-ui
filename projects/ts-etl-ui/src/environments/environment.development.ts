import { Environment } from '../model/environment';

export const environment:Environment = {
  appVersion: require('../../../../package.json').version + '-dev',
  environmentName: 'development',
  ticketUrl:'https://utslogin.nlm.nih.gov/serviceValidate',
  apiServer: ''
};
