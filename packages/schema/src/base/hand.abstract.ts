import { Observable } from 'rxjs';

import { MatchSharedBase, MatchSharedInitiator, MatchSharedInteractive } from './match.abstract';
import { RoundStateEnum } from './round.abstract';

/**
 * @description hand initiator inherit from the match shared initiator
 */
type HandInitiator<Pool, Hand, Round, Player, PlayerAction> =
    MatchSharedInitiator<Pool, Hand, Round, Player, PlayerAction>;

/**
 * @description the hand status that if the game has been finished after each round
 */
type HandStatus<Player> = {
  completed: boolean;
  winners?: Player[];
};

abstract class HandAbstract<Pool, Hand, Round, Player, PlayerAction>
  extends MatchSharedBase<Pool, Hand, Round, Player, PlayerAction> {
  /**
   * @description the state that whether current hand is playing
   */
  abstract playing: Observable<boolean>;

  /**
   * @description start a new hand
   * @abstract
   */
  abstract start(): Observable<boolean>;

  /**
   * @description end the hand
   */
  abstract end();

  /**
   * @description play a new round in current hand
   */
  abstract play(round: RoundStateEnum): Observable<HandStatus<Player>>;
}

interface HandInteractive<Hand, Round> extends MatchSharedInteractive{

  /**
   * @description when some other subscribe this property,
   * it will receive the match instance after it started
   */
  onStartObservable: Observable<{ hand: Hand }>
  /**
   * @description when some other subscribe this property,
   * it will receive the match instance after it ended
   */
  onEndObservable: Observable<{ hand: Hand }>
  /**
   * @description when some other subscribe this property,
   * it will receive the match instance after a new round is starting
   */
  onPlayObservable: Observable<{ hand: Hand, round: Round }>

  /**
   * @description add subscriptions for onStartObservable
   * @param subscription
   */
  onStart:(subscription: ({ hand }:
  { hand: Hand }) => void)
  => Observable<{ hand: Hand }>

  /**
   * @description add subscriptions for onEndObservable
   * @param subscription
   */
  onEnd:(subscription: ({ hand }:
  { hand: Hand }) => void)
  => Observable<{ hand: Hand }>

  /**
   * @description add subscriptions for onPlayObservable
   * @param subscription
   */
  onPlay:(subscription: ({ hand, round }:
  { hand: Hand, round: Round }) => void)
  => Observable<{ hand: Hand, round: Round }>
}

export {
  HandInitiator,
  HandAbstract,
  HandInteractive,
  HandStatus,
};
