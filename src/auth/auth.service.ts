// src/auth/auth.service.ts

import { Injectable } from '@nestjs/common';
import { LoginAuthDto } from './dto/login.dto';
import { RegisterAuthDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { CognitoService } from 'src/cognito/cognito.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private cognitoService: CognitoService,
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async register(registerDto: RegisterAuthDto) {
    // Registramos en Cognito
    const cognitoResult = await this.cognitoService.registerUser(
      registerDto.email,
      registerDto.userName,
      registerDto.password,
    );

    // Creamos el usuario en nuestra base de datos
    await this.userService.createUser({
      email: registerDto.email,
      userName: registerDto.userName,
      password: 'cognito-managed', // No almacenamos la contraseña real
      cognitoId: cognitoResult.userSub ?? 'unknown-cognito-id',
    });

    return cognitoResult;
  }

  async confirmEmail(email: string, code: string) {
    return await this.cognitoService.confirmSignUp(email, code);
  }

  async resendConfirmationCode(email: string) {
    return await this.cognitoService.resendConfirmationCode(email);
  }

  async login(loginDto: LoginAuthDto) {
    try {
      const authResult = await this.cognitoService.loginUser(
        loginDto.email,
        loginDto.password,
      );

      // Obtener el usuario de nuestra base de datos
      const user = await this.userService.getUserByEmail(loginDto.email);

      if (!user) {
        throw new Error('User not found');
      }

      return {
        ...authResult,
        user: {
          id: user.id,
          email: user.email,
          userName: user.userName,
          role: user.role,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Invalid credentials');
    }
  }
}