import { Auth } from 'aws-amplify';
import Amplify from 'aws-amplify';
import { config } from './config';
import { CognitoUser } from '@aws-amplify/auth';
import * as AWS from 'aws-sdk';
import { Credentials } from 'aws-sdk/lib/credentials';


Amplify.configure({
    Auth: {
        // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
        identityPoolId: config.IDENTITY_POOL_ID,
        // REQUIRED - Amazon Cognito Region
        region: config.REGION,
        
        // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
        mandatorySignIn: false,
        // OPTIONAL - Amazon Cognito User Pool ID
        userPoolId: config.USER_POOL_ID,
        // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
        userPoolWebClientId: config.APP_CLIENT_ID,
        // OPTIONAL - Manually set the authentication flow type. Default is 'USER_SRP_AUTH'
        authenticationFlowType: 'USER_PASSWORD_AUTH'
    }
})

export class AuthService {

    public async login(emailAddress: string, password: string) {
        const user = await Auth.signIn(emailAddress, password) as CognitoUser;
        return user;
    }

    public async getAWSTemporaryCreds(user: CognitoUser){
        const cognitoIdentityPool = `cognito-idp.${config.REGION}.amazonaws.com/${config.USER_POOL_ID}`;
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: config.IDENTITY_POOL_ID,
            Logins: {
                [cognitoIdentityPool]: user.getSignInUserSession()!.getIdToken().getJwtToken()

            }
        }, {
            region: config.REGION
        });
        await this.refreshCredentials();
    }

    private async refreshCredentials(): Promise<void>{
        return new Promise((resolve, reject)=>{
          (AWS.config.credentials as Credentials).refresh(err =>{
              if (err) {
                  reject(err)
              } else {
                  resolve()
              }
          });
        })
    }
}