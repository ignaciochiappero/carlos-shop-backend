// backend\src\app.module.ts

import { Module } from '@nestjs/common';
import { PrismaModule } from './prismaendpoint/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CognitoModule } from './cognito/cognito.module';
import { CartModule } from './cart/cart.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { JwtCustomModule } from './auth/jwt/jwt.module';
import { ProductsModule } from './products/products.module';
import { FilesModule } from './files/files.module';
import { ConfigModule } from '@nestjs/config';
import { CouponsModule } from './coupons/coupons.module';
import { CheckoutModule } from './checkout/checkout.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    PrismaModule,
    UserModule,
    AuthModule,
    CognitoModule,
    CartModule,
    WishlistModule,
    JwtCustomModule,
    ProductsModule,
    FilesModule,
    CouponsModule,
    CheckoutModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
