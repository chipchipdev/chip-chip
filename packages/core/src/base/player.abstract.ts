import { Observable } from 'rxjs';
import { MatchSharedInteractive } from './match.abstract';

/**
 * @description the minimum version initiator for player's constructor
 */
type PlayerInitiator = {
  id: string
  name: string
  chips: number
};

enum CroupierActionEnum {
  SET_CROUPIER_ID = 'SET_CROUPIER_ID',
  SET_OWNER = 'SET_OWNER',
  SET_CHIPS = 'SET_CHIPS',
  ARRANGE = 'ARRANGE',
  REORDER = 'REORDER',
  START = 'START',
  RESTART = 'RESTART',
  PAUSE = 'PAUSE',
  END = 'END',
}

enum PlayerActionEnum {
  FOLD = 'FOLD',
  CHECK = 'CHECK',
  CALL = 'CALL',
  BET = 'BET',
  RAISE = 'RAISE',
}

enum PlayerShowDownActionEnum {
  IN = 'SHOWDOWN_IN',
  OUT = 'SHOWDOWN_OUT',
  END = 'SHOWDOWN_END',
}

/**
 * @description the abstract class for player instance, do some initialize chores in constructor
 * and also define some abstract methods that need to be implement
 * @abstract
 */
abstract class PlayerAbstract<PlayerAction> {
  constructor(initiator: PlayerInitiator) {
    const { id, name, chips } = initiator;
    this.id = id;
    this.name = name;
    this.chips = chips;
    this.validActions = [];
  }

  /**
     * @description player unique id
     * @protected
     */
  protected readonly id: string;

  /**
     * @description player name for displaying
     * @protected
     */
  protected readonly name: string;

  /**
     * @description chips player
     * @protected
     */
  protected chips: number;

  /**
     * @description is the player join the match currently
     * @protected
     */
  protected joined?: boolean;

  /**
     * @description is the player folded in current hand
     * @protected
     */
  protected folded?: boolean;

  /**
     * @description is the player allin in current hand
     * @protected
     */
  protected allin?: boolean;

  /**
     * @description is the player the first one that need to bet
     * @protected
     */
  protected bet?: boolean;

  /**
     * @description is the player has another opportunity to bet
     * ( in most of the cases, this option is for the big blind )
     * @protected
     */
  protected optioned?: boolean;

  /**
     * @description the object that stored player's previous action
     * @protected
     */
  protected action?: PlayerAction;

  protected validActions: PlayerActionEnum[];

  /**
   * @description the getter for player
   * @abstract
   */
  abstract getPlayer(): {
    id: string, name: string, chips: number,
    joined?: boolean; folded?: boolean; allin?: boolean; optioned?: boolean; bet?: boolean;
    action?: PlayerAction; validActions: PlayerActionEnum[]
  };

  /**
   * @description the chips setter for player
   * @abstract
   */
  abstract setChips(chips: number);

  /**
   * @description the joined setter for player
   * @abstract
   */
  abstract setJoined(joined: boolean);

  /**
   * @description the folded setter for player
   * @abstract
   */
  abstract setFolded(folded: boolean);

  /**
   * @description the allin setter for player
   * @abstract
   */
  abstract setAllin(allin: boolean);

  /**
   * @description the bet setter for player
   * @abstract
   */
  abstract setBet(bet: boolean);

  /**
   * @description the optioned setter for player
   * @abstract
   */
  abstract setOptioned(optioned: boolean);

  /**
   * @description the action setter for player
   * @abstract
   */
  abstract setAction(action: PlayerAction);

  abstract setValidActions(actions: PlayerActionEnum[]);
}

/**
 * @description the interface for handling the interactions that current player made
 */
interface PlayerInteractive<Player, PlayerAction> extends MatchSharedInteractive{

  /**
   * @description when some other subscribe this property,
   * it will receive the new player state after chips changes
   */
  onChipsChangeObservable: Observable<{ chips: number, player: Player }>;
  /**
   * @description when some other subscribe this property,
   * it will receive the new player state after joined state changes
   */
  onJoinedStateChangeObservable: Observable<{ joined: boolean, player: Player }>;
  /**
   * @description when some other subscribe this property,
   * it will receive the new player state after folded state changes
   */
  onFoldedStateChangeObservable: Observable<{ folded: boolean, player: Player }>;
  /**
   * @description when some other subscribe this property,
   * it will receive the new player state after allin state changes
   */
  onAllinStateChangeObservable: Observable<{ allin: boolean, player: Player }>;
  /**
   * @description when some other subscribe this property,
   * it will receive the new player state after bet state changes
   */
  onBetStateChangeObservable: Observable<{ bet: boolean, player: Player }>;
  /**
   * @description when some other subscribe this property,
   * it will receive the new player state after optioned state changes
   */
  onOptionedStateChangeObservable: Observable<{ optioned: boolean, player: Player }>;
  /**
   * @description when some other subscribe this property,
   * it will receive the new player state after action changes
   */
  onActionChangeObservable: Observable<{ action: PlayerAction, player: Player }>;
  /**
   * @description when some other subscribe this property,
   * it will receive the new player state after valid actions changes
   */
  onValidActionsChangeObservable: Observable<{ actions: PlayerActionEnum[], player: Player }>;

  /**
   * @description add subscriptions for onChipsChangeObservable
   * @param subscription
   */
  onChipsChange: (subscription: ({ chips, player }:{ chips: number, player: Player }) => void)
  => Observable<{ chips: number, player: Player }>;

  /**
   * @description add subscriptions for onJoinedStateChangeObservable
   * @param subscription
   */
  onJoinedStateChange: (subscription: ({ joined, player }:
  { joined: boolean, player: Player }) => void)
  => Observable<{ joined: boolean, player: Player }>;

  /**
   * @description add subscriptions for onFoldedStateChangeObservable
   * @param subscription
   */
  onFoldedStateChange: (subscription: ({ folded, player }:
  { folded: boolean, player: Player }) => void)
  => Observable<{ folded: boolean, player: Player }>;

  /**
   * @description add subscriptions for onAllinStateChangeObservable
   * @param subscription
   */
  onAllinStateChange: (subscription: ({ allin, player }:
  { allin: boolean, player: Player }) => void)
  => Observable<{ allin: boolean, player: Player }>;

  /**
   * @description add subscriptions for onBetStateChangeObservable
   * @param subscription
   */
  onBetStateChange: (subscription: ({ bet, player }:
  { bet: boolean, player: Player }) => void)
  => Observable<{ bet: boolean, player: Player }>;

  /**
   * @description add subscriptions for onOptionedStateChangeObservable
   * @param subscription
   */
  onOptionedStateChange: (subscription: ({ optioned, player }:
  { optioned: boolean, player: Player }) => void)
  => Observable<{ optioned: boolean, player: Player }>;

  /**
   * @description add subscriptions for onActionChangeObservable
   * @param subscription
   */
  onActionChange: (subscription: ({ action, player }:
  { action: PlayerAction, player: Player }) => void)
  =>Observable<{ action: PlayerAction, player: Player }>;

  /**
   * @description add subscriptions for onValidActionsChangeObservable
   * @param subscription
   */
  onValidActionsChange: (subscription: ({ actions, player }:
  { actions: PlayerActionEnum[], player: Player }) => void)
  =>Observable<{ actions: PlayerActionEnum[], player: Player }>;
}

export {
  PlayerAbstract,
  PlayerInitiator,
  PlayerInteractive,
  CroupierActionEnum,
  PlayerActionEnum,
  PlayerShowDownActionEnum,
};
