import { CognitoService } from './cognito.service';
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
  InitiateAuthCommand,
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand,
} from '@aws-sdk/client-cognito-identity-provider';

jest.mock('@aws-sdk/client-cognito-identity-provider');

describe('CognitoService', () => {
  let cognitoService: CognitoService;
  let mockCognitoClient: jest.Mocked<CognitoIdentityProviderClient>;

  beforeEach(() => {
    // Suppress console.error messages
    jest.spyOn(console, 'error').mockImplementation(() => {});

    mockCognitoClient = new CognitoIdentityProviderClient(
      {},
    ) as jest.Mocked<CognitoIdentityProviderClient>;
    cognitoService = new CognitoService();
    cognitoService['cognitoClient'] = mockCognitoClient;
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear all mocks after each test
    jest.restoreAllMocks(); // Restore console.error mock
  });

  describe('registerUser', () => {
    it('should register a user successfully', async () => {
      const mockResponse = { UserSub: '12345' };
      mockCognitoClient.send = jest.fn().mockResolvedValue(mockResponse);

      const result = await cognitoService.registerUser(
        'test@example.com',
        'testuser',
        'password123',
        'USER',
      );

      expect(mockCognitoClient.send).toHaveBeenCalledWith(
        expect.any(SignUpCommand),
      );
      expect(result).toEqual({
        success: true,
        message:
          'Registration successful. Please check your email for the verification code.',
        userSub: '12345',
      });
    });

    it('should throw an error when registration fails', async () => {
      mockCognitoClient.send = jest.fn().mockRejectedValue(new Error('Error'));

      await expect(
        cognitoService.registerUser(
          'test@example.com',
          'testuser',
          'password123',
          'USER',
        ),
      ).rejects.toThrow('Failed to register user: Error');
    });
  });

  describe('confirmSignUp', () => {
    it('should confirm sign-up successfully', async () => {
      mockCognitoClient.send = jest.fn().mockResolvedValue({});

      const result = await cognitoService.confirmSignUp(
        'test@example.com',
        '123456',
      );

      expect(mockCognitoClient.send).toHaveBeenCalledWith(
        expect.any(ConfirmSignUpCommand),
      );
      expect(result).toEqual({
        success: true,
        message: 'Email successfully verified',
      });
    });

    it('should throw an error when confirmation fails', async () => {
      mockCognitoClient.send = jest.fn().mockRejectedValue(new Error('Error'));

      await expect(
        cognitoService.confirmSignUp('test@example.com', '123456'),
      ).rejects.toThrow('Failed to confirm registration: Error');
    });
  });

  describe('resendConfirmationCode', () => {
    it('should resend the confirmation code successfully', async () => {
      mockCognitoClient.send = jest.fn().mockResolvedValue({});

      const result =
        await cognitoService.resendConfirmationCode('test@example.com');

      expect(mockCognitoClient.send).toHaveBeenCalledWith(
        expect.any(ResendConfirmationCodeCommand),
      );
      expect(result).toEqual({
        success: true,
        message: 'Verification code successfully resent',
      });
    });

    it('should throw an error when resending fails', async () => {
      mockCognitoClient.send = jest.fn().mockRejectedValue(new Error('Error'));

      await expect(
        cognitoService.resendConfirmationCode('test@example.com'),
      ).rejects.toThrow('Failed to resend code: Error');
    });
  });

  describe('loginUser', () => {
    it('should log in a user successfully', async () => {
      const mockResponse = {
        AuthenticationResult: {
          AccessToken: 'accessToken',
          IdToken: 'idToken',
          RefreshToken: 'refreshToken',
          ExpiresIn: 3600,
        },
      };
      mockCognitoClient.send = jest.fn().mockResolvedValue(mockResponse);

      const result = await cognitoService.loginUser(
        'test@example.com',
        'password123',
      );

      expect(mockCognitoClient.send).toHaveBeenCalledWith(
        expect.any(InitiateAuthCommand),
      );
      expect(result).toEqual({
        access_token: 'accessToken',
        id_token: 'idToken',
        refresh_token: 'refreshToken',
        expires_in: 3600,
      });
    });

    it('should throw an error when login fails', async () => {
      mockCognitoClient.send = jest.fn().mockRejectedValue(new Error('Error'));

      await expect(
        cognitoService.loginUser('test@example.com', 'password123'),
      ).rejects.toThrow('Invalid Credentials');
    });
  });

  describe('updateUserRole', () => {
    it('should update the user role successfully', async () => {
      mockCognitoClient.send = jest.fn().mockResolvedValue({});

      const result = await cognitoService.updateUserRole(
        'test@example.com',
        'ADMIN',
      );

      expect(mockCognitoClient.send).toHaveBeenCalledWith(
        expect.any(AdminUpdateUserAttributesCommand),
      );
      expect(result).toEqual({
        success: true,
        message: 'User role updated successfully',
      });
    });

    it('should throw an error when updating role fails', async () => {
      mockCognitoClient.send = jest.fn().mockRejectedValue(new Error('Error'));

      await expect(
        cognitoService.updateUserRole('test@example.com', 'ADMIN'),
      ).rejects.toThrow('Failed to update user role: Error');
    });
  });

  describe('getUserByEmail', () => {
    it('should get user details successfully', async () => {
      const mockResponse = {
        Username: 'testuser',
        UserStatus: 'CONFIRMED',
        Enabled: true,
        UserAttributes: [
          { Name: 'email', Value: 'test@example.com' },
          { Name: 'custom:role', Value: 'USER' },
        ],
      };
      mockCognitoClient.send = jest.fn().mockResolvedValue(mockResponse);

      const result = await cognitoService.getUserByEmail('test@example.com');

      expect(mockCognitoClient.send).toHaveBeenCalledWith(
        expect.any(AdminGetUserCommand),
      );
      expect(result).toEqual({
        username: 'testuser',
        status: 'CONFIRMED',
        enabled: true,
        email: 'test@example.com',
        'custom:role': 'USER',
      });
    });

    it('should return null when user retrieval fails', async () => {
      mockCognitoClient.send = jest.fn().mockRejectedValue(new Error('Error'));

      const result = await cognitoService.getUserByEmail('test@example.com');

      expect(result).toBeNull();
    });
  });
});
