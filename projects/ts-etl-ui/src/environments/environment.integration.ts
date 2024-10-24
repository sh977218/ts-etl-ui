import { Environment } from '../model/environment';

export const environment: Environment = {
  environmentName: 'integration',
  production: false,
  ticketUrl: '/ticketUrl',
  loginUrl: '/loginUrl',
  logoutUrl: '/logoutUrl',
  loginServiceUrl: 'https://login-prod.nlm.nih.gov/uts/login',
  apiServer: '/portal-backend',
};
