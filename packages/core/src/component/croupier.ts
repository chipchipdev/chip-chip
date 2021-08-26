import { CroupierAbstract, CroupierInteractive, CroupierScheduledStage } from '@chip-chip/schema';
import { Observable, Subject } from 'rxjs';

export class Croupier<PlayerUnscheduled, Match>
  extends CroupierAbstract<PlayerUnscheduled, Match>
  implements CroupierInteractive<Croupier<PlayerUnscheduled, Match>, PlayerUnscheduled, Match> {
  onArrange: Subject<{
    player: PlayerUnscheduled;
    croupier: Croupier<PlayerUnscheduled, Match>;
  }>
  = new Subject();

  onReorder: Subject<{
    players: PlayerUnscheduled[];
    croupier: Croupier<PlayerUnscheduled, Match>;
  }>
  = new Subject();

  onStart: Subject<{
    match: Match;
    croupier: Croupier<PlayerUnscheduled, Match>;
  }>
  = new Subject();

  onRestart: Subject<{
    match: Match;
    croupier: Croupier<PlayerUnscheduled, Match>;
  }>
  = new Subject();

  onPause: Subject<{
    match: Match; croupier:
    Croupier<PlayerUnscheduled, Match>;
  }>
  = new Subject();

  onEnd: Observable<{
    match: Match;
    croupier: Croupier<PlayerUnscheduled, Match>;
  }>
  = new Subject();

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
    this.onArrange.next({
      player,
      croupier: this,
    });
  }

  reorder(player: PlayerUnscheduled, index: number) {
    throw new Error('Method not implemented.');
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
}
