import {
  asyncScheduler,
  BehaviorSubject, concatMap,
  Observable,
  of,
  repeat,
  scheduled,
  Subject,
  Subscription,
  takeWhile,
} from 'rxjs';

import { isFunction } from 'lodash';
import { MatchAbstract, MatchInteractive, HandStatus } from '../base';
import { Player } from './player';

import { Hand } from './hand';
import { Round } from './round';
import { Pool } from './pool';
import { PlayerAction, PlayerShowDownAction } from './action';
import { Showdown } from './showdown';

export class Match
  extends MatchAbstract<
  Pool<Hand, Round<Hand>>,
  Hand,
  Round<PlayerAction>,
  Player,
  PlayerAction | PlayerShowDownAction,
  HandStatus<Player>
  >
  implements MatchInteractive<Match, Hand> {
  playing: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  hand = {
    interactiveCollector: [],
    round: {
      interactiveCollector: [],
      onDeal:
          (subscription) => this.hand.round.interactiveCollector.push({ onDeal: subscription }),
      onMonitor:
          (subscription) => this.hand.round.interactiveCollector.push({ onMonitor: subscription }),
      onPlay:
          (subscription) => this.hand.round.interactiveCollector.push({ onPlay: subscription }),
      onEnd:
          (subscription) => this.hand.round.interactiveCollector.push({ onEnd: subscription }),
      unsubscribe() {},
    },
    showdown: {
      interactiveCollector: [],
      onDeal:
          (subscription) => this.hand.showdown.interactiveCollector.push({ onDeal: subscription }),
      onPlay:
          (subscription) => this.hand.showdown.interactiveCollector.push({ onPlay: subscription }),
      onEnd:
          (subscription) => this.hand.showdown.interactiveCollector.push({ onEnd: subscription }),
      unsubscribe() {},
    },
    onStart: (subscription) => this.hand.interactiveCollector.push({ onStart: subscription }),
    onPlay: (subscription) => this.hand.interactiveCollector.push({ onPlay: subscription }),
    onEnd: (subscription) => this.hand.interactiveCollector.push({ onEnd: subscription }),
    onShowdown: (subscription) => this.hand.interactiveCollector.push({ onShowdown: subscription }),
    unsubscribe() {},
  } as unknown as Hand;

  start(position?: number) {
    this.position = (position ?? this.position) ?? Math.floor(Math.random() * this.players.length);

    const match = scheduled(of(true), asyncScheduler)
      .pipe(
        takeWhile(() => this.playing.value === true),
        concatMap(() => this.play()),
        repeat(),
      )
      .subscribe();

    this.disposableBag.add(match);

    this.playing.next(true);
    this.onStartObservable.next({
      match: this,
    });
  }

  pause() {
    this.playing.next(false);
    const disposable = this.playing.subscribe((v) => {
      if (!v) {
        this.onPauseObservable.next({
          match: this,
        });
        disposable.unsubscribe();
      }
    });
  }

  play(): Observable<HandStatus<Player>> {
    this.position = (this.position + 1) % this.players.length;

    const nextHand = new Hand({
      players: this.players,
      position: this.position,
      pool: this.pool,
      wager: this.wager,
      channel: this.channel,
      chips: this.chips,
    });

    nextHand.round = this.hand.round;

    const previousInteractiveCollector = this.hand?.interactiveCollector?.length > 0
      ? this.hand.interactiveCollector
      : undefined;

    previousInteractiveCollector?.forEach((interaction) => {
      const key = Object.keys(interaction)[0];
      if (isFunction(nextHand[key])) {
        nextHand[key].call(nextHand, interaction[key]);
      }
    });

    this.hand?.unsubscribe();

    this.hand = nextHand;

    this.onPlayObservable.next({
      match: this,
      hand: nextHand,
    });

    return this.hand.start();
  }

  end() {
    this.playing.next(false);
    this.playing.complete();
    this.disposableBag.unsubscribe();
    const disposable = this.playing.subscribe((v) => {
      if (!v) {
        this.onPauseObservable.next({
          match: this,
        });
        disposable.unsubscribe();
      }
    });
  }

  interactiveCollector: { [key: string]: any; }[] = [];

  disposableBag: Subscription = new Subscription();

  unsubscribe(): void {
    this.disposableBag.unsubscribe();
    this.interactiveCollector = [];
  }

  onStartObservable: Subject<{ match: Match }> = new Subject();

  onPauseObservable: Subject<{ match: Match }> = new Subject();

  onEndObservable: Subject<{ match: Match }> = new Subject();

  onPlayObservable: Subject<{ match: Match; hand: Hand }> = new Subject();

  onStart(subscription: ({ match }:
  { match: Match }) => void):
    Observable<{ match: Match }> {
    const disposable = this.onStartObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    this.interactiveCollector.push({ onStart: subscription });
    return this.onStartObservable;
  }

  onPause(subscription: ({ match }:
  { match: Match }) => void):
    Observable<{ match: Match }> {
    const disposable = this.onPauseObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    this.interactiveCollector.push({ onPause: subscription });
    return this.onPauseObservable;
  }

  onPlay(subscription: ({ match, hand }:
  { match: Match;
    hand: Hand }) => void):
    Observable<{ match: Match;
      hand: Hand }> {
    const disposable = this.onPlayObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    this.interactiveCollector.push({ onPlay: subscription });
    return this.onPlayObservable;
  }

  onEnd(subscription: ({ match }:
  { match: Match }) => void):
    Observable<{ match: Match }> {
    const disposable = this.onEndObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    this.interactiveCollector.push({ onEnd: subscription });
    return this.onEndObservable;
  }
}
