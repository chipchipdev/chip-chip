import { Observable } from 'rxjs';
import { MatchSharedBase, MatchSharedInitiator } from './match.abstract';

type RoundInitiator<Pool, Hand, Round, Player, PlayerAction> =
    MatchSharedInitiator<Pool, Hand, Round, Player, PlayerAction>;

abstract class RoundAbstract<Pool, Hand, Round, Player, PlayerAction>
  extends MatchSharedBase<Pool, Hand, Round, Player, PlayerAction> {
  playing: Observable<boolean>;

  /**
   * @description play a new round
   * @abstract
   */
  abstract play();

  /**
   * @description end the round
   */
  abstract end();

  /**
   * @description monitoring the message from the channel by specific player
   * @abstract
   * @param player
   */
  abstract monitor(player: Player);

  /**
   * @description deal with the action from valid action
   * @param player
   * @param action
   * @param blinded
   */
  abstract deal(player: Player, action: PlayerAction, blinded: boolean);
}

interface RoundInteractive<Round, Player> {
  /**
   * @description when some other subscribe this property,
   * it will receive the match instance after it started
   */
  onStart: Observable<{ round: Round }>
  /**
   * @description when some other subscribe this property,
   * it will receive the match instance after it ended
   */
  onEnd: Observable<{ round: Round }>
  /**
   * @description when round instance has started to monitor some player's action
   * it will receive current player and current round
   */
  onMonitor: Observable<{ player: Player, round: Round }>
  /**
   * @description when round instance are dealing with some player's action
   * (which means the action is legally)
   * it will receive current player and current round
   */
  onDeal: Observable<{ player: Player, round: Round }>
}

export {
  RoundAbstract,
  RoundInitiator,
  RoundInteractive,
};
