import {
  PlayerAbstract,
  PlayerAction,
  PlayerInitiator,
} from '@chip-chip/schema';

class Player extends PlayerAbstract<PlayerAction> {
  constructor(private initiator: PlayerInitiator) { super(initiator); }

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
    throw new Error('Method not implemented.');
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
