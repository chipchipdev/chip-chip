import { Observable } from 'rxjs';

/**
 * @description the minimum version initiator for player's constructor
 */
type PlayerInitiator = {
  id: string
  name: string
  chips: number
};

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

  /**
   * @description the getter for player
   * @abstract
   */
  abstract getPlayer(): {
    id: string, name: string, chips: number,
    joined?: boolean; folded?: boolean; allin?: boolean; optioned?: boolean;
    action?: PlayerAction
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
}

/**
 * @description the interface for handling the interactions that current player made
 */
interface PlayerInteractive<Player, PlayerAction> {
  /**
   * @description when some other subscribe this property,
   * it will receive the new player state after chips changes
   */
  onChipsChange: Observable<{ chips: number, player: Player }>;
  /**
   * @description when some other subscribe this property,
   * it will receive the new player state after joined state changes
   */
  onJoinedStateChange: Observable<{ joined: boolean, player: Player }>;
  /**
   * @description when some other subscribe this property,
   * it will receive the new player state after folded state changes
   */
  onFoldedStateChange: Observable<{ folded: boolean, player: Player }>;
  /**
   * @description when some other subscribe this property,
   * it will receive the new player state after allin state changes
   */
  onAllinStateChange: Observable<{ allin: boolean, player: Player }>;
  /**
   * @description when some other subscribe this property,
   * it will receive the new player state after bet state changes
   */
  onBetStateChange: Observable<{ bet: boolean, player: Player }>;
  /**
   * @description when some other subscribe this property,
   * it will receive the new player state after optioned state changes
   */
  onOptionedStateChange: Observable<{ optioned: boolean, player: Player }>;
  /**
   * @description when some other subscribe this property,
   * it will receive the new player state after action changes
   */
  onActionChange: Observable<{ action: PlayerAction, player: Player }>;
}

export {
  PlayerAbstract,
  PlayerInitiator,
  PlayerInteractive,
};
