//backend\src\products\product.service.ts

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prismaendpoint/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CloudinaryService } from '../files/files.service';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      // Crear una copia limpia del DTO
      const productData = { ...createProductDto };

      // Crear el producto
      const product = await this.prisma.product.create({
        data: productData,
      });

      return product;
    } catch (error) {
      console.error('Error creating product:', error);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2000') {
          throw new BadRequestException('The URL of the image is too long');
        }
      }
      throw error;
    }
  }

  async findAll() {
    try {
      const products = await this.prisma.product.findMany();

      // Mapear manualmente para convertir null a string vacía
      return products.map((product) => ({
        ...product,
        image: product.image || '', // Convertir null a string vacío
      }));
    } catch (error) {
      console.error('Error searching products:', error);
      // Devolver array vacío en caso de error
      return [];
    }
  }

  async findOne(id: string) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        throw new NotFoundException(`Product with the ID ${id} does not found`);
      }

      // Convertir null a string vacía
      return {
        ...product,
        image: product.image || '',
      };
    } catch (error) {
      console.error(`Error searching the product ${id}:`, error);
      throw error;
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      // Si hay un campo image y es null o undefined, establecerlo como string vacía
      const dataToUpdate = {
        ...updateProductDto,
        image: updateProductDto.image || '',
      };

      return await this.prisma.product.update({
        where: { id },
        data: dataToUpdate,
      });
    } catch (error) {
      throw new NotFoundException(`Product with the ID ${id} does not found`);
    }
  }

  async remove(id: string) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        throw new NotFoundException(`Product with the ID ${id} does not found`);
      }

      // Si el producto tiene una imagen, eliminarla de Cloudinary
      if (product.image) {
        try {
          // Extraemos el public_id del url o directamente si es el id
          const publicId = this.extractCloudinaryPublicId(product.image);
          if (publicId) {
            await this.cloudinaryService.deleteFile(publicId);
          }
        } catch (error) {
          console.error(`Error deleting image from Cloudinary:`, error);
          // Continuamos con la eliminación del producto incluso si falla la eliminación de la imagen
        }
      }

      return await this.prisma.product.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Product with the ID ${id} does not found`);
    }
  }

  // Extraer el public_id de Cloudinary de una URL
  private extractCloudinaryPublicId(url: string): string | null {
    if (!url) return null;

    try {
      // Si ya es un public_id directo
      if (!url.includes('http')) {
        return url;
      }

      // Si es una URL de Cloudinary, intentar extraer el public_id
      // Ejemplo de URL: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/image_name.jpg
      const matches = url.match(/\/v\d+\/([^/]+\/[^.]+)/);
      if (matches && matches[1]) {
        return matches[1];
      }
      return null;
    } catch (error) {
      console.error('Error extracting Cloudinary public ID:', error);
      return null;
    }
  }

  // Métodos adicionales que podrían ser útiles
  async searchProducts(searchTerm: string) {
    return this.prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm } },
          { description: { contains: searchTerm } },
        ],
      },
    });
  }

  async findByPriceRange(minPrice: number, maxPrice: number) {
    return this.prisma.product.findMany({
      where: {
        AND: [{ price: { gte: minPrice } }, { price: { lte: maxPrice } }],
      },
    });
  }
}
