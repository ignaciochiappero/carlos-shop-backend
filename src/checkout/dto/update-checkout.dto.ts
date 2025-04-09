import { PartialType } from '@nestjs/mapped-types';
import { CheckoutDto } from './create-checkout.dto';

export class UpdateCheckoutDto extends PartialType(CheckoutDto) {}
