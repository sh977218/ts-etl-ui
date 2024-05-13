export type UtsUser = {
  "username": string;
  "apiKey": string;
  "idpUserOrg": string;
  "firstName": string;
  "lastName": string;
}
export type User = {
  "userID": string;
  "credentialType": string;
  "firstName": string;
  "authenticationDate": string;
  "isFromNewLogin": string;
  "authenticationMethod": string;
  "successfulAuthenticationHandlers": string;
  "longTermAuthenticationRequestTokenUsed": string;
  "email": string;
  "lastName": string;
  "idpUserOrg": string;
  "success": boolean;
  "userStatus": string;
  "jwtToken": string;
  "utsUser": UtsUser
}
