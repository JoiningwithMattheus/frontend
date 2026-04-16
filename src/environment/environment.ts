export const environment = {
  production: false,
  apiUrl: '/api',
  auth: {
    authority: 'https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_906kvnKmh',
    domain: 'https://eu-north-1906kvnkmh.auth.eu-north-1.amazoncognito.com',
    clientId: '404dhfcksagu801epnl00jf9e8',
    redirectUrl: 'http://localhost:4200',
    postLogoutRedirectUri: 'http://localhost:4200',
    scope: 'email openid phone',
    responseType: 'code',
    secureRoutes: ['/api'],
  },
};
