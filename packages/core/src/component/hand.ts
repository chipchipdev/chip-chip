import { HandAbstract, HandInteractive } from '@chip-chip/schema';
import { Observable, Subject, Subscription } from 'rxjs';
import { Player } from './player';

export class Hand<Pool, Round, PlayerAction>
  extends HandAbstract<Pool, Hand<Pool, Round, PlayerAction>,
  Round, Player<PlayerAction>, PlayerAction>
  implements HandInteractive<Hand<Pool, Round, PlayerAction>, Round> {
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

  onStartObservable: Subject<{ hand: Hand<Pool, Round, PlayerAction> }>;

  onEndObservable: Subject<{ hand: Hand<Pool, Round, PlayerAction> }>;

  onPlayObservable: Subject<{ hand: Hand<Pool, Round, PlayerAction>; round: Round }>;

  onEnd(subscription: ({ hand }:
  { hand: Hand<Pool, Round, PlayerAction> }) => void):
    Observable<{ hand: Hand<Pool, Round, PlayerAction> }> {
    return undefined;
  }

  onPlay(subscription: ({ hand, round }:
  { hand: Hand<Pool, Round, PlayerAction>; round: Round }) => void):
    Observable<{ hand: Hand<Pool, Round, PlayerAction>; round: Round }> {
    return undefined;
  }

  onStart(subscription: ({ hand }:
  { hand: Hand<Pool, Round, PlayerAction> }) => void):
    Observable<{ hand: Hand<Pool, Round, PlayerAction> }> {
    return undefined;
  }
}
