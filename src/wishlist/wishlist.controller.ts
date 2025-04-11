//backend\src\wishlist\wishlist.controller.ts

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
  @ApiOperation({ summary: 'Add product to wishlist' })
  @ApiResponse({ status: 201, description: 'Product successfully added' })
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
      if (error.status && error.message) {
        throw new HttpException(error.message, error.status);
      }
      throw new HttpException(
        'An error occurred while adding the product to the wishlist',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get user wishlist' })
  @ApiResponse({
    status: 200,
    description: 'Wishlist successfully retrieved',
  })
  async getWishlist(@Req() req: any) {
    try {
      const userId = req.user.sub;
      return await this.wishlistService.getWishlist(userId);
    } catch (error) {
      if (error.status && error.message) {
        throw new HttpException(error.message, error.status);
      }
      throw new HttpException(
        'An error occurred while retrieving the wishlist',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('remove/:productName')
  @ApiOperation({ summary: 'Remove product from wishlist' })
  @ApiResponse({ status: 200, description: 'Product successfully removed' })
  async removeFromWishlist(
    @Req() req: any,
    @Param('productName') productName: string,
  ) {
    try {
      const userId = req.user.sub;
      return await this.wishlistService.removeFromWishlist(userId, productName);
    } catch (error) {
      if (error.status && error.message) {
        throw new HttpException(error.message, error.status);
      }
      throw new HttpException(
        'An error occurred while removing the product from the wishlist',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('check/:productName')
  @ApiOperation({
    summary: 'Check if a product is in the wishlist',
  })
  @ApiResponse({ status: 200, description: 'Check successful' })
  async checkInWishlist(
    @Req() req: any,
    @Param('productName') productName: string,
  ) {
    try {
      const userId = req.user.sub;
      return await this.wishlistService.isInWishlist(userId, productName);
    } catch (error) {
      if (error.status && error.message) {
        throw new HttpException(error.message, error.status);
      }
      throw new HttpException(
        'An error occurred while checking the product in the wishlist',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Clear the wishlist' })
  @ApiResponse({
    status: 200,
    description: 'Wishlist successfully cleared',
  })
  async clearWishlist(@Req() req: any) {
    try {
      const userId = req.user.sub;
      return await this.wishlistService.clearWishlist(userId);
    } catch (error) {
      if (error.status && error.message) {
        throw new HttpException(error.message, error.status);
      }
      throw new HttpException(
        'An error occurred while clearing the wishlist',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
