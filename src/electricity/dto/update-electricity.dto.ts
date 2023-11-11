import { PartialType } from '@nestjs/mapped-types';
import { CreateElectricityDto } from './create-electricity.dto';

export class UpdateElectricityDto extends PartialType(CreateElectricityDto) {}
