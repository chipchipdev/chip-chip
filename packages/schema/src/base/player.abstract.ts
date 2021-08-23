type PlayerInitiator = {
  id: string
  name: string
};

abstract class PlayerAbstract {
  constructor(initiator: PlayerInitiator) {
    const { id, name } = initiator;
    this.id = id;
    this.name = name;
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

  allin?: boolean;

  bet?: boolean;

  optioned?: boolean;

  // action?: PlayerAction;
}

export {
  PlayerAbstract,
  PlayerInitiator,
};
