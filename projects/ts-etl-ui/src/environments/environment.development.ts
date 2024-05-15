import { Environment } from '../model/environment';

export const environment:Environment = {
  /* eslint-disable */
  appVersion: require('../../../../package.json').version + '-dev'+`-${new Date().getFullYear()}/${new Date().getMonth()}/${new Date().getDate()} ${new Date().getHours()}:${new Date().getMinutes()}`,
  environmentName: 'development',
  ticketUrl:'/api/serviceValidate',
  loginServiceUrl: '/?ticket=anything',
  apiServer: ''
};
