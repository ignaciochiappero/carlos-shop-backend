//backend\src\wishlist\wishlist.controller.ts

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { WishlistItemDto } from './dto/wishlist-item.dto';

@ApiTags('wishlist')
@ApiBearerAuth()
@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post('add')
  @ApiOperation({ summary: 'Añadir producto a la lista de deseos' })
  @ApiResponse({ status: 201, description: 'Producto añadido exitosamente' })
  async addToWishlist(
    @Req() req: any,
    @Body() wishlistItemDto: WishlistItemDto,
  ) {
    try {
      const userId = req.user.sub;
      return await this.wishlistService.addToWishlist(
        userId,
        wishlistItemDto.productName,
      );
    } catch (error) {
      throw new HttpException(
        'Error al añadir a la lista de deseos',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Obtener lista de deseos del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Lista de deseos obtenida exitosamente',
  })
  async getWishlist(@Req() req: any) {
    try {
      const userId = req.user.sub;
      return await this.wishlistService.getWishlist(userId);
    } catch (error) {
      throw new HttpException(
        'Error al obtener la lista de deseos',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('remove/:productName')
  @ApiOperation({ summary: 'Eliminar producto de la lista de deseos' })
  @ApiResponse({ status: 200, description: 'Producto eliminado exitosamente' })
  async removeFromWishlist(
    @Req() req: any,
    @Param('productName') productName: string,
  ) {
    try {
      const userId = req.user.sub;
      return await this.wishlistService.removeFromWishlist(userId, productName);
    } catch (error) {
      throw new HttpException(
        'Error al eliminar de la lista de deseos',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('check/:productName')
  @ApiOperation({
    summary: 'Verificar si un producto está en la lista de deseos',
  })
  @ApiResponse({ status: 200, description: 'Verificación exitosa' })
  async checkInWishlist(
    @Req() req: any,
    @Param('productName') productName: string,
  ) {
    try {
      const userId = req.user.sub;
      return await this.wishlistService.isInWishlist(userId, productName);
    } catch (error) {
      throw new HttpException(
        'Error al verificar producto',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Vaciar la lista de deseos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de deseos vaciada exitosamente',
  })
  async clearWishlist(@Req() req: any) {
    try {
      const userId = req.user.sub;
      return await this.wishlistService.clearWishlist(userId);
    } catch (error) {
      throw new HttpException(
        'Error al vaciar la lista de deseos',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
