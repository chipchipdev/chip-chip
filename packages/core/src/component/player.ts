import { Observable, Subject, Subscription } from 'rxjs';
import {
  PlayerAbstract, PlayerActionEnum,
  PlayerInitiator,
  PlayerInteractive,
} from '../base';
import { PlayerAction } from './action';

class Player extends PlayerAbstract<PlayerAction>
  implements PlayerInteractive<Player, PlayerAction> {
  constructor(private initiator: PlayerInitiator) {
    super(initiator);
  }

  getPlayer(): {
    id: string;
    name: string;
    chips: number;
    joined?: boolean;
    folded?: boolean;
    allin?: boolean;
    optioned?: boolean;
    bet?: boolean;
    action?: PlayerAction;
    validActions: PlayerActionEnum[]
  } {
    return {
      id: this.id,
      name: this.name,
      chips: this.chips,
      joined: this.joined,
      folded: this.folded,
      allin: this.allin,
      bet: this.bet,
      optioned: this.optioned,
      action: this.action,
      validActions: this.validActions,
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
    this.optioned = optioned;
    this.onOptionedStateChangeObservable.next({
      optioned,
      player: this,
    });
  }

  setAction(action: PlayerAction) {
    this.action = action;
    this.onActionChangeObservable.next({
      action,
      player: this,
    });
  }

  setValidActions(actions: PlayerActionEnum[]) {
    this.validActions = actions;
    this.onValidActionsChangeObservable.next({
      actions,
      player: this,
    });
  }

  disposableBag: Subscription = new Subscription();

  interactiveCollector: { [key: string]: any }[];

  unsubscribe(): void {
    this.disposableBag.unsubscribe();
  }

  onChipsChangeObservable: Subject<{ chips: number; player: Player }> = new Subject();

  onJoinedStateChangeObservable: Subject<{
    joined: boolean;
    player: Player;
  }> = new Subject();

  onFoldedStateChangeObservable: Subject<{
    folded: boolean;
    player: Player;
  }> = new Subject();

  onAllinStateChangeObservable: Subject<{
    allin: boolean;
    player: Player;
  }> = new Subject();

  onBetStateChangeObservable: Subject<{
    bet: boolean;
    player: Player;
  }> = new Subject();

  onOptionedStateChangeObservable: Subject<{
    optioned: boolean;
    player: Player;
  }> = new Subject();

  onActionChangeObservable: Subject<{
    action: PlayerAction;
    player: Player;
  }> = new Subject();

  onValidActionsChangeObservable: Subject<{
    actions: PlayerActionEnum[];
    player: Player;
  }> = new Subject();

  onChipsChange: (
    subscription: ({ chips, player }: { chips: number; player: Player }) => void
  ) => Observable<{ chips: number; player: Player }> = (subscription) => {
    const disposable = this.onChipsChangeObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    return this.onChipsChangeObservable;
  };

  onJoinedStateChange: (
    subscription: ({ joined, player }: { joined: boolean; player: Player }) => void
  ) => Observable<{ joined: boolean; player: Player }> = (subscription) => {
    const disposable = this.onJoinedStateChangeObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    return this.onJoinedStateChangeObservable;
  };

  onFoldedStateChange: (
    subscription: ({ folded, player }: { folded: boolean; player: Player }) => void
  ) => Observable<{ folded: boolean; player: Player }> = (subscription) => {
    const disposable = this.onFoldedStateChangeObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    return this.onFoldedStateChangeObservable;
  };

  onAllinStateChange: (
    subscription: ({ allin, player }: { allin: boolean; player: Player }) => void
  ) => Observable<{ allin: boolean; player: Player }> = (subscription) => {
    const disposable = this.onAllinStateChangeObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    return this.onAllinStateChangeObservable;
  };

  onBetStateChange: (
    subscription: ({ bet, player }: { bet: boolean; player: Player }) => void
  ) => Observable<{ bet: boolean; player: Player }> = (subscription) => {
    const disposable = this.onBetStateChangeObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    return this.onBetStateChangeObservable;
  };

  onOptionedStateChange: (
    subscription: ({
      optioned,
      player,
    }: {
      optioned: boolean;
      player: Player;
    }) => void
  ) => Observable<{ optioned: boolean; player: Player }> = (subscription) => {
    const disposable = this.onOptionedStateChangeObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    return this.onOptionedStateChangeObservable;
  };

  onActionChange: (
    subscription: ({
      action,
      player,
    }: {
      action: PlayerAction;
      player: Player;
    }) => void
  ) => Observable<{ action: PlayerAction; player: Player }> = (subscription) => {
    const disposable = this.onActionChangeObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    return this.onActionChangeObservable;
  };

  onValidActionsChange: (
    subscription: ({
      actions,
      player,
    }: {
      actions: PlayerActionEnum[];
      player: Player;
    }) => void
  ) => Observable<{ actions: PlayerActionEnum[]; player: Player }> = (subscription) => {
    const disposable = this.onValidActionsChangeObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    return this.onValidActionsChangeObservable;
  };
}

export { Player };
