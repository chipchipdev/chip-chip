import { Observable } from 'rxjs';

/**
 * @description the minimum version initiator for match's constructor
 */
type MatchInitiator<Player, PlayerAction> = {
  players: Player[]
  wager: number;
  chips: number;
  channel: Observable<PlayerAction>
};

/**
 * @description the abstract class for match instance, do some initialize chores in constructor
 * and also define some abstract methods that need to be implement
 * @abstract
 */
abstract class MatchAbstract<
    Pool,
    Hand,
    Round,
    Player,
    PlayerAction,
    > {
  constructor(initiator: MatchInitiator<Player, PlayerAction>) {
    const {
      players, wager, chips, channel,
    } = initiator;
    this.players = players;
    this.channel = channel;
    this.wager = wager;
    this.chips = chips;
  }

  /**
   * @description match channel, for receiving player's action
   * @protected
   */
  protected channel: Observable<PlayerAction>;

  /**
   * @description players in match
   * @protected
   */
  protected players: Player[];

  /**
   * @description the small blind wager
   * @protected
   */
  protected wager: number;

  /**
   * @description the chips for each player
   * @protected
   */
  protected chips: number;

  /**
   * @description the pool that calculate the chips after each hand and each round
   * @protected
   */
  protected pool: Pool;

  /**
   * @description current hand instance
   * @protected
   */
  protected hand: Hand;

  /**
   * @description current round instance
   * @protected
   */
  protected round: Round;

  /**
   * @description start a new match
   * @abstract
   */
  abstract start();

  /**
   * @description pause current match
   * @abstract
   */
  abstract pause();

  /**
   * @description finish the match
   */
  abstract finish();

  /**
   * @description play a new hand in current match
   */
  abstract play(): Observable<boolean>;
}

/**
 * @description the interface for handling the interactions that current match made
 */
interface MatchInteractive<Match, Hand> {
  /**
   * @description when some other subscribe this property,
   * it will receive the match instance after it started
   */
  onStart: Observable<{ match: Match }>;
  /**
   * @description when some other subscribe this property,
   * it will receive the match instance after it paused
   */
  onPause: Observable<{ match: Match }>;
  /**
   * @description when some other subscribe this property,
   * it will receive the match instance after it finished
   */
  onFinish: Observable<{ match: Match }>;
  /**
   * @description when some other subscribe this property,
   * it will receive the match instance and hand instance when each hand start
   */
  onPlay: Observable<{ match: Match, hand: Hand }>
}

export {
  MatchInitiator,
  MatchAbstract,
  MatchInteractive,
};
