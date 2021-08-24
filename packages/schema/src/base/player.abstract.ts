import { Observable } from 'rxjs';

type PlayerInitiator = {
  id: string
  name: string
  chips: number
};

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
  abstract setAllin(folded: boolean);

  /**
   * @description the bet setter for player
   * @abstract
   */
  abstract setBet(folded: boolean);

  /**
   * @description the optioned setter for player
   * @abstract
   */
  abstract setOptioned(folded: boolean);

  /**
   * @description the action setter for player
   * @abstract
   */
  abstract setAction(action: PlayerAction);
}

interface PlayerInteractive<Player> {
  onChipsChange: Observable<Player>;
}

export {
  PlayerAbstract,
  PlayerInitiator,
  PlayerInteractive,
};
