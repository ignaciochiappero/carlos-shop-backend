//backend\src\user\user.module.ts

import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaModule } from 'src/prismaendpoint/prisma.module';
import { UserController } from './user.controller';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], // Exportamos UserService para que esté disponible en otros módulos
})
export class UserModule {}