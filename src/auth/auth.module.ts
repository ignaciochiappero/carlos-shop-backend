// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { CognitoModule } from 'src/cognito/cognito.module';
import { CognitoService } from 'src/cognito/cognito.service';
import { UserModule } from 'src/user/user.module';
import { PrismaModule } from 'src/prismaendpoint/prisma.module';
import { JwtCustomModule } from './jwt/jwt.module';

@Module({
  imports: [
    CognitoModule,
    PrismaModule,
    UserModule,
    JwtCustomModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, CognitoService],
})
export class AuthModule {}