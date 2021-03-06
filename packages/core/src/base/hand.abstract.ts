import { Observable, Subscription } from 'rxjs';

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

abstract class HandAbstract<Pool, Hand, Round, Showdown, Player, PlayerAction>
  extends MatchSharedBase<Pool, Hand, Round, Player, PlayerAction> {
  abstract round: Round;

  abstract showdown: Showdown;

  /**
   * @description the hand status observable, will be updated after a round is ended
   */
  abstract status: Observable<HandStatus<Player>>;

  /**
   * @description start a new hand
   * @abstract
   */
  abstract start(): Observable<HandStatus<Player>>;

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
  onPlayObservable: Observable<{ hand: Hand, round: Round, is: RoundStateEnum }>
  /**
   * @description when some other subscribe this property,
   * it will receive the match instance after current hand goes into the showdown process
   */
  onShowdownObservable: Observable<{ hand: Hand }>

  /**
   * @description add subscriptions for onStartObservable
   * @param subscription
   */
  onStart:(subscription: ({ hand }:
  { hand: Hand }) => void)
  => Subscription

  /**
   * @description add subscriptions for onEndObservable
   * @param subscription
   */
  onEnd:(subscription: ({ hand }:
  { hand: Hand }) => void)
  => Subscription

  /**
   * @description add subscriptions for onPlayObservable
   * @param subscription
   */
  onPlay:(subscription: ({ hand, round, is }:
  { hand: Hand, round: Round, is: RoundStateEnum }) => void)
  => Subscription

  /**
   * @description add subscriptions for onShowdownObservable
   * @param subscription
   */
  onShowdown:(subscription: ({ hand }:
  { hand: Hand }) => void)
  => Subscription
}

export {
  HandInitiator,
  HandAbstract,
  HandInteractive,
  HandStatus,
};
