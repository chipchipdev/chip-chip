export type Pot<Player, HandStatus> = {
  amount: number;
  participants: Player[];
  status?: HandStatus
};
