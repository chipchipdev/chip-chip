import { PlayerActionEnum, PlayerShowDownActionEnum, CroupierActionEnum } from '../base';

export type CroupierAction<PlayerUnscheduled> = {
  id?: string
  type: CroupierActionEnum,
  payload?:
  CroupierActionArrangePlayer<PlayerUnscheduled>
  | CroupierActionSetChips
  | CroupierActionSetId
  | CroupierActionSetOwner<PlayerUnscheduled>
  | CroupierActionReorder
  | CroupierActionStart
};

export type CroupierActionArrangePlayer<PlayerUnscheduled> = PlayerUnscheduled;

export type CroupierActionReorder = {
  id: string;
  index: number;
};

export type CroupierActionSetChips = {
  chips: number;
};

export type CroupierActionSetOwner<PlayerUnscheduled> = PlayerUnscheduled;

export type CroupierActionSetId = {
  id: string;
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
