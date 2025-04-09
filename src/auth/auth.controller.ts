// src\auth\auth.controller.ts

/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    Controller,
    Post,
    Body,
  } from '@nestjs/common';
  import { AuthService } from './auth.service';
  import { LoginAuthDto } from './dto/login.dto';
  import { RegisterAuthDto } from './dto/register.dto';
  
  @Controller('auth')
  export class AuthController {
    constructor(private readonly authService: AuthService) {}
  
    @Post('login')
    login(@Body() loginDto: LoginAuthDto) {
      return this.authService.login(loginDto);
    }
  
    @Post('register')
    register(@Body() registerDto: RegisterAuthDto) {
      return this.authService.register(registerDto);
    }
  
    // Nuevo endpoint para confirmar email
    @Post('confirm')
    confirmEmail(@Body() confirmDto: { email: string; code: string }) {
      return this.authService.confirmEmail(confirmDto.email, confirmDto.code);
    }
  
    // Nuevo endpoint para reenviar código
    @Post('resend-code')
    resendCode(@Body() resendDto: { email: string }) {
      return this.authService.resendConfirmationCode(resendDto.email);
    }
  }