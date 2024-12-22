import { Decimal } from '@prisma/client/runtime/library';

export type ReadingEntry = { date: string; reading: Decimal; use: Decimal };
export type ReadingsArray = ReadingEntry[];

export enum ModelName {
  GAS = 'rEADINGS_GAS',
  ELECTRICITY = 'rEADINGS_ELECTRICITY',
}
