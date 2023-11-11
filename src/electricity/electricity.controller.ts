import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ElectricityService } from './electricity.service';
import { CreateElectricityDto } from './dto/create-electricity.dto';
import { UpdateElectricityDto } from './dto/update-electricity.dto';

@Controller('electricity')
export class ElectricityController {
  constructor(private readonly electricityService: ElectricityService) {}

  @Post()
  create(@Body() createElectricityDto: CreateElectricityDto) {
    return this.electricityService.create(createElectricityDto);
  }

  @Get()
  findAll() {
    return this.electricityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.electricityService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateElectricityDto: UpdateElectricityDto) {
    return this.electricityService.update(+id, updateElectricityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.electricityService.remove(+id);
  }
}
