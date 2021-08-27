import { Observable } from 'rxjs';

import { MatchSharedBase, MatchSharedInitiator } from './match.abstract';

type HandInitiator<Pool, Hand, Round, Player, PlayerAction> =
    MatchSharedInitiator<Pool, Hand, Round, Player, PlayerAction>;

abstract class HandAbstract<Pool, Hand, Round, Player, PlayerAction>
  extends MatchSharedBase<Pool, Hand, Round, Player, PlayerAction> {
  playing: Observable<boolean>;

  /**
   * @description start a new hand
   * @abstract
   */
  abstract start();

  /**
   * @description end the hand
   */
  abstract end();

  /**
   * @description play a new round in current hand
   */
  abstract play(): Observable<boolean>;
}

interface HandInteractive<Hand, Round> {
  /**
   * @description when some other subscribe this property,
   * it will receive the match instance after it started
   */
  onStart: Observable<{ hand: Hand }>
  /**
   * @description when some other subscribe this property,
   * it will receive the match instance after it ended
   */
  onEnd: Observable<{ hand: Hand }>
  /**
   * @description when some other subscribe this property,
   * it will receive the match instance after a new round is starting
   */
  onPlay: Observable<{ hand: Hand, round: Round }>
}

export {
  HandInitiator,
  HandAbstract,
  HandInteractive,
};
