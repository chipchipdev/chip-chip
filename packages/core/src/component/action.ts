import { PlayerActionEnum, PlayerShowDownActionEnum, CroupierActionEnum } from '../base';

export type CroupierAction<PlayerUnscheduled> = {
  id: string
  type: CroupierActionEnum,
  payload?:
  CroupierActionArrangePlayer<PlayerUnscheduled>
  | CroupierActionReorder
  | CroupierActionStart
};

export type CroupierActionArrangePlayer<PlayerUnscheduled> = PlayerUnscheduled;

export type CroupierActionReorder = {
  id: string;
  index: number;
};

export type CroupierActionStart = {
  wager: number;
};

export type PlayerAction = {
  id?: string
  type: PlayerActionEnum
  amount?: number
};

export type PlayerShowDownAction = {
  id: string,
  type: PlayerShowDownActionEnum
};
