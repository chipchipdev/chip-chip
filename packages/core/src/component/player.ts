import {
  PlayerAbstract,
  PlayerAction,
  PlayerInitiator,
  PlayerInteractive,
} from '@chip-chip/schema';
import { Subject } from 'rxjs';

class Player
  extends PlayerAbstract<PlayerAction>
  implements PlayerInteractive<Player, PlayerAction> {
  constructor(private initiator: PlayerInitiator) {
    super(initiator);
  }

  getPlayer(): {
    id: string; name: string; chips: number;
    joined?: boolean; folded?: boolean; allin?: boolean; optioned?: boolean; bet?: boolean;
    action?: PlayerAction
  } {
    return {
      id: this.id,
      name: this.name,
      chips: this.chips,
      joined: this.joined,
      folded: this.folded,
      allin: this.allin,
      bet: this.bet,
    };
  }

  setChips(chips: number) {
    this.chips = chips;
    this.onChipsChange.next({
      chips,
      player: this,
    });
  }

  setJoined(joined: boolean) {
    this.joined = joined;
    this.onJoinedStateChange.next({
      joined,
      player: this,
    });
  }

  setFolded(folded: boolean) {
    this.folded = folded;
    this.onFoldedStateChange.next({
      folded,
      player: this,
    });
  }

  setAllin(allin: boolean) {
    this.allin = allin;
    this.onAllinStateChange.next({
      allin,
      player: this,
    });
  }

  setBet(bet: boolean) {
    this.bet = bet;
    this.onBetStateChange.next({
      bet,
      player: this,
    });
  }

  setOptioned(optioned: boolean) {
    throw new Error('Method not implemented.');
  }

  setAction(action: PlayerAction) {
    throw new Error('Method not implemented.');
  }

  onJoinedStateChange = new Subject<{ joined: boolean, player: Player }>();

  onFoldedStateChange = new Subject<{ folded: boolean, player: Player }>();

  onAllinStateChange = new Subject<{ allin: boolean, player: Player }>();

  onBetStateChange = new Subject<{ bet: boolean, player: Player }>();

  onOptionedStateChange = new Subject<{ optioned: boolean, player: Player }>();

  onActionChange = new Subject<{ action: PlayerAction, player: Player }>();

  onChipsChange = new Subject<{ chips: number, player: Player }>();
}

export {
  Player,
};
