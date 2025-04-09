//src\auth\dto\login.dto.ts

/* eslint-disable @typescript-eslint/no-unsafe-call */

import { ApiProperty } from '@nestjs/swagger';

export class LoginAuthDto {
  @ApiProperty()
  email: string;
  @ApiProperty()
  password: string;
}
