// backend\src\products\products.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role } from '../decorators/role.enum';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('products')
@Controller('products')
@UseGuards(RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo producto' })
  @ApiResponse({ status: 201, description: 'Producto creado exitosamente' })
  create(@Body() createProductDto: CreateProductDto) {
    // Asegurarse de que createProductDto esté correctamente validado
    // No es necesario hacer validaciones adicionales aquí, ya que los decoradores
    // en el DTO se encargan de ello
    console.log('Received product data:', JSON.stringify(createProductDto));
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los productos' })
  @ApiResponse({ status: 200, description: 'Lista de productos' })
  findAll() {
    return this.productsService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar productos por término' })
  @ApiResponse({ status: 200, description: 'Resultados de la búsqueda' })
  searchProducts(@Query('term') searchTerm: string) {
    return this.productsService.searchProducts(searchTerm);
  }

  @Get('price-range')
  @ApiOperation({ summary: 'Buscar productos por rango de precio' })
  @ApiResponse({ status: 200, description: 'Productos en el rango de precio' })
  findByPriceRange(
    @Query('min') minPrice: number,
    @Query('max') maxPrice: number,
  ) {
    return this.productsService.findByPriceRange(minPrice, maxPrice);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un producto por ID' })
  @ApiResponse({ status: 200, description: 'Producto encontrado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un producto' })
  @ApiResponse({ status: 200, description: 'Producto actualizado' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  //@Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un producto' })
  @ApiResponse({ status: 200, description: 'Producto eliminado' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
