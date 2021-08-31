import {
  HandAbstract, HandInteractive, RoundStateEnum, PlayerActionEnum,
} from '@chip-chip/schema';
import {
  asyncScheduler, concatMap, from, mergeMap, Observable, scheduled, Subject, Subscription, takeUntil,
} from 'rxjs';
import { isFunction } from 'lodash';
import { HandStatus } from '@chip-chip/schema/lib/base';
import { Player } from './player';
import { Pool } from './pool';
import { Round } from './round';
import { PlayerAction } from './action';

export class Hand
  extends HandAbstract<Pool<Hand, Round<Hand>>, Hand, Round<Hand>, Player, PlayerAction>
  implements HandInteractive<Hand, Round<PlayerAction>> {
  onPlay: (subscription: ({ hand, round }:
  { hand: Hand; round: Round<PlayerAction>; }) => void)
  => Observable<{ hand: Hand; round: Round<PlayerAction>; }>;

  playing: Subject<boolean> = new Subject();

  start(): Observable<boolean> {
    this.players.forEach((player) => {
      const { chips } = player.getPlayer();
      player.setJoined(chips > 0);
      player.setFolded(!(chips > 0));
      player.setAllin(false);
      player.setBet(false);
    });

    const participants = this.players.filter((player) => {
      const { folded } = player.getPlayer();
      return !folded;
    });

    this.pool.createPot(participants, 0);

    from([
      RoundStateEnum.PRE_FLOP,
      RoundStateEnum.FLOP,
      RoundStateEnum.TURN,
      RoundStateEnum.RIVER,
    ])
      .pipe(
        takeUntil(this.playing),
        concatMap((round) => this.play(round)),
      )
      .subscribe((status) => {
        if (status.completed) {
          this.pool.endHand(status);
          this.end();
        }
      });
    return this.playing;
  }

  end() {
    this.playing.next(false);
    this.playing.complete();
  }

  play(round: RoundStateEnum): Observable<HandStatus<Player>> {
    const nextRound = new Round({
      players: this.players,
      position: this.position,
      pool: this.pool,
      wager: this.wager,
      channel: this.channel,
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

    this.round?.unsubscribe();

    this.round = nextRound;

    return this.round.play(round);
  }

  interactiveCollector: { [key: string]: any; }[] = [];

  disposableBag: Subscription = new Subscription();

  unsubscribe(): void {
    // throw new Error('Method not implemented.');
  }

  onStartObservable: Subject<{ hand: Hand }>;

  onEndObservable: Subject<{ hand: Hand }>;

  onPlayObservable: Subject<{ hand: Hand; round: Round<PlayerAction> }>;

  onEnd(subscription: ({ hand }:
  { hand: Hand }) => void):
    Observable<{ hand: Hand }> {
    return undefined;
  }

  onStart(subscription: ({ hand }:
  { hand: Hand }) => void):
    Observable<{ hand: Hand }> {
    return undefined;
  }

  private getNextPlayerIndexAfterSpecificIndex(position: number) {
    let player: Player;
    let index = position;

    do {
      index = (index + 1) % this.players.length;
      player = this.players[index];
    } while (!player?.getPlayer?.().joined || player?.getPlayer?.().folded);

    return index;
  }
}
