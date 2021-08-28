import {
  PlayerAbstract,
  PlayerInitiator,
  PlayerInteractive,
} from '@chip-chip/schema';
import { Observable, Subject, Subscription } from 'rxjs';

class Player<PlayerAction>
  extends PlayerAbstract<PlayerAction>
  implements PlayerInteractive<Player<PlayerAction>, PlayerAction> {
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
    this.onChipsChangeObservable.next({
      chips,
      player: this,
    });
  }

  setJoined(joined: boolean) {
    this.joined = joined;
    this.onJoinedStateChangeObservable.next({
      joined,
      player: this,
    });
  }

  setFolded(folded: boolean) {
    this.folded = folded;
    this.onFoldedStateChangeObservable.next({
      folded,
      player: this,
    });
  }

  setAllin(allin: boolean) {
    this.allin = allin;
    this.onAllinStateChangeObservable.next({
      allin,
      player: this,
    });
  }

  setBet(bet: boolean) {
    this.bet = bet;
    this.onBetStateChangeObservable.next({
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

  disposableBag: Subscription = new Subscription();

  interactiveCollector: { [key: string]: any; }[];

  unsubscribe(): void {
    throw new Error('Method not implemented.');
  }

  onChipsChangeObservable: Subject<{ chips: number; player: Player<PlayerAction>; }>
  = new Subject();

  onJoinedStateChangeObservable: Subject<{ joined: boolean; player: Player<PlayerAction>; }>
  = new Subject();

  onFoldedStateChangeObservable: Subject<{ folded: boolean; player: Player<PlayerAction>; }>
  = new Subject();

  onAllinStateChangeObservable: Subject<{ allin: boolean; player: Player<PlayerAction>; }>
  = new Subject();

  onBetStateChangeObservable: Subject<{ bet: boolean; player: Player<PlayerAction>; }>
  = new Subject();

  onOptionedStateChangeObservable: Subject<{ optioned: boolean; player: Player<PlayerAction>; }>
  = new Subject();

  onActionChangeObservable: Subject<{ action: PlayerAction; player: Player<PlayerAction>; }>
  = new Subject();

  onChipsChange: (subscription: ({ chips, player }:
  { chips: number; player: Player<PlayerAction>; }) => void)
  => Observable<{ chips: number; player: Player<PlayerAction>; }>
  = (subscription) => {
    const disposable = this.onChipsChangeObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    return this.onChipsChangeObservable;
  };

  onJoinedStateChange: (subscription: ({ joined, player }:
  { joined: boolean; player: Player<PlayerAction>; }) => void)
  => Observable<{ joined: boolean; player: Player<PlayerAction>; }>
  = (subscription) => {
    const disposable = this.onJoinedStateChangeObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    return this.onJoinedStateChangeObservable;
  };

  onFoldedStateChange: (subscription: ({ folded, player }:
  { folded: boolean; player: Player<PlayerAction>; }) => void)
  => Observable<{ folded: boolean; player: Player<PlayerAction>; }>
  = (subscription) => {
    const disposable = this.onFoldedStateChangeObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    return this.onFoldedStateChangeObservable;
  };

  onAllinStateChange: (subscription: ({ allin, player }:
  { allin: boolean; player: Player<PlayerAction>; }) => void)
  => Observable<{ allin: boolean; player: Player<PlayerAction>; }>
  = (subscription) => {
    const disposable = this.onAllinStateChangeObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    return this.onAllinStateChangeObservable;
  };

  onBetStateChange: (subscription: ({ bet, player }:
  { bet: boolean; player: Player<PlayerAction>; }) => void)
  => Observable<{ bet: boolean; player: Player<PlayerAction>; }>
  = (subscription) => {
    const disposable = this.onBetStateChangeObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    return this.onBetStateChangeObservable;
  };

  onOptionedStateChange: (subscription: ({ optioned, player }:
  { optioned: boolean; player: Player<PlayerAction>; }) => void)
  => Observable<{ optioned: boolean; player: Player<PlayerAction>; }>
  = (subscription) => {
    const disposable = this.onOptionedStateChangeObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    return this.onOptionedStateChangeObservable;
  };

  onActionChange: (subscription: ({ action, player }:
  { action: PlayerAction; player: Player<PlayerAction>; }) => void)
  => Observable<{ action: PlayerAction; player: Player<PlayerAction>; }>
  = (subscription) => {
    const disposable = this.onActionChangeObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    return this.onActionChangeObservable;
  };
}

export {
  Player,
};
