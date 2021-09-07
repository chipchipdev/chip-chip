import {
  Observable, Subject, Subscription,
} from 'rxjs';
import {
  ShowdownAbstract, ShowdownInteractive, HandStatus, PlayerShowDownActionEnum,
} from '../base';
import { Player } from './player';
import { PlayerShowDownAction } from './action';

export class Showdown
  extends ShowdownAbstract<Player, PlayerShowDownAction, HandStatus<Player>>
  implements ShowdownInteractive<Player> {
  disposableBag: Subscription = new Subscription();

  interactiveCollector: { [p: string]: any }[] = [];

  play(status: Subject<HandStatus<Player>>): Subject<HandStatus<Player>> {
    this.onPlayObservable.next();

    this.disposableBag.add(this.channel.subscribe((action) => {
      if (
        this.validate(action)
      ) {
        this.deal(action, status);
      }
    }));

    return status;
  }

  deal(action: PlayerShowDownAction, status: Subject<HandStatus<Player>>) {
    switch (action.type) {
      case PlayerShowDownActionEnum.IN:
        this.winners.push(this.players.find((p) => p.getPlayer().id === action.id));
        this.onDealObservable.next({ players: this.winners });
        break;
      case PlayerShowDownActionEnum.OUT:
        // eslint-disable-next-line no-case-declarations
        const index = this.winners.findIndex((p) => p.getPlayer().id === action.id);
        if (index >= 0) this.winners.splice(index, 1);
        this.onDealObservable.next({ players: this.winners });
        break;
      case PlayerShowDownActionEnum.END:
        this.onDealObservable.next({ players: this.winners });
        status.next({
          completed: true,
          winners: this.winners,
        });
        this.end();
        break;
      default:
        break;
    }
  }

  end() {
    this.onEndObservable.next({
      players: this.winners,
    });
    this.disposableBag.unsubscribe();
  }

  onPlayObservable: Subject<void> = new Subject();

  onDealObservable: Subject<{ players: Player[] }> = new Subject();

  onEndObservable: Subject<{ players: Player[] }> = new Subject();

  onPlay(subscription: () => void): Subscription {
    const disposable = this.onPlayObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    return disposable;
  }

  onDeal(subscription:
  ({ players }: { players: Player[] }) => void)
    : Subscription {
    const disposable = this.onDealObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    return disposable;
  }

  onEnd(subscription:
  ({ players }: { players: Player[] }) => void):
    Subscription {
    const disposable = this.onEndObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    return disposable;
  }

  unsubscribe(): void {
    this.disposableBag.unsubscribe();
  }

  winners: Player[] = [];

  private validate(action: PlayerShowDownAction) {
    switch (action.type) {
      case PlayerShowDownActionEnum.IN:
      case PlayerShowDownActionEnum.OUT:
        return !!this.players.find(
          (p) => (!p.getPlayer().folded)
                && p.getPlayer().id === action.id,
        );
      case PlayerShowDownActionEnum.END:
        return !!this.players.find(
          (p) => p.getPlayer().id === action.id,
        );
      default:
        return false;
    }
  }
}
