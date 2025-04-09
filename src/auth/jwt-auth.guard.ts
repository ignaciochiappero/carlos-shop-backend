//src\auth\jwt-auth.guard.ts

/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as jwkToPem from 'jwk-to-pem';
import fetch from 'node-fetch';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private cognitoJwks: any = null;
  private cognitoIssuer: string;
  private cognitoUserPoolId: string;
  private cognitoRegion: string;

  constructor(private jwtService: JwtService) {
    this.cognitoRegion = process.env.AWS_REGION || 'us-east-1';
    this.cognitoUserPoolId = process.env.COGNITO_USER_POOL_ID || '';
    this.cognitoIssuer = `https://cognito-idp.${this.cognitoRegion}.amazonaws.com/${this.cognitoUserPoolId}`;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      // Decodificar el token sin verificar para obtener el kid
      const decodedToken: any = jwt.decode(token, { complete: true });
      if (!decodedToken) {
        throw new UnauthorizedException('Invalid token');
      }

      // Obtener los JWKs si aún no los tenemos
      if (!this.cognitoJwks) {
        await this.fetchCognitoJwks();
      }

      // Encontrar el JWK correcto usando el kid
      const jwk = this.cognitoJwks.keys.find(
        (key: any) => key.kid === decodedToken.header.kid
      );

      if (!jwk) {
        throw new UnauthorizedException('Invalid token signature');
      }

      // Convertir JWK a PEM
      const pem = jwkToPem(jwk);

      // Verificar el token
      const verified: any = jwt.verify(token, pem, {
        issuer: this.cognitoIssuer,
        algorithms: ['RS256'],
      });

      // Agregar el usuario decodificado a la solicitud
      request.user = {
        sub: verified.sub,
        email: verified.email,
        username: verified['cognito:username'],
      };

      return true;
    } catch (error) {
      console.error('Token verification failed:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private async fetchCognitoJwks() {
    try {
      const response = await fetch(
        `${this.cognitoIssuer}/.well-known/jwks.json`
      );
      this.cognitoJwks = await response.json();
    } catch (error) {
      console.error('Error fetching Cognito JWKs:', error);
      throw new UnauthorizedException('Error validating token');
    }
  }
}