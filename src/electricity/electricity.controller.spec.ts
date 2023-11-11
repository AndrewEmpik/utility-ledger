import { Test, TestingModule } from '@nestjs/testing';
import { ElectricityController } from './electricity.controller';
import { ElectricityService } from './electricity.service';

describe('ElectricityController', () => {
  let controller: ElectricityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ElectricityController],
      providers: [ElectricityService],
    }).compile();

    controller = module.get<ElectricityController>(ElectricityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
