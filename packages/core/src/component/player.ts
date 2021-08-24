import {
  PlayerAbstract,
  PlayerAction,
  PlayerInitiator,
  PlayerInteractive,
} from '@chip-chip/schema';
import { Subject } from 'rxjs';

class Player extends PlayerAbstract<PlayerAction> implements PlayerInteractive<Player> {
  constructor(private initiator: PlayerInitiator) {
    super(initiator);
  }

  onChipsChange = new Subject<Player>();

  getPlayer(): {
    id: string; name: string; chips: number;
    joined?: boolean; folded?: boolean; allin?: boolean; optioned?: boolean;
    action?: PlayerAction
  } {
    return {
      id: this.id,
      name: this.name,
      chips: this.chips,
    };
  }

  setChips(chips: number) {
    this.chips = chips;
    this.onChipsChange.next(this);
  }

  setJoined(joined: boolean) {
    throw new Error('Method not implemented.');
  }

  setFolded(folded: boolean) {
    throw new Error('Method not implemented.');
  }

  setAllin(folded: boolean) {
    throw new Error('Method not implemented.');
  }

  setBet(folded: boolean) {
    throw new Error('Method not implemented.');
  }

  setOptioned(folded: boolean) {
    throw new Error('Method not implemented.');
  }

  setAction(action: PlayerAction) {
    throw new Error('Method not implemented.');
  }
}

export {
  Player,
};
