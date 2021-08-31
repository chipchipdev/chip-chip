import { HandStatus, PoolAbstract, PlayerActionEnum } from '@chip-chip/schema';

import _ from 'lodash';
import { Player } from './player';
import { PlayerAction } from './action';
import { Pot } from './pot';

export class Pool<Hand, Round> extends PoolAbstract<
Pool<Hand, Round>,
Hand, Round, Player, PlayerAction, Pot<Player, HandStatus<Player>>, HandStatus<Player>
> {
  allinPlayers: Player[] = [];

  pots: Pot<Player, HandStatus<Player>>[] = [];

  outcomes: HandStatus<Player>[] = [];

  pot: Pot<Player, HandStatus<Player>>;

  bet: number;

  calculateChips(player: Player, action: PlayerAction): number {
    const { action: previousAction, chips } = player.getPlayer();
    const previousWager = previousAction?.amount ?? 0;

    const wagerIncrease = action.amount - previousWager;

    player.setChips(chips - wagerIncrease);
    this.pot.amount += wagerIncrease;

    if (player.getPlayer().chips === 0) {
      this.allinPlayers.push(player);
    }

    return action.amount;
  }

  calculateOutcome(pot: Pot<Player, HandStatus<Player>>) {
    const { status } = pot;

    if (status.winners.length > 1) {
      _.each(status.winners, (winner) => {
        if (_.last(status.winners) !== winner) {
          const { chips } = winner.getPlayer();
          winner.setChips(chips + Math.floor(pot.amount / status.winners.length));
        } else {
          const { chips } = winner.getPlayer();
          winner.setChips(chips + Math.ceil(pot.amount / status.winners.length));
        }
      });
    } else {
      const { chips } = status.winners[0].getPlayer();
      status.winners[0].setChips(chips + pot.amount);
    }
  }

  createPot(participants: Player[], amount: number) {
    if (this.pot && this.pot.amount === 0) {
      this.pots.splice(
        this.pots.indexOf(this.pot),
      );
    }

    this.pot = {
      participants,
      amount,
    };

    this.pots.push(this.pot);
  }

  createSidePot(player: Player) {
    const wager = player.getPlayer().action.amount;
    const nextHighestWager = this.getNextHighestWagerFromAllInPlayers(wager);

    // We then remove this player from the side pot.
    const sidePotParticipants = _.without(this.pot.participants, player);
    let sidePotAmount = 0;

    // The amount we place in the side pot is the difference in wagers,
    // multiplied by the number of callers.
    const potDelta = nextHighestWager - wager;
    if (potDelta > 0) {
      sidePotAmount = potDelta * sidePotParticipants.length;
    }

    this.createPot(sidePotParticipants, sidePotAmount);
    return sidePotAmount;
  }

  endHand(status: HandStatus<Player>) {
    this.pot.status = status;
    this.calculateOutcome(this.pot);
    this.outcomes.push(status);

    this.pots = [];
  }

  endRound() {
    this.allinPlayers = this.allinPlayers
      .sort(
        (a, b) => (
          a.getPlayer().action.amount - b.getPlayer().action.amount
        ),
      );

    const mainPot = this.pot;
    let amountSetAside = 0;

    this.allinPlayers.forEach((player) => {
      amountSetAside = this.createSidePot(player) + amountSetAside;
    });

    mainPot.amount -= amountSetAside;
  }

  playRound() {
    this.bet = 0;
    this.allinPlayers = [];
  }

  update(player: Player, action: PlayerAction) {
    switch (action.type) {
      case PlayerActionEnum.FOLD:
        this.pots.forEach((pot) => {
          pot.participants.splice(pot.participants.indexOf(player), 1);
        });
        break;
      case PlayerActionEnum.CHECK:
        break;
      case PlayerActionEnum.CALL:
        // eslint-disable-next-line no-param-reassign
        action.amount = this.bet;
        this.calculateChips(player, action);
        break;
      case PlayerActionEnum.BET:
      case PlayerActionEnum.RAISE:
        this.bet = this.calculateChips(player, action);
        break;
      default:
        break;
    }
  }

  validate(player: Player, action: PlayerAction, actionMap: { [p: string]: PlayerAction }) {
    const { optioned, action: previousAction, chips } = player.getPlayer();

    const ifBetOrRaiseInActionMap = Object.keys(actionMap)
      .filter((key) => actionMap[key].type === PlayerActionEnum.BET
                    || actionMap[key].type === PlayerActionEnum.RAISE)
      .length > 0;

    // check if action name valid
    if (optioned) {
      switch (action.type) {
        case PlayerActionEnum.RAISE:
        case PlayerActionEnum.CHECK:
        case PlayerActionEnum.FOLD:
          break;
        default:
          return false;
      }
    } else if (ifBetOrRaiseInActionMap) {
      switch (action.type) {
        case PlayerActionEnum.CALL:
        case PlayerActionEnum.RAISE:
        case PlayerActionEnum.FOLD:
          break;
        default:
          return false;
      }
    } else {
      switch (action.type) {
        case PlayerActionEnum.CHECK:
        case PlayerActionEnum.BET:
        case PlayerActionEnum.FOLD:
          break;
        default:
          return false;
      }
    }

    // check if bet enough
    switch (action.type) {
      case PlayerActionEnum.CHECK:
        if ((player.getPlayer().action?.amount ?? 0) < this.bet) return false;
        break;
      case PlayerActionEnum.RAISE:
        if (action.amount <= this.bet) return false;
        break;
      case PlayerActionEnum.BET:
        if (action.amount < this.bet) return false;
        break;
      default:
        break;
    }

    return ((previousAction?.amount ?? 0) + chips) >= (action.amount ?? 0);
  }

  private getNextHighestWagerFromAllInPlayers(wager: number) {
    let wagers = this.allinPlayers
      .map((p) => p.getPlayer().action.amount)
      .sort((a, b) => a - b);
    wagers.push(this.bet);
    wagers = _.uniq(wagers);

    const nextIndex = wagers.indexOf(wager) + 1;
    return wagers[nextIndex] || wagers[wagers.length - 1];
  }
}
