import { MatchSharedBase, MatchSharedInitiator } from './match.abstract';

type PoolInitiator<Pool, Hand, Round, Player, PlayerAction> =
    MatchSharedInitiator<Pool, Hand, Round, Player, PlayerAction>;

// todo: make the pool more clear
abstract class PoolAbstract<Pool, Hand, Round, Player, PlayerAction, Pot, HandStatus>
  extends MatchSharedBase<Pool, Hand, Round, Player, PlayerAction> {
  /**
   * @description all the all-in players for each hand
   */
  abstract allinPlayers: Player[];

  /**
   * @description all pots for each player
   */
  abstract pots: Pot[];

  /**
   * @description handle the outcomes from hand status
   */
  abstract outcomes: HandStatus[];

  /**
   * @description current max pot
   */
  abstract pot: Pot;

  /**
   * @description current max bet
   */
  abstract bet: number;

  /**
   * @description create a pot for players
   * @param participants
   * @param amount
   */
  abstract createPot(participants: Player[], amount: number);

  /**
   * @description create a side pot for current all in player
   * @param player
   */
  abstract createSidePot(player: Player);

  abstract playRound();

  abstract endRound();

  abstract endHand(status: HandStatus);

  abstract validate(
    player: Player,
    action: PlayerAction,
    actionMap: { [id: string]: PlayerAction }
  );

  abstract update(player: Player, action: PlayerAction);

  abstract calculateChips(player: Player, action: PlayerAction): number;

  abstract calculateOutcome(pot: Pot);
}

export {
  PoolAbstract,
  PoolInitiator,
};
