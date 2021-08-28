import { HandAbstract, HandInteractive } from '@chip-chip/schema';
import { Observable, Subject, Subscription } from 'rxjs';
import { Player } from './player';
import { Pool } from './pool';
import { Round } from './round';

export class Hand<PlayerAction>
  extends HandAbstract<Pool, Hand<PlayerAction>,
  Round<PlayerAction>, Player<PlayerAction>, PlayerAction>
  implements HandInteractive<Hand<PlayerAction>, Round<PlayerAction>> {
  constructor(initiator) {
    super(initiator);
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

    // todo pool create pot
  }

  end() {
  }

  play(): Observable<boolean> {
    return undefined;
  }

  start() {
  }

  interactiveCollector: { [key: string]: any; }[] = [];

  disposableBag: Subscription = new Subscription();

  unsubscribe(): void {
    throw new Error('Method not implemented.');
  }

  onStartObservable: Subject<{ hand: Hand<PlayerAction> }>;

  onEndObservable: Subject<{ hand: Hand<PlayerAction> }>;

  onPlayObservable: Subject<{ hand: Hand<PlayerAction>; round: Round<PlayerAction> }>;

  onEnd(subscription: ({ hand }:
  { hand: Hand<PlayerAction> }) => void):
    Observable<{ hand: Hand<PlayerAction> }> {
    return undefined;
  }

  onPlay(subscription: ({ hand, round }:
  { hand: Hand<PlayerAction>; round: Round }) => void):
    Observable<{ hand: Hand<PlayerAction>; round: Round }> {
    return undefined;
  }

  onStart(subscription: ({ hand }:
  { hand: Hand<PlayerAction> }) => void):
    Observable<{ hand: Hand<PlayerAction> }> {
    return undefined;
  }
}
