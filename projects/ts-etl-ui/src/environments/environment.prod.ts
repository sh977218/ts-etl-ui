import { Environment } from '../model/environment';

export const environment: Environment = {
  /* eslint-disable */
  environmentName: 'prod',
  ticketUrl: 'https://utslogin.nlm.nih.gov/serviceValidate', // instead of directly retrieving the user from UTS, it should pass ticket to TS backend and retrieve user from TS.
  loginServiceUrl: 'https://login-prod.nlm.nih.gov/uts/login',
  apiServer: '/portal-backend/api',
};
