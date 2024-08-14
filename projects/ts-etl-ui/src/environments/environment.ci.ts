import { Environment } from '../model/environment';

export const environment: Environment = {
  /* eslint-disable */
  environmentName: 'ci',
  production: true,
  ticketUrl: '/api/serviceValidate',
  loginUrl: '/api/login',
  logoutUrl: '/api/logout',
  loginServiceUrl: 'http://localhost:3000/nih-login',
  apiServer: '/api',
  newApiServer: '',
};
