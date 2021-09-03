// eslint-disable-next-line max-classes-per-file
import { Observable, Subscription } from 'rxjs';

/**
 * @description the maximum version initiator for match's constructor
 */
type MatchSharedInitiator<Pool, Hand, Round, Player, PlayerAction > = {

  /**
   * @description match channel, for receiving player's action
   * @protected
   */
  channel: Observable<PlayerAction>;

  /**
   * @description the chips for each player
   * @protected
   */
  chips: number;

  /**
   * @description current hand instance
   * @protected
   */
  hand?: Hand;

  /**
   * @description the pool that calculate the chips after each hand and each round
   * @protected
   */
  pool?: Pool;

  /**
   * @description the dealer button position for each hand
   * @protected
   */
  position?: number;

  /**
   * @description players in match
   * @protected
   */
  players: Player[];

  /**
   * @description current round instance
   * @protected
   */
  round?: Round;

  /**
   * @description the small blind wager
   * @protected
   */
  wager: number;
};

/**
 * @description the properties for match / hand / round constructor
 */
class MatchSharedBase<Pool, Hand, Round, Player, PlayerAction> {
  constructor(initiator: MatchSharedInitiator<Pool, Hand, Round, Player, PlayerAction>) {
    const {
      channel,
      chips,
      hand,
      pool,
      players,
      round,
      position,
      wager,
    } = initiator;
    if (!players) throw new Error('players required');
    if (!channel) throw new Error('channel required');
    if (!wager) throw new Error('wager required');
    if (!chips) throw new Error('chips required');
    this.players = players;
    this.channel = channel;
    this.wager = wager;
    this.chips = chips;
    if (hand) this.hand = hand;
    if (round) this.round = round;
    if (pool) this.pool = pool;
    if (typeof position === 'number' && position >= 0) this.position = position;
  }

  /**
   * @description match channel, for receiving player's action
   * @protected
   */
  protected channel: Observable<PlayerAction>;

  /**
   * @description the chips for each player
   * @protected
   */
  protected chips: number;

  /**
   * @description current hand instance
   * @protected
   */
  protected hand?: Hand;

  /**
   * @description the dealer button position for each hand in the match
   * @protected
   */
  protected position: number;

  /**
   * @description the pool that calculate the chips after each hand and each round
   * @protected
   */
  protected pool: Pool;

  /**
   * @description players in match
   * @protected
   */
  protected players: Player[];

  /**
   * @description current round instance
   * @protected
   */
  protected round?: Round;

  /**
   * @description the small blind wager
   * @protected
   */
  protected wager: number;
}

/**
 * @description the abstract class for match instance, do some initialize chores in constructor
 * and also define some abstract methods that need to be implement
 * @abstract
 */
abstract class MatchAbstract<Pool, Hand, Round, Player, PlayerAction, HandStatus>
  extends MatchSharedBase<Pool, Hand, Round, Player, PlayerAction> {
  abstract playing: Observable<boolean>;

  /**
   * @description start a new match
   * @abstract
   */
  abstract start(position?: number);

  /**
   * @description pause current match
   * @abstract
   */
  abstract pause();

  /**
   * @description end the match
   */
  abstract end();

  /**
   * @description play a new hand in current match
   */
  abstract play(): Observable<HandStatus>;
}

interface MatchSharedInteractive {
  /**
   * @description disposable bag
   */
  disposableBag: Subscription;

  /**
   * @description the collector for all subscriptions
   */
  interactiveCollector: {
    [key: string]: any
  }[]
  /**
   * @description clear the disposable bag
   */
  unsubscribe(): void
}

/**
 * @description the interface for handling the interactions that current match made
 */
interface MatchInteractive<Match, Hand> extends MatchSharedInteractive{
  /**
   * @description when some other subscribe this property,
   * it will receive the match instance after it started
   */
  onStartObservable: Observable<{ match: Match }>;
  /**
   * @description when some other subscribe this property,
   * it will receive the match instance after it paused
   */
  onPauseObservable: Observable<{ match: Match }>;
  /**
   * @description when some other subscribe this property,
   * it will receive the match instance after it ended
   */
  onEndObservable: Observable<{ match: Match }>;
  /**
   * @description when some other subscribe this property,
   * it will receive the match instance and hand instance when each hand start
   */
  onPlayObservable: Observable<{ match: Match, hand: Hand }>

  /**
   * @description add subscriptions for onStartObservable
   * @param subscription
   */
  onStart:(subscription: ({ match }:
  { match: Match }) => void)
  => Observable<{ match: Match }>
  /**
   * @description add subscriptions for onPauseObservable
   * @param subscription
   */
  onPause:(subscription: ({ match }:
  { match: Match }) => void)
  => Observable<{ match: Match }>
  /**
   * @description add subscriptions for onEndObservable
   * @param subscription
   */
  onEnd:(subscription: ({ match }:
  { match: Match }) => void)
  => Observable<{ match: Match }>
  /**
   * @description add subscriptions for onPlayObservable
   * @param subscription
   */
  onPlay:(subscription: ({ match, hand }:
  { match: Match, hand: Hand }) => void)
  => Observable<{ match: Match, hand: Hand }>
}

export {
  MatchAbstract,
  MatchInteractive,
  MatchSharedBase,
  MatchSharedInitiator,
  MatchSharedInteractive,
};
