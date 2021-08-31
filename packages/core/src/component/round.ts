import {
  HandStatus, PlayerActionEnum, RoundAbstract, RoundInteractive,
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
  repeat,
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

  onPlayObservable: Subject<{ round: Round<Hand>; }> = new Subject();

  onEndObservable: Subject<{ round: Round<Hand>; }> = new Subject();

  onMonitorObservable: Subject<{ player: Player; round: Round<Hand>; }> = new Subject();

  onDealObservable: Subject<{ player: Player; round: Round<Hand>; }> = new Subject();

  private orderedPlayers: Player[];

  onPlay:
  (subscription: ({ round }: { round: Round<Hand>; }) => void)
  => Observable<{ round: Round<Hand>; }> = (subscription) => {
    const disposable = this.onPlayObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    return this.onPlayObservable;
  };

  onEnd:
  (subscription: ({ round }: { round: Round<Hand>; }) => void)
  => Observable<{ round: Round<Hand>; }> = (subscription) => {
    const disposable = this.onEndObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    return this.onEndObservable;
  };

  onMonitor:
  (subscription: ({ player, round }: { player: Player; round: Round<Hand>; }) => void)
  => Observable<{ player: Player; round: Round<Hand>; }> = (subscription) => {
    const disposable = this.onMonitorObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    return this.onMonitorObservable;
  };

  onDeal:
  (subscription: ({ player, round }: { player: Player; round: Round<Hand>; }) => void)
  => Observable<{ player: Player; round: Round<Hand>; }> = (subscription) => {
    const disposable = this.onDealObservable.subscribe(subscription);
    this.disposableBag.add(disposable);
    return this.onDealObservable;
  };

  disposableBag: Subscription = new Subscription();

  interactiveCollector: { [key: string]: any; }[];

  unsubscribe(): void {
    // throw new Error('Method not implemented.');
  }

  play(round: RoundStateEnum): Observable<HandStatus<Player>> {
    this.pool.playRound();

    this.players.forEach((player) => {
      const { chips } = player.getPlayer();
      player.setJoined(chips > 0);
      player.setAction(undefined);
      player.setBet(false);
      player.setOptioned(false);
    });

    if (round === RoundStateEnum.PRE_FLOP) {
      const smallBlindPosition = this.getNextPlayerIndexAfterSpecificIndex(this.position);
      const bigBlindPosition = this.getNextPlayerIndexAfterSpecificIndex(smallBlindPosition);

      this.deal(
        this.players[smallBlindPosition],
        {
          type: PlayerActionEnum.BET,
          amount: this.wager,
        },
        true,
      );

      this.deal(
        this.players[bigBlindPosition],
        {
          type: PlayerActionEnum.BET,
          amount: this.wager * 2,
        },
        true,
      );

      this.players[bigBlindPosition].setOptioned(true);
    }

    this.orderedPlayers = Round.sortPlayersOrderByRound(
      this.players,
      this.position,
      round,
    );

    const remainingPlayers = this.players.filter((player) => {
      const { folded, allin } = player.getPlayer();
      return !folded && !allin;
    });

    if (remainingPlayers.length < 2) {
      this.status.next({ completed: false });
      return new BehaviorSubject<HandStatus<Player>>({
        completed: false,
      });
    }

    const queriedPlayers = connectable(
      from(this.orderedPlayers)
        .pipe(
          filter(
            (player: Player) => {
              const { folded, allin } = player.getPlayer();
              return !folded && !allin;
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

    this.onPlayObservable.next({
      round: this,
    });

    return this.status;
  }

  end() {
    // todo end
    this.onEndObservable.next({
      round: this,
    });
  }

  monitor(player: Player) {
    return defer(() => {
      this.onMonitorObservable.next({
        player,
        round: this,
      });
      const message = new Subject<PlayerAction>();
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

    this.onDealObservable.next({
      player,
      round: this,
    });
  }

  private dealWithBet(player: Player, blinded: boolean) {
    const currentBettorIndex = this.players.findIndex((p) => p.getPlayer().bet);
    // reset other player's bet status
    if (currentBettorIndex >= 0) {
      this.players[currentBettorIndex].setBet(false);
      this.players[currentBettorIndex].setOptioned(false);
    }

    player.setBet(true);

    const { chips } = player.getPlayer();

    if (chips === 0) {
      player.setAllin(true);
    }

    const betable = !!this.players.find((such) => {
      const { folded, bet, chips: c } = such.getPlayer();
      return !folded && !bet && c > 0;
    });

    if (!betable && !blinded) {
      this.status.next({
        completed: false,
      });
    }
  }

  private dealWithFolded(player: Player) {
    const hasAllPlayersActed = this.checkIfPlayerIsLastToAct(player);

    player.setFolded(true);

    const remainingPlayers = this.players.filter((p) => {
      const { folded } = p.getPlayer();
      return !folded;
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
      const { folded, bet, allin } = p.getPlayer();
      return !folded && allin && !bet;
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
      const { folded, allin, bet } = p.getPlayer();
      return !folded && allin && !bet;
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
    const remainingPlayers = this.orderedPlayers.filter((player) => {
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
