import { Environment } from '../model/environment';

export const environment: Environment = {
  /* eslint-disable */
  environmentName: 'prod',
  production: true,
  ticketUrl: '/portal-backend/user/serviceValidate',
  loginUrl: '/portal-backend/user/login',
  logoutUrl: '/portal-backend/user/logout',
  loginServiceUrl: 'https://login-prod.nlm.nih.gov/uts/login',
  apiServer: '/portal-backend/api',
};
