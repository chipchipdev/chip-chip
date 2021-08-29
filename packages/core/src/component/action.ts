import { PlayerActionEnum } from '@chip-chip/schema/lib';

export type PlayerAction = {
  id?: string
  type: PlayerActionEnum
  amount?: number
};
