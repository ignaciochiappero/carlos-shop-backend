// backend\src\wishlist\dto\wishlist-item.dto.ts

import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WishlistItemDto {
  @ApiProperty()
  @IsString()
  productName: string; // Cambiamos productId por productName

  @ApiProperty({ description: 'Product ID to add to wishlist' })
  @IsNotEmpty()
  @IsString()
  productId: string;
}
