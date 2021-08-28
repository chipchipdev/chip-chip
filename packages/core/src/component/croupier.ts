import { CroupierAbstract, CroupierInteractive, CroupierScheduledStage } from '@chip-chip/schema';
import { Observable, Subject, Subscription } from 'rxjs';

export class Croupier<PlayerUnscheduled extends { id: string }, Match>
  extends CroupierAbstract<PlayerUnscheduled, Match>
  implements CroupierInteractive<Croupier<PlayerUnscheduled, Match>, PlayerUnscheduled, Match> {
  getCroupier(): {
    id: string; owner: PlayerUnscheduled; stage: CroupierScheduledStage;
    players: PlayerUnscheduled[]; match?: Match;
  } {
    return {
      id: this.id,
      owner: this.owner,
      stage: this.stage,
      players: this.players,
    };
  }

  arrange(player: PlayerUnscheduled) {
    this.players.push(player);
    this.onArrangeObservable.next({
      player,
      croupier: this,
    });
  }

  reorder(player: PlayerUnscheduled, index: number) {
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

  start() {
    throw new Error('Method not implemented.');
  }

  restart() {
    throw new Error('Method not implemented.');
  }

  pause() {
    throw new Error('Method not implemented.');
  }

  end() {
    throw new Error('Method not implemented.');
  }

  disposableBag: Subscription[] = [];

  unsubscribe(): void {
    throw new Error('Method not implemented.');
  }

  onArrangeObservable:
  Subject<{ player: PlayerUnscheduled; croupier: Croupier<PlayerUnscheduled, Match>; }>
  = new Subject();

  onReorderObservable:
  Subject<{ players: PlayerUnscheduled[]; croupier: Croupier<PlayerUnscheduled, Match>; }>
  = new Subject();

  onStartObservable:
  Subject<{ match: Match; croupier: Croupier<PlayerUnscheduled, Match>; }>
  = new Subject();

  onRestartObservable:
  Subject<{ match: Match; croupier: Croupier<PlayerUnscheduled, Match>; }>
  = new Subject();

  onPauseObservable:
  Subject<{ match: Match; croupier: Croupier<PlayerUnscheduled, Match>; }>
  = new Subject();

  onEndObservable:
  Subject<{ match: Match; croupier: Croupier<PlayerUnscheduled, Match>; }>
  = new Subject();

  onArrange: (subscription: ({ player, croupier }:
  { player: PlayerUnscheduled; croupier: Croupier<PlayerUnscheduled, Match>; }) => void)
  => Observable<{ player: PlayerUnscheduled; croupier: Croupier<PlayerUnscheduled, Match> }>
  = (subscription) => {
    const disposable = this.onArrangeObservable.subscribe(subscription);
    this.disposableBag.push(disposable);
    return this.onArrangeObservable;
  };

  onReorder: (subscription: ({ players, croupier }:
  { players: PlayerUnscheduled[]; croupier: Croupier<PlayerUnscheduled, Match>; }) => void)
  => Observable<{ players: PlayerUnscheduled[]; croupier: Croupier<PlayerUnscheduled, Match> }>
  = (subscription) => {
    const disposable = this.onReorderObservable.subscribe(subscription);
    this.disposableBag.push(disposable);
    return this.onReorderObservable;
  };

  onStart: (subscription: ({ match, croupier }:
  { match: Match; croupier: Croupier<PlayerUnscheduled, Match>; }) => void)
  => Observable<{ match: Match; croupier: Croupier<PlayerUnscheduled, Match> }>
  = (subscription) => {
    const disposable = this.onStartObservable.subscribe(subscription);
    this.disposableBag.push(disposable);
    return this.onStartObservable;
  };

  onRestart: (subscription: ({ match, croupier }:
  { match: Match; croupier: Croupier<PlayerUnscheduled, Match>; }) => void)
  => Observable<{ match: Match; croupier: Croupier<PlayerUnscheduled, Match> }>
  = (subscription) => {
    const disposable = this.onRestartObservable.subscribe(subscription);
    this.disposableBag.push(disposable);
    return this.onRestartObservable;
  };

  onPause: (subscription: ({ match, croupier }:
  { match: Match; croupier: Croupier<PlayerUnscheduled, Match>; }) => void)
  => Observable<{ match: Match; croupier: Croupier<PlayerUnscheduled, Match> }>
  = (subscription) => {
    const disposable = this.onPauseObservable.subscribe(subscription);
    this.disposableBag.push(disposable);
    return this.onPauseObservable;
  };

  onEnd: (subscription: ({ match, croupier }:
  { match: Match; croupier: Croupier<PlayerUnscheduled, Match>; }) => void)
  => Observable<{ match: Match; croupier: Croupier<PlayerUnscheduled, Match> }>
  = (subscription) => {
    const disposable = this.onEndObservable.subscribe(subscription);
    this.disposableBag.push(disposable);
    return this.onEndObservable;
  };
}
