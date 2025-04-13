// src/user/user.controller.ts

import {
  Controller,
  Get,
  Patch,
  Body,
  Req,
  UseGuards,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Endpoint endpoint público para testing (temporal)
  @Get('test-profile')
  getTestProfile() {
    try {
      // Datos de prueba para verificar que la ruta funciona
      return {
        id: "test-id",
        email: "test@example.com",
        userName: "TestUser",
        role: "USER",
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error en test-profile:', error);
      throw new InternalServerErrorException('Error al obtener perfil de prueba');
    }
  }

  // Endpoint protegido para perfil de usuario
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getUserProfile(@Req() req) {
    try {
      // Primero, verifica que req.user existe
      if (!req.user || !req.user.sub) {
        console.error('No se encontró información de usuario en el request');
        throw new NotFoundException('Usuario no encontrado');
      }

      console.log('Buscando perfil para usuario con sub:', req.user.sub);
      
      // Obtener el usuario por su cognitoId (sub)
      const user = await this.userService.getUserByCognitoId(req.user.sub);
      
      // Devolver datos del usuario sin información sensible
      return {
        id: user.id,
        email: user.email,
        userName: user.userName,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al obtener perfil de usuario');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateUserProfile(@Req() req, @Body() updateData: { userName: string }) {
    try {
      if (!req.user || !req.user.sub) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // Obtener el usuario por su cognitoId (sub)
      const user = await this.userService.getUserByCognitoId(req.user.sub);
      
      // Actualizar solo el nombre de usuario
      const updatedUser = await this.userService.updateUser(user.id, {
        userName: updateData.userName
      });
      
      // Devolver datos actualizados
      return {
        id: updatedUser.id,
        email: updatedUser.email,
        userName: updatedUser.userName,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      };
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar perfil de usuario');
    }
  }
}