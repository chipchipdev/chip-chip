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
import {
  HandAbstract,
  HandInteractive,
  RoundStateEnum,
  HandStatus, ShowdownEnum,
} from '../base';
import { Player } from './player';
import { Pool } from './pool';
import { Round } from './round';
import { PlayerAction, PlayerShowDownAction } from './action';
import { Showdown } from './showdown';

export class Hand
  extends HandAbstract<Pool<Hand, Round<Hand>>,
  Hand,
  Round<Hand>,
  Showdown,
  Player,
  PlayerAction | PlayerShowDownAction>
  implements HandInteractive<Hand, Round<Hand>> {
  status: BehaviorSubject<HandStatus<Player>> = new BehaviorSubject({
    winners: [],
    completed: false,
  });

  public round = {
    interactiveCollector: [],
    onDeal: (subscription) => this.round.interactiveCollector.push({ onDeal: subscription }),
    onMonitor: (subscription) => this.round.interactiveCollector.push({ onMonitor: subscription }),
    onPlay: (subscription) => this.round.interactiveCollector.push({ onPlay: subscription }),
    onEnd: (subscription) => this.round.interactiveCollector.push({ onEnd: subscription }),
    unsubscribe() {
    },
  } as unknown as Round<Hand>;

  public showdown = {
    interactiveCollector: [],
    onDeal: (subscription) => this.showdown.interactiveCollector.push({ onDeal: subscription }),
    onPlay: (subscription) => this.showdown.interactiveCollector.push({ onPlay: subscription }),
    onEnd: (subscription) => this.showdown.interactiveCollector.push({ onEnd: subscription }),
    unsubscribe() {
    },
  } as unknown as Showdown;

  start(): Observable<HandStatus<Player>> {
    this.onStartObservable.next({
      hand: this,
    });

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

    const rounds = from([
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
          this.onShowdownObservable.next({
            hand: this,
          });
          this.round?.unsubscribe();
          this.round?.end();

          const nextShowdown = new Showdown({
            players: this.players,
            channel: this.channel as Observable<PlayerShowDownAction>,
          });

          const previousInteractiveCollector = this.showdown?.interactiveCollector?.length > 0
            ? this.showdown.interactiveCollector
            : undefined;

          previousInteractiveCollector?.forEach((interaction) => {
            const key = Object.keys(interaction)[0];
            if (isFunction(nextShowdown[key])) {
              nextShowdown[key].call(nextShowdown, interaction[key]);
            }
          });

          this.showdown?.unsubscribe();

          this.showdown = nextShowdown;

          return this.showdown.play(this.status);
        }),
      )
      .subscribe();

    this.disposableBag.add(rounds);

    this.disposableBag.add(this.status.subscribe((status) => {
      if (status.completed) {
        this.pool.endHand(status);
        this.end();
      }
    }));

    return this.status;
  }

  end() {
    this.onEndObservable.next({ hand: this });
    this.status.complete();
    this.status.unsubscribe();
    // this.unsubscribe();
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

    return this.round.play.call(this.round, round, this.status);
  }

  interactiveCollector: { [key: string]: any; }[] = [];

  disposableBag: Subscription = new Subscription();

  unsubscribe(): void {
    this.disposableBag.unsubscribe();
  }

  onShowdownObservable: Subject<{ hand: Hand; }> = new Subject();

  onStartObservable: Subject<{ hand: Hand }> = new Subject();

  onEndObservable: Subject<{ hand: Hand }> = new Subject();

  onPlayObservable: Subject<{ hand: Hand; round: Round<Hand>, is: RoundStateEnum }> = new Subject();

  onStart:
  (subscription: ({ hand }: { hand: Hand; }) => void)
  => Observable<{ hand: Hand; }> = (subscription) => {
    const disposable = this.onStartObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    this.interactiveCollector.push({ onStart: subscription });
    return this.onStartObservable;
  };

  onEnd:
  (subscription: ({ hand }: { hand: Hand; }) => void)
  => Observable<{ hand: Hand; }> = (subscription) => {
    const disposable = this.onEndObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    this.interactiveCollector.push({ onEnd: subscription });
    return this.onEndObservable;
  };

  onPlay: (subscription: ({ hand, round, is }:
  { hand: Hand; round: Round<Hand>; is: RoundStateEnum; }) => void)
  => Observable<{ hand: Hand; round: Round<Hand>; is: RoundStateEnum; }> = (subscription) => {
    const disposable = this.onPlayObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    this.interactiveCollector.push({ onPlay: subscription });
    return this.onPlayObservable;
  };

  onShowdown:
  (subscription: ({ hand }: { hand: Hand; }) => void)
  => Observable<{ hand: Hand; }> = (subscription) => {
    const disposable = this.onShowdownObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    this.interactiveCollector.push({ onShowdown: subscription });
    return this.onEndObservable;
  };
}
