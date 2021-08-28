import { MatchAbstract, MatchInteractive } from '@chip-chip/schema';
import {
  asyncScheduler,
  BehaviorSubject,
  mergeMap,
  Observable,
  of,
  repeat,
  scheduled,
  Subject,
  Subscription,
  takeWhile,
} from 'rxjs';

import { isFunction } from 'lodash';
import { Player } from './player';

import { Hand } from './hand';
import { Round } from './round';
import { Pool } from './pool';

export class Match<PlayerAction>
  extends MatchAbstract<Pool, Hand<PlayerAction>,
  Round<PlayerAction>, Player<PlayerAction>, PlayerAction>
  implements MatchInteractive<Match<PlayerAction>, Hand<PlayerAction>> {
  playing: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  start(position?: number) {
    this.position = position ?? this.position ?? Math.floor(Math.random() * this.players.length);

    scheduled(of(true), asyncScheduler)
      .pipe(
        takeWhile(() => this.playing.value),
        mergeMap(() => this.play()),
        repeat(),
      )
      .subscribe();

    this.playing.next(true);
  }

  pause() {
    this.playing.next(false);
  }

  play(): Observable<boolean> {
    this.position = (this.position + 1) % this.players.length;

    const nextHand = new Hand<Pool, Round, PlayerAction>({
      players: this.players,
      position: this.position,
      pool: this.pool,
      wager: this.wager,
      channel: this.channel,
      chips: this.chips,
    });

    const previousInteractiveCollector = this.hand?.interactiveCollector?.length > 0
      ? this.hand.interactiveCollector
      : undefined;

    previousInteractiveCollector.forEach((interaction) => {
      const key = Object.keys(interaction)[0];
      if (isFunction(nextHand[key])) {
        nextHand[key].call(nextHand, interaction[key]);
      }
    });

    this.hand.unsubscribe();

    this.hand = nextHand;

    return this.hand.play();
  }

  end() {
    this.playing.next(false);
  }

  interactiveCollector: { [key: string]: any; }[] = [];

  disposableBag: Subscription = new Subscription();

  unsubscribe(): void {
    this.disposableBag.unsubscribe();
    this.interactiveCollector = [];
  }

  onStartObservable: Subject<{ match: Match<PlayerAction> }>;

  onPauseObservable: Subject<{ match: Match<PlayerAction> }>;

  onEndObservable: Subject<{ match: Match<PlayerAction> }>;

  onPlayObservable: Subject<{
    match: Match<PlayerAction>;
    hand: Hand<PlayerAction> }>;

  onStart(subscription: ({ match }:
  { match: Match<PlayerAction> }) => void):
    Observable<{ match: Match<PlayerAction> }> {
    return undefined;
  }

  onPause(subscription: ({ match }:
  { match: Match<PlayerAction> }) => void):
    Observable<{ match: Match<PlayerAction> }> {
    return undefined;
  }

  onPlay(subscription: ({ match, hand }:
  { match: Match<PlayerAction>;
    hand: Hand<PlayerAction> }) => void):
    Observable<{ match: Match<PlayerAction>;
      hand: Hand<PlayerAction> }> {
    return undefined;
  }

  onEnd(subscription: ({ match }:
  { match: Match<PlayerAction> }) => void):
    Observable<{ match: Match<PlayerAction> }> {
    return undefined;
  }
}
