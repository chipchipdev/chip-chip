import { Observable, Subject, Subscription } from 'rxjs';
import { isFunction } from 'lodash';
import {
  CroupierAbstract,
  CroupierActionEnum,
  CroupierInitiator,
  CroupierInteractive,
  CroupierScheduledStage,
} from '../base';
import { Match } from './match';
import { Player } from './player';
import { Pool } from './pool';
import { Hand } from './hand';
import { Round } from './round';
import {
  CroupierAction,
  CroupierActionReorder, CroupierActionSetChips, CroupierActionSetId, CroupierActionSetOwner,
  CroupierActionStart,
  PlayerAction,
  PlayerShowDownAction,
} from './action';

export class Croupier<PlayerUnscheduled extends { id: string, name: string }>
  extends CroupierAbstract<
  PlayerUnscheduled,
  Player,
  Match,
  CroupierAction<PlayerUnscheduled> | PlayerAction | PlayerShowDownAction
  >
  implements CroupierInteractive<
  Croupier<PlayerUnscheduled>,
  PlayerUnscheduled,
  Match
  > {
  constructor(
    initiator: CroupierInitiator<
    CroupierAction<PlayerUnscheduled> | PlayerAction | PlayerShowDownAction>,
  ) {
    super(initiator);

    this.stage = CroupierScheduledStage.PREPARING;
    this.disposableBag.add(this.channel.subscribe((action: CroupierAction<PlayerUnscheduled>) => {
      // croupier preset actions
      switch (action.type) {
        case CroupierActionEnum.SET_CROUPIER_ID:
          if ((action.payload as CroupierActionSetId).id) {
            this.setId((action.payload as CroupierActionSetId).id);
          }
          return;
        case CroupierActionEnum.SET_OWNER:
          if (
            (action.payload as CroupierActionSetOwner<PlayerUnscheduled>).id
              && (action.payload as CroupierActionSetOwner<PlayerUnscheduled>).name
              && !this.owner?.id
              && !this.owner?.name
          ) {
            this.setOwner(action.payload as CroupierActionSetOwner<PlayerUnscheduled>);
            this.arrange(action.payload as CroupierActionSetOwner<PlayerUnscheduled>);
          }
          return;
        default:
          break;
      }

      if (action.id !== this.owner.id) return;

      switch (action.type) {
        case CroupierActionEnum.SET_CHIPS:
          if ((action.payload as CroupierActionSetChips).chips > 100) {
            this.setChips((action.payload as CroupierActionSetChips).chips);
          }
          break;
        case CroupierActionEnum.ARRANGE:
          if (
            (action.payload as PlayerUnscheduled).id
              && (action.payload as PlayerUnscheduled).name
          ) {
            this.arrange(action.payload as PlayerUnscheduled);
          }
          break;
        case CroupierActionEnum.REORDER:
          // eslint-disable-next-line no-case-declarations
          const payload = action.payload! as CroupierActionReorder;
          // eslint-disable-next-line no-case-declarations
          const player = this.players.find((p) => payload.id === p.id);
          if (
            (payload as CroupierActionReorder).id
            && typeof (payload as CroupierActionReorder).index === 'number'
              && (payload as CroupierActionReorder).index >= 0
              && player
          ) {
            this.reorder(
              player,
              (action.payload as CroupierActionReorder).index,
            );
          }
          break;
        case CroupierActionEnum.START:
          if (
            typeof (action.payload as CroupierActionStart).wager === 'number'
              && (action.payload as CroupierActionStart).wager > 0
              && this.players.length > 2
          ) {
            this.start((action.payload as CroupierActionStart).wager);
          }
          break;
        case CroupierActionEnum.RESTART:
          if (
            typeof (action.payload as CroupierActionStart).wager === 'number'
              && (action.payload as CroupierActionStart).wager > 0
              && this.players.length > 2
          ) {
            this.restart((action.payload as CroupierActionStart).wager);
          }
          break;
        case CroupierActionEnum.PAUSE:
          this.pause();
          break;
        case CroupierActionEnum.END:
          this.end();
          break;
        default:
          break;
      }
    }));
  }

  protected playersInGame: Player[] = [];

  protected match: Match = {
    interactiveCollector: [],
    onStart: (subscription) => this.match.interactiveCollector
      .push({ onStart: subscription }),
    onPlay: (subscription) => this.match.interactiveCollector
      .push({ onPlay: subscription }),
    onPause: (subscription) => this.match.interactiveCollector
      .push({ onPause: subscription }),
    onEnd: (subscription) => this.match.interactiveCollector
      .push({ onEnd: subscription }),
    hand: {
      interactiveCollector: [],
      round: {
        interactiveCollector: [],
        onDeal: (subscription) => this.match.hand.round.interactiveCollector
          .push({ onDeal: subscription }),
        onMonitor: (subscription) => this.match.hand.round.interactiveCollector
          .push({ onMonitor: subscription }),
        onPlay: (subscription) => this.match.hand.round.interactiveCollector
          .push({ onPlay: subscription }),
        onEnd: (subscription) => this.match.hand.round.interactiveCollector
          .push({ onEnd: subscription }),
        unsubscribe() {},
      },
      onStart: (subscription) => this.match.hand.interactiveCollector
        .push({ onStart: subscription }),
      onPlay: (subscription) => this.match.hand.interactiveCollector
        .push({ onPlay: subscription }),
      onEnd: (subscription) => this.match.hand.interactiveCollector
        .push({ onEnd: subscription }),
      onShowdown: (subscription) => this.match.hand.interactiveCollector
        .push({ onShowdown: subscription }),
      unsubscribe() {},
    } as unknown as Hand,
    unsubscribe() {},
  } as unknown as Match;

  getCroupier(): {
    id: string; owner: PlayerUnscheduled; stage: CroupierScheduledStage;
    players: PlayerUnscheduled[]; match?: Match; playersInGame: Player[]
  } {
    return {
      id: this.id,
      owner: this.owner,
      stage: this.stage,
      players: this.players,
      match: this.match,
      playersInGame: this.playersInGame,
    };
  }

  protected arrange(player: PlayerUnscheduled) {
    this.players.push(player);
    this.onArrangeObservable.next({
      player,
      croupier: this,
    });
  }

  protected reorder(player: PlayerUnscheduled, index: number) {
    if (!Reflect.has(player, 'id')) return;
    if (!this.players[index]) return;

    const reorderIndex = this.players.findIndex((p) => p.id === player.id);

    if (!reorderIndex) return;

    const reorderPlayers = this.players.splice(reorderIndex, 1);
    const backPlayers = this.players.splice(index);

    this.players = [
      ...this.players,
      ...reorderPlayers,
      ...backPlayers,
    ];

    this.onReorderObservable.next({
      players: this.players,
      croupier: this,
    });
  }

  protected start(wager: number) {
    const players = this.players?.map((p) => new Player(
      { name: p.name, id: p.id, chips: this.chips },
    ));

    this.playersInGame = players;

    const pool = new Pool<Hand, Round<Hand>>({
      players: players.filter(() => true),
      chips: this.chips,
      wager,
      channel: this.channel as Observable<PlayerAction | PlayerShowDownAction>,
    });

    const nextMatch = new Match({
      players,
      pool,
      wager,
      chips: this.chips,
      channel: this.channel as Observable<PlayerAction | PlayerShowDownAction>,
    });

    nextMatch.hand = this.match.hand;

    const previousInteractiveCollector = this.match?.interactiveCollector?.length > 0
      ? this.match.interactiveCollector
      : undefined;

    previousInteractiveCollector?.forEach((interaction) => {
      const key = Object.keys(interaction)[0];
      if (isFunction(nextMatch[key])) {
        nextMatch[key].call(nextMatch, interaction[key]);
      }
    });

    this.match?.unsubscribe();

    this.match = nextMatch;

    this.onStartObservable.next({
      croupier: this,
      match: nextMatch,
    });
    this.stage = CroupierScheduledStage.PLAYING;

    this.match.start();
  }

  protected restart(wager: number) {
    const players = this.players.map((player) => {
      const previousIndex = this.playersInGame
        .findIndex((p) => p.getPlayer().id === player.id);
      if (previousIndex >= 0) return this.playersInGame[previousIndex];
      return new Player({ name: player.name, id: player.id, chips: this.chips });
    });

    this.playersInGame = players;

    const pool = new Pool<Hand, Round<Hand>>({
      players: players.filter(() => true),
      chips: this.chips,
      wager,
      channel: this.channel as Observable<PlayerAction | PlayerShowDownAction>,
    });

    const nextMatch = new Match({
      players,
      pool,
      wager,
      chips: this.chips,
      channel: this.channel as Observable<PlayerAction | PlayerShowDownAction>,
    });

    nextMatch.hand = this.match.hand;

    const previousInteractiveCollector = this.match?.interactiveCollector?.length > 0
      ? this.match.interactiveCollector
      : undefined;

    previousInteractiveCollector?.forEach((interaction) => {
      const key = Object.keys(interaction)[0];
      if (isFunction(nextMatch[key])) {
        nextMatch[key].call(nextMatch, interaction[key]);
      }
    });

    this.match?.unsubscribe();

    this.match = nextMatch;
    this.stage = CroupierScheduledStage.PLAYING;

    this.match.start();
  }

  protected pause() {
    this.match.end?.();
    this.onPauseObservable.next({
      croupier: this,
      match: this.match,
    });
    this.stage = CroupierScheduledStage.PAUSING;
  }

  protected end() {
    this.match.end?.();
    this.onEndObservable.next({
      croupier: this,
      match: this.match,
    });
    this.stage = CroupierScheduledStage.ENDED;
  }

  disposableBag: Subscription = new Subscription();

  unsubscribe(): void {
    this.disposableBag.unsubscribe();
  }

  onArrangeObservable:
  Subject<{ player: PlayerUnscheduled; croupier: Croupier<PlayerUnscheduled>; }>
  = new Subject();

  onReorderObservable:
  Subject<{ players: PlayerUnscheduled[]; croupier: Croupier<PlayerUnscheduled>; }>
  = new Subject();

  onStartObservable:
  Subject<{ match: Match; croupier: Croupier<PlayerUnscheduled>; }>
  = new Subject();

  onRestartObservable:
  Subject<{ match: Match; croupier: Croupier<PlayerUnscheduled>; }>
  = new Subject();

  onPauseObservable:
  Subject<{ match: Match; croupier: Croupier<PlayerUnscheduled>; }>
  = new Subject();

  onEndObservable:
  Subject<{ match: Match; croupier: Croupier<PlayerUnscheduled>; }>
  = new Subject();

  onArrange: (subscription: ({ player, croupier }:
  { player: PlayerUnscheduled; croupier: Croupier<PlayerUnscheduled>; }) => void)
  => Observable<{ player: PlayerUnscheduled; croupier: Croupier<PlayerUnscheduled> }>
  = (subscription) => {
    const disposable = this.onArrangeObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    return this.onArrangeObservable;
  };

  onReorder: (subscription: ({ players, croupier }:
  { players: PlayerUnscheduled[]; croupier: Croupier<PlayerUnscheduled>; }) => void)
  => Observable<{ players: PlayerUnscheduled[]; croupier: Croupier<PlayerUnscheduled> }>
  = (subscription) => {
    const disposable = this.onReorderObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    return this.onReorderObservable;
  };

  onStart: (subscription: ({ match, croupier }:
  { match: Match; croupier: Croupier<PlayerUnscheduled>; }) => void)
  => Observable<{ match: Match; croupier: Croupier<PlayerUnscheduled> }>
  = (subscription) => {
    const disposable = this.onStartObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    return this.onStartObservable;
  };

  onRestart: (subscription: ({ match, croupier }:
  { match: Match; croupier: Croupier<PlayerUnscheduled>; }) => void)
  => Observable<{ match: Match; croupier: Croupier<PlayerUnscheduled> }>
  = (subscription) => {
    const disposable = this.onRestartObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    return this.onRestartObservable;
  };

  onPause: (subscription: ({ match, croupier }:
  { match: Match; croupier: Croupier<PlayerUnscheduled>; }) => void)
  => Observable<{ match: Match; croupier: Croupier<PlayerUnscheduled> }>
  = (subscription) => {
    const disposable = this.onPauseObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    return this.onPauseObservable;
  };

  onEnd: (subscription: ({ match, croupier }:
  { match: Match; croupier: Croupier<PlayerUnscheduled>; }) => void)
  => Observable<{ match: Match; croupier: Croupier<PlayerUnscheduled> }>
  = (subscription) => {
    const disposable = this.onEndObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    return this.onEndObservable;
  };

  onChipsSet(subscription: ({
    chips,
    croupier,
  }:
  { chips: number; croupier: Croupier<PlayerUnscheduled> }) => void):
    Observable<{ chips: number; croupier: Croupier<PlayerUnscheduled> }> {
    const disposable = this.onChipsSetObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    return this.onChipsSetObservable;
  }

  onChipsSetObservable:
  Subject<{ chips: number; croupier: Croupier<PlayerUnscheduled> }> = new Subject();

  onIdSet(subscription: ({
    id,
    croupier,
  }:
  { id: string; croupier: Croupier<PlayerUnscheduled> }) => void):
    Observable<{ id: string; croupier: Croupier<PlayerUnscheduled> }> {
    const disposable = this.onIdSetObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    return this.onIdSetObservable;
  }

  onIdSetObservable:
  Subject<{ id: string; croupier: Croupier<PlayerUnscheduled> }> = new Subject();

  onOwnerSet(subscription: ({
    owner,
    croupier,
  }:
  { owner: PlayerUnscheduled; croupier: Croupier<PlayerUnscheduled> }) => void):
    Observable<{ owner: PlayerUnscheduled; croupier: Croupier<PlayerUnscheduled> }> {
    const disposable = this.onOwnerSetObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    return this.onOwnerSetObservable;
  }

  onOwnerSetObservable:
  Subject<{ owner: PlayerUnscheduled; croupier: Croupier<PlayerUnscheduled> }> = new Subject();

  protected setChips(chips: number) {
    this.chips = chips;
    this.onChipsSetObservable.next({
      chips,
      croupier: this,
    });
  }

  protected setId(id: string) {
    this.id = id;
    this.onIdSetObservable.next({ id, croupier: this });
  }

  protected setOwner(player: PlayerUnscheduled) {
    this.owner = player;
    this.onOwnerSetObservable.next({
      owner: player,
      croupier: this,
    });
  }
}
