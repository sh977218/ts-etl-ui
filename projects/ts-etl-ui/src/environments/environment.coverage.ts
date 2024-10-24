import { Environment } from '../model/environment';

export const environment: Environment = {
  environmentName: 'coverage',
  production: true,
  ticketUrl: 'http://localhost:3000/api/serviceValidate',
  loginUrl: 'http://localhost:3000/api/login',
  logoutUrl: 'http://localhost:3000/api/logout',
  loginServiceUrl: 'http://localhost:3000/nih-login',
  apiServer: '/api',
};
