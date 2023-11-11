import { Test, TestingModule } from '@nestjs/testing';
import { ElectricityService } from './electricity.service';

describe('ElectricityService', () => {
  let service: ElectricityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ElectricityService],
    }).compile();

    service = module.get<ElectricityService>(ElectricityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
