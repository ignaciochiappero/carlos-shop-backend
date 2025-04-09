// src/cognito/cognito.service.ts

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Injectable } from '@nestjs/common';
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
  InitiateAuthCommand,
  AdminGetUserCommand,
  AttributeType,
  AdminUpdateUserAttributesCommand,
} from '@aws-sdk/client-cognito-identity-provider';

@Injectable()
export class CognitoService {
  private cognitoClient: CognitoIdentityProviderClient;
  private userPoolId: string;
  private clientId: string;

  constructor() {
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION ?? 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
      },
    });
    this.userPoolId = process.env.COGNITO_USER_POOL_ID ?? '';
    this.clientId = process.env.COGNITO_CLIENT_ID ?? '';
  }

  async registerUser(
    email: string,
    userName: string,
    password: string,
    role: string = 'USER',
  ) {
    try {
      const signUpCommand = new SignUpCommand({
        ClientId: this.clientId,
        Username: email,
        Password: password,
        UserAttributes: [
          {
            Name: 'email',
            Value: email,
          },
          {
            Name: 'custom:userName',
            Value: userName,
          },
          {
            Name: 'custom:role',
            Value: role,
          },
        ],
      });

      const response = await this.cognitoClient.send(signUpCommand);

      return {
        success: true,
        message:
          'Registration successful. Please check your email for the verification code.',
        userSub: response.UserSub,
      };
    } catch (error) {
      console.error('Error registering user:', error);
      throw new Error(`Failed to register user: ${error.message}`);
    }
  }

  async confirmSignUp(email: string, code: string) {
    try {
      const confirmCommand = new ConfirmSignUpCommand({
        ClientId: this.clientId,
        Username: email,
        ConfirmationCode: code,
      });

      await this.cognitoClient.send(confirmCommand);
      return {
        success: true,
        message: 'Email successfully verified',
      };
    } catch (error) {
      console.error('Error confirming registration:', error);
      throw new Error(`Failed to confirm registration: ${error.message}`);
    }
  }

  async resendConfirmationCode(email: string) {
    try {
      const resendCommand = new ResendConfirmationCodeCommand({
        ClientId: this.clientId,
        Username: email,
      });

      await this.cognitoClient.send(resendCommand);
      return {
        success: true,
        message: 'Verification code successfully resent',
      };
    } catch (error) {
      console.error('Error resending code:', error);
      throw new Error(`Failed to resend code: ${error.message}`);
    }
  }

  async loginUser(email: string, password: string) {
    try {
      const authCommand = new InitiateAuthCommand({
        ClientId: this.clientId,
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      });

      const response = await this.cognitoClient.send(authCommand);

      return {
        access_token: response.AuthenticationResult?.AccessToken,
        id_token: response.AuthenticationResult?.IdToken,
        refresh_token: response.AuthenticationResult?.RefreshToken,
        expires_in: response.AuthenticationResult?.ExpiresIn,
      };
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw new Error('Invalid Credentials');
    }
  }

  async updateUserRole(email: string, role: string) {
    try {
      const command = new AdminUpdateUserAttributesCommand({
        UserPoolId: this.userPoolId,
        Username: email,
        UserAttributes: [
          {
            Name: 'custom:role',
            Value: role,
          },
        ],
      });

      await this.cognitoClient.send(command);
      return {
        success: true,
        message: 'User role updated successfully',
      };
    } catch (error) {
      console.error('Error updating user role:', error);
      throw new Error(`Failed to update user role: ${error.message}`);
    }
  }

  async getUserByEmail(email: string) {
    try {
      const getUserCommand = new AdminGetUserCommand({
        UserPoolId: this.userPoolId,
        Username: email,
      });

      const response = await this.cognitoClient.send(getUserCommand);

      const attributes = {};
      response.UserAttributes?.forEach((attr: AttributeType) => {
        if (attr.Name) {
          attributes[attr.Name] = attr.Value;
        }
      });

      return {
        username: response.Username,
        status: response.UserStatus,
        enabled: response.Enabled,
        ...attributes,
      };
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }
}
