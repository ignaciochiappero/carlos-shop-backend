/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// backend/src/wishlist/wishlist.controller.ts

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
  Query,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { WishlistItemDto } from './dto/wishlist-item.dto';

@ApiTags('wishlist')
@ApiBearerAuth()
@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({
    summary: 'Get user wishlist or check if product is in wishlist',
  })
  @ApiResponse({ status: 200, description: 'Wishlist successfully retrieved' })
  @ApiQuery({
    name: 'productId',
    required: false,
    description: 'Product ID to check in wishlist',
  })
  async getWishlist(@Req() req: any, @Query('productId') productId?: string) {
    try {
      const userId = req.user.sub;

      // If productId is provided, check if it's in the wishlist
      if (productId) {
        return await this.wishlistService.isInWishlist(userId, productId);
      }

      // Otherwise, return the entire wishlist
      return await this.wishlistService.getWishlist(userId);
    } catch (error) {
      this.handleError(error, 'retrieving the wishlist');
    }
  }

  @Post()
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
        wishlistItemDto.productId,
      );
    } catch (error) {
      this.handleError(error, 'adding the product to the wishlist');
    }
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove product from wishlist' })
  @ApiResponse({ status: 200, description: 'Product successfully removed' })
  async removeFromWishlist(
    @Req() req: any,
    @Param('productId') productId: string,
  ) {
    try {
      const userId = req.user.sub;
      return await this.wishlistService.removeFromWishlist(userId, productId);
    } catch (error) {
      this.handleError(error, 'removing the product from the wishlist');
    }
  }

  @Delete()
  @ApiOperation({ summary: 'Clear the wishlist' })
  @ApiResponse({ status: 200, description: 'Wishlist successfully cleared' })
  async clearWishlist(@Req() req: any) {
    try {
      const userId = req.user.sub;
      return await this.wishlistService.clearWishlist(userId);
    } catch (error) {
      this.handleError(error, 'clearing the wishlist');
    }
  }

  // Helper method for consistent error handling
  private handleError(error: any, operation: string): never {
    if (error.status && error.message) {
      throw new HttpException(error.message, error.status);
    }
    throw new HttpException(
      `An error occurred while ${operation}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
