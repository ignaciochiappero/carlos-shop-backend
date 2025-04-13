/* eslint-disable @typescript-eslint/no-unsafe-call */
//backend\src\cart\cart.controller.ts

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
  Put,
  Query,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CartItemDto } from './dto/cart-item.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('cart')
@ApiBearerAuth()
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get cart items' })
  @ApiResponse({
    status: 200,
    description: 'Cart items retrieved successfully',
  })
  @ApiQuery({
    name: 'productName',
    required: false,
    description: 'Product name to check in cart',
  })
  async getCartItems(
    @Req() req: any,
    @Query('productName') productName?: string,
  ) {
    try {
      const userId = req.user.sub;
      if (productName) {
        return await this.cartService.getCart(productName);
      }
      return await this.cartService.getCart(productName);
    } catch (error) {
      this.handleError(error, 'retrieving the cart items');
    }
  }
  handleError(error: any, arg1: string) {
    throw new Error('Method not implemented.');
  }

  @Post()
  @ApiOperation({ summary: 'Add product to cart' })
  @ApiResponse({
    status: 200,
    description: 'Product added to cart successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  async addToCart(@Req() req: any, @Body() cartItemDto: CartItemDto) {
    try {
      const userId = req.user.sub;
      return await this.cartService.addToCart(
        userId,
        cartItemDto.productName,
        cartItemDto.quantity,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error adding to cart',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put()
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiResponse({
    status: 200,
    description: 'Cart item quantity updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  async updateCartItem(@Req() req: any, @Body() cartItemDto: CartItemDto) {
    try {
      const userId = req.user.sub;
      return await this.cartService.updateCartItemQuantity(
        userId,
        cartItemDto.productName,
        cartItemDto.quantity,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error updating cart item',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  @Delete(':productName')
  @ApiOperation({ summary: 'Remove product from cart' })
  @ApiResponse({
    status: 200,
    description: 'Product removed from cart successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  async removeFromCart(
    @Req() req: any,
    @Body() { productName }: { productName: string },
  ) {
    try {
      const userId = req.user.sub;
      return await this.cartService.removeFromCart(userId, productName);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error removing from cart',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  @Delete()
  @ApiOperation({ summary: 'Clear cart' })
  @ApiResponse({
    status: 200,
    description: 'Cart cleared successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  async clearCart(@Req() req: any) {
    try {
      const userId = req.user.sub;
      return await this.cartService.clearCart(userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error clearing cart',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // changes
  /*@Post('add')
  @ApiOperation({ summary: 'Agregar producto al carrito' })
  async addToCart(@Req() req: any, @Body() cartItemDto: CartItemDto) {
    try {
      const userId = req.user.sub; // Usar sub del token como userId
      return await this.cartService.addToCart(
        userId,
        cartItemDto.productName,
        cartItemDto.quantity,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al agregar al carrito',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Obtener carrito' })
  async getCart(@Req() req: any) {
    const userId = req.user.sub;
    return this.cartService.getCart(userId);
  }

  @Put('update')
  @ApiOperation({ summary: 'Actualizar cantidad en el carrito' })
  async updateCartItem(@Req() req: any, @Body() cartItemDto: CartItemDto) {
    try {
      const userId = req.user.sub;
      return await this.cartService.updateCartItemQuantity(
        userId,
        cartItemDto.productName,
        cartItemDto.quantity,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al actualizar el carrito',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('remove')
  @ApiOperation({ summary: 'Eliminar producto del carrito' })
  async removeFromCart(
    @Req() req: any,
    @Body() { productName }: { productName: string },
  ) {
    try {
      const userId = req.user.sub;
      return await this.cartService.removeFromCart(userId, productName);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al eliminar del carrito',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Vaciar carrito' })
  async clearCart(@Req() req: any) {
    try {
      const userId = req.user.sub;
      return await this.cartService.clearCart(userId);
    } catch (error) {
      throw new HttpException(
        'Error al vaciar el carrito',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
    */
}
