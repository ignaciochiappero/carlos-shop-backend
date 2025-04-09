//backend\src\cart\dto\cart-item.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min } from 'class-validator';

export class CartItemDto {
  @ApiProperty()
  @IsString()
  productName: string; // Cambiamos productId por productName

  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number;
}