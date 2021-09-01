import { Observable, Subscription } from 'rxjs';
import { MatchSharedBase, MatchSharedInitiator, MatchSharedInteractive } from './match.abstract';

/**
 * @description round initiator inherit from the match shared initiator
 */
type RoundInitiator<Pool, Hand, Round, Player, PlayerAction> =
    MatchSharedInitiator<Pool, Hand, Round, Player, PlayerAction>;

/**
 * @description the enum that maintains all round states
 */
enum RoundStateEnum {
  PRE_FLOP,
  FLOP,
  TURN,
  RIVER,
}

/**
 * @description the abstract class for round instance, do some initialize chores in constructor
 * and also define some abstract methods that need to be implement
 * @abstract
 */
abstract class RoundAbstract<Pool, Hand, Round, Player, PlayerAction, HandStatus>
  extends MatchSharedBase<Pool, Hand, Round, Player, PlayerAction> {
  /**
   * @description to define the current round
   */
  abstract is: RoundStateEnum;

  /**
   * @description the hand status observable, will be updated after a round is ended
   */
  abstract status: Observable<HandStatus>;

  /**
   * @description a store that maintains all the actions from each player during current round
   */
  abstract actionMap:{ [id: string]: PlayerAction };

  /**
   * @description play a new round
   * @abstract
   */
  abstract play(round: RoundStateEnum, status: Observable<HandStatus>): Observable<HandStatus>;

  /**
   * @description end the round
   */
  abstract end();

  /**
   * @description monitoring the message from the channel by specific player
   * @abstract
   * @param player
   */
  abstract monitor(player: Player): Observable<any>;

  /**
   * @description deal with the action from valid action
   * @param player
   * @param action
   * @param blinded
   */
  abstract deal(player: Player, action: PlayerAction, blinded: boolean);
}

interface RoundInteractive<Round, Player> extends MatchSharedInteractive{

  /**
   * @description when some other subscribe this property,
   * it will receive the match instance after it start to play
   */
  onPlayObservable: Observable<{ round: Round }>
  /**
   * @description when some other subscribe this property,
   * it will receive the match instance after it ended
   */
  onEndObservable: Observable<{ round: Round }>
  /**
   * @description when round instance has started to monitor some player's action
   * it will receive current player and current round
   */
  onMonitorObservable: Observable<{ player: Player, round: Round }>
  /**
   * @description when round instance are dealing with some player's action
   * (which means the action is legally)
   * it will receive current player and current round
   */
  onDealObservable: Observable<{ player: Player, round: Round }>

  /**
   * @description add subscriptions for onStartObservable
   * @param subscription
   */
  onPlay:(subscription: ({ round }:
  { round: Round }) => void)
  => Observable<{ round: Round }>

  /**
   * @description add subscriptions for onEndObservable
   * @param subscription
   */
  onEnd:(subscription: ({ round }:
  { round: Round }) => void)
  => Observable<{ round: Round }>

  /**
   * @description add subscriptions for onMonitorObservable
   * @param subscription
   */
  onMonitor:(subscription: ({ player, round }:
  { player: Player, round: Round }) => void)
  => Observable<{ player: Player, round: Round }>

  /**
   * @description add subscriptions for onDealObservable
   * @param subscription
   */
  onDeal:(subscription: ({ player, round }:
  { player: Player, round: Round }) => void)
  => Observable<{ player: Player, round: Round }>

}

export {
  RoundAbstract,
  RoundInitiator,
  RoundInteractive,
  RoundStateEnum,
};
