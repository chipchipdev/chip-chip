import { PlayerActionEnum, PlayerShowDownActionEnum } from '@chip-chip/schema/lib';

export type PlayerAction = {
  id?: string
  type: PlayerActionEnum
  amount?: number
};

export type PlayerShowDownAction = {
  id: string,
  type: PlayerShowDownActionEnum
};
