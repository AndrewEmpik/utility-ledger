import { Test, TestingModule } from '@nestjs/testing';
import { GasController } from './gas.controller';
import { GasService } from './gas.service';

describe('GasController', () => {
  let controller: GasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GasController],
      providers: [GasService],
    }).compile();

    controller = module.get<GasController>(GasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
