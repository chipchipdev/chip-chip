import { PoolAbstract } from '@chip-chip/schema/lib';

import { Hand } from './hand';
import { Round } from './round';
import { Player } from './player';

export class Pool<PlayerAction, Pot, HandStatus> extends PoolAbstract<
Pool<PlayerAction, Pot, HandStatus>,
Hand<PlayerAction>,
Round<PlayerAction>,
Player<PlayerAction>,
PlayerAction,
Pot,
HandStatus
> {
  calculateChips(player: Player<PlayerAction>, action: PlayerAction) {
  }

  calculateOutcome(pot: Pot) {
  }

  createPot(participants: Player<PlayerAction>[], amount: number) {
  }

  createSidePot(player: Player<PlayerAction>) {
  }

  endHand() {
  }

  endRound() {
  }

  playRound() {
  }

  update(player: Player<PlayerAction>, action: PlayerAction) {
  }

  validate(player: Player<PlayerAction>, action: PlayerAction, actionMap: { [p: string]: PlayerAction }) {
  }
}
