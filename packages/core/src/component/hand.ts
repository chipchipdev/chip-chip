import {
  HandAbstract,
  HandInteractive,
  RoundStateEnum,
} from '@chip-chip/schema';
import {
  BehaviorSubject,
  concatMap,
  from,
  Observable,
  Subject,
  Subscription,
  takeWhile,
} from 'rxjs';
import { isFunction } from 'lodash';
import { HandStatus } from '@chip-chip/schema/lib/base';
import { ShowdownEnum } from '@chip-chip/schema/lib/base/showdown.abstract';
import { Player } from './player';
import { Pool } from './pool';
import { Round } from './round';
import { PlayerAction, PlayerShowDownAction } from './action';
import { Showdown } from './showdown';

export class Hand
  extends HandAbstract<Pool<Hand, Round<Hand>>, Hand, Round<Hand>, Player, PlayerAction | PlayerShowDownAction>
  implements HandInteractive<Hand, Round<Hand>> {
  status: BehaviorSubject<HandStatus<Player>> = new BehaviorSubject({
    winners: [],
    completed: false,
  });

  round = {
    interactiveCollector: [],
    onDeal: (subscription) => this.round.interactiveCollector.push({ onDeal: subscription }),
    onMonitor: (subscription) => this.round.interactiveCollector.push({ onMonitor: subscription }),
    onPlay: (subscription) => this.round.interactiveCollector.push({ onPlay: subscription }),
    onEnd: (subscription) => this.round.interactiveCollector.push({ onEnd: subscription }),
    unsubscribe() {},
  } as unknown as Round<Hand>;

  getRound() {
    return this.round;
  }

  start(): Observable<HandStatus<Player>> {
    this.players.forEach((player) => {
      const { chips } = player.getPlayer();
      player.setJoined(chips > 0);
      player.setFolded(!(chips > 0));
      player.setAllin(false);
      player.setBet(false);
    });

    const participants = this.players.filter((player) => {
      const { joined } = player.getPlayer();
      return joined;
    });

    this.pool.createPot(participants, 0);

    from([
      RoundStateEnum.PRE_FLOP,
      RoundStateEnum.FLOP,
      RoundStateEnum.TURN,
      RoundStateEnum.RIVER,
      // go to the showdown turn
      ShowdownEnum.SHOWDOWN,
    ])
      .pipe(
        takeWhile(() => !this.status.getValue().completed),
        concatMap((round) => {
          if (Object.values(RoundStateEnum).includes(round)) {
            return this.play(round as RoundStateEnum);
          }
          return new Showdown({
            players: this.players,
            channel: this.channel as Observable<PlayerShowDownAction>,
          }).play(this.status);
        }),
      )
      .subscribe();

    this.status.subscribe((status) => {
      if (status.completed) {
        this.pool.endHand(status);
        this.end();
      }
    });

    this.onStartObservable.next({
      hand: this,
    });

    return this.status;
  }

  end() {
    this.status.complete();
    this.status.unsubscribe();

    this.onEndObservable.next({ hand: this });
  }

  play(round: RoundStateEnum): Observable<HandStatus<Player>> {
    const nextRound = new Round({
      players: this.players,
      position: this.position,
      pool: this.pool,
      wager: this.wager,
      channel: this.channel as Observable<PlayerAction>,
      chips: this.chips,
    });

    const previousInteractiveCollector = this.round?.interactiveCollector?.length > 0
      ? this.round.interactiveCollector
      : undefined;

    previousInteractiveCollector?.forEach((interaction) => {
      const key = Object.keys(interaction)[0];
      if (isFunction(nextRound[key])) {
        nextRound[key].call(nextRound, interaction[key]);
      }
    });

    this.round?.unsubscribe?.();
    this.round?.end?.();

    this.round = nextRound;

    this.onPlayObservable.next({
      hand: this,
      round: nextRound,
      is: round,
    });

    return this.round.play(round, this.status);
  }

  interactiveCollector: { [key: string]: any; }[] = [];

  disposableBag: Subscription = new Subscription();

  unsubscribe(): void {
    this.disposableBag.unsubscribe();
  }

  onShowdownObservable: Observable<{ hand: Hand; }> = new Subject();

  onStartObservable: Subject<{ hand: Hand }> = new Subject();

  onEndObservable: Subject<{ hand: Hand }> = new Subject();

  onPlayObservable: Subject<{ hand: Hand; round: Round<Hand>, is: RoundStateEnum }> = new Subject();

  onStart:
  (subscription: ({ hand }: { hand: Hand; }) => void)
  => Observable<{ hand: Hand; }> = (subscription) => {
    const disposable = this.onStartObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    return this.onStartObservable;
  };

  onEnd:
  (subscription: ({ hand }: { hand: Hand; }) => void)
  => Observable<{ hand: Hand; }> = (subscription) => {
    const disposable = this.onEndObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    return this.onEndObservable;
  };

  onPlay: (subscription: ({ hand, round, is }:
  { hand: Hand; round: Round<Hand>; is: RoundStateEnum; }) => void)
  => Observable<{ hand: Hand; round: Round<Hand>; is: RoundStateEnum; }> = (subscription) => {
    const disposable = this.onPlayObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    return this.onPlayObservable;
  };

  onShowdown:
  (subscription: ({ hand }: { hand: Hand; }) => void)
  => Observable<{ hand: Hand; }> = (subscription) => {
    const disposable = this.onShowdownObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    return this.onEndObservable;
  };
}
