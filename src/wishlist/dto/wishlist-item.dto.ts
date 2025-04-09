// backend\src\wishlist\dto\wishlist-item.dto.ts

import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WishlistItemDto {
  @ApiProperty()
  @IsString()
  productName: string; // Cambiamos productId por productName
}