import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { GasService } from './gas.service';
import { CreateGasDto } from './dto/create-gas.dto';
import { UpdateGasDto } from './dto/update-gas.dto';

@Controller('gas')
export class GasController {
  constructor(private readonly gasService: GasService) {}

  @Post()
  create(@Body() createGasDto: CreateGasDto) {
    return this.gasService.create(createGasDto);
  }

  @Get()
  findAll() {
    return this.gasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGasDto: UpdateGasDto) {
    return this.gasService.update(+id, updateGasDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gasService.remove(+id);
  }
}
