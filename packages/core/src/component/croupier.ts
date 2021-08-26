import { CroupierAbstract, CroupierInteractive, CroupierScheduledStage } from '@chip-chip/schema';
import { Observable, Subject } from 'rxjs';

export class Croupier<PlayerUnscheduled extends { id: string }, Match>
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

    this.onReorder.next({
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
}
