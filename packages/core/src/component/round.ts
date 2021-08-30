import {
  RoundAbstract, RoundInteractive, HandStatus,
  PlayerActionEnum,
} from '@chip-chip/schema';

import {
  BehaviorSubject,
  concatMap,
  connectable,
  defer,
  filter,
  from,
  map,
  Observable,
  repeat, ReplaySubject,
  Subject,
  Subscription,
  take,
  takeUntil,
} from 'rxjs';
import { RoundStateEnum } from '@chip-chip/schema/lib/base';
import { Pool } from './pool';
import { Player } from './player';
import { PlayerAction } from './action';

export class Round<Hand>
  extends RoundAbstract<
  Pool<Hand, Round<Hand>>,
  Hand,
  Round<Hand>,
  Player,
  PlayerAction,
  HandStatus<Player>
  >
  implements RoundInteractive<Round<Hand>, Player> {
  status: Subject<HandStatus<Player>> = new Subject();

  actionMap: { [id: string]: PlayerAction; } = {};

  onPlayObservable: Observable<{ round: Round<Hand>; }>;

  onEndObservable: Observable<{ round: Round<Hand>; }>;

  onMonitorObservable: Observable<{ player: Player; round: Round<Hand>; }>;

  onDealObservable: Observable<{ player: Player; round: Round<Hand>; }>;

  onPlay: (subscription: ({ round }: { round: Round<Hand>; }) => void) => Observable<{ round: Round<Hand>; }>;

  onEnd: (subscription: ({ round }: { round: Round<Hand>; }) => void) => Observable<{ round: Round<Hand>; }>;

  onMonitor: (subscription: ({ player, round }: { player: Player; round: Round<Hand>; }) => void) => Observable<{ player: Player; round: Round<Hand>; }>;

  onDeal: (subscription: ({ player, round }: { player: Player; round: Round<Hand>; }) => void) => Observable<{ player: Player; round: Round<Hand>; }>;

  disposableBag: Subscription;

  interactiveCollector: { [key: string]: any; }[];

  unsubscribe(): void {
    // throw new Error('Method not implemented.');
  }

  play(round: RoundStateEnum): Observable<HandStatus<Player>> {
    const orderedPlayers = Round.sortPlayersOrderByRound(
      this.players,
      this.position,
      round,
    );

    const remainingPlayers = this.players.filter((player) => {
      const { joined, allin } = player.getPlayer();
      return joined && !allin;
    });

    if (remainingPlayers.length < 2) {
      this.status.next({ completed: false });
      return new BehaviorSubject<HandStatus<Player>>({
        completed: false,
      });
    }

    const queriedPlayers = connectable(
      from(orderedPlayers)
        .pipe(
          filter(
            (player: Player) => {
              const { joined, allin } = player.getPlayer();
              return joined && !allin;
            },
          ),
          concatMap((p) => this.monitor(p)),
          repeat(),
          takeUntil(this.status),
        ),
    );

    this.status.subscribe(() => {
      this.pool.endRound();
    });

    queriedPlayers.connect();

    return this.status;
  }

  end() {
    throw new Error('Method not implemented.');
  }

  monitor(player: Player) {
    return defer(() => {
      const message = new ReplaySubject<PlayerAction>();
      const { id } = player.getPlayer();

      this.channel.subscribe((action) => {
        if (
          id === action.id
            && this.pool.validate(
              player, action, this.actionMap,
            )
        ) {
          message.next(action);
        }
      });

      const source = connectable(message);

      source.connect();

      return source.pipe(
        take(1),
        map((action) => this.deal(player, action, false)),
      );
    });
  }

  deal(player: Player, action: PlayerAction, blinded: boolean) {
    this.pool.update(player, action);
    player.setAction(action);
    this.actionMap[player.getPlayer().id] = action;

    switch (action.type) {
      case PlayerActionEnum.CHECK:
        this.dealWithChecked(player);
        break;
      case PlayerActionEnum.FOLD:
        this.dealWithFolded(player);
        break;
      case PlayerActionEnum.CALL:
        this.dealWithCalled(player);
        break;
      case PlayerActionEnum.BET:
      case PlayerActionEnum.RAISE:
        this.dealWithBet(player, blinded);
        break;
      default:
        break;
    }
  }

  private dealWithBet(player: Player, blinded: boolean) {
    const currentBettorIndex = this.players.findIndex((p) => p.getPlayer().bet);
    // reset other player's bet status
    if (currentBettorIndex >= 0) {
      this.players[currentBettorIndex].setBet(false);
      this.players[currentBettorIndex].setOptioned(false);
    }

    player.setBet(true);

    const { allin } = player.getPlayer();

    if (allin === true) {
      player.setAllin(true);
    }

    const betable = !!this.players.find((such) => {
      const { joined, bet, chips } = such.getPlayer();
      return joined && !bet && chips > 0;
    });

    if (!betable && !blinded) {
      this.status.next({
        completed: false,
      });
    }
  }

  private dealWithFolded(player: Player) {
    const hasAllPlayersActed = this.checkIfPlayerIsLastToAct(player);

    player.setJoined(false);

    const remainingPlayers = this.players.filter((p) => {
      const { joined } = p.getPlayer();
      return joined;
    });

    if (remainingPlayers.length === 1) {
      this.status.next({
        completed: true,
        winners: remainingPlayers,
      });
    } else if (hasAllPlayersActed) {
      this.status.next({
        completed: false,
      });
    }
  }

  private dealWithChecked(player: Player) {
    const remainingPlayers = this.players.filter((p) => {
      const { joined, bet, allin } = p.getPlayer();
      return joined && allin && !bet;
    });

    const hasAllPlayersChecked = remainingPlayers
      .filter((p) => {
        const { action } = p.getPlayer();
        return action.type === PlayerActionEnum.CHECK
      || action.type === PlayerActionEnum.CALL;
      })
      .length === remainingPlayers.length;

    const hasAllPlayersActed = this.checkIfPlayerIsLastToAct(player);

    if (hasAllPlayersChecked && hasAllPlayersActed) {
      this.status.next({
        completed: false,
      });
    }
  }

  private dealWithCalled(player: Player) {
    const remainingPlayers = this.players.filter((p) => {
      const { joined, allin, bet } = p.getPlayer();
      return joined && allin && !bet;
    });

    const hasAllPlayersCalled = remainingPlayers
      .filter((p) => {
        const { action } = p.getPlayer();
        return action.type === PlayerActionEnum.CALL;
      })
      .length === remainingPlayers.length;

    const hasAllPlayersActed = this.checkIfPlayerIsLastToAct(player);
    if (hasAllPlayersCalled && hasAllPlayersActed) {
      this.status.next({
        completed: false,
      });
    }
  }

  private static sortPlayersOrderByRound(
    players: Player[],
    position: number,
    round: RoundStateEnum,
  ) {
    const offset = round === RoundStateEnum.PRE_FLOP ? 3 : 1;
    const firstToBetPosition = (position + offset) % players.length;
    const playersOrdered = [];

    for (let index = 0; index < players.length; index += 1) {
      playersOrdered.push(players[(firstToBetPosition + index) % players.length]);
    }

    return playersOrdered;
  }

  private getNextPlayerIndexAfterSpecificIndex(position: number) {
    let player: Player;
    let index = position;

    do {
      index = (index + 1) % this.players.length;
      player = this.players[index];
    } while (!player.getPlayer().joined || player.getPlayer().folded);

    return index;
  }

  private checkIfPlayerIsLastToAct(
    actingPlayer: Player,
  ) {
    const remainingPlayers = this.players.filter((player) => {
      const { joined, folded } = player.getPlayer();
      return !folded && joined;
    });

    const currentIndex = remainingPlayers.indexOf(actingPlayer);

    const bettor = remainingPlayers.find((player) => player.getPlayer().bet);
    const bettorIndex = remainingPlayers.indexOf(bettor);

    if (!bettor) {
      return actingPlayer === remainingPlayers[remainingPlayers.length - 1];
    }

    const nextIndex = this.getNextPlayerIndexAfterSpecificIndex(currentIndex);
    const playerWithOption = remainingPlayers.find((player) => player.getPlayer().optioned);

    return playerWithOption
      ? actingPlayer === playerWithOption
      : nextIndex === bettorIndex;
  }
}
