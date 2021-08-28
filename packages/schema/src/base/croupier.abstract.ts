import { Observable, Subscription } from 'rxjs';

type Identifier = {
  id: string;
};

/**
 * @description the initiator for create a croupier instance
 */
type CroupierInitiator<PlayerUnscheduled extends Identifier> = {
  id: string;
  player: PlayerUnscheduled
};

/**
 * @description (somehow the game stage) croupier scheduled
 */
enum CroupierScheduledStage {
  /**
   * @description the preparing stage, so that the players could join the game
   */
  PREPARING,
  /**
   * @description the playing stage, the match instance has been setup
   */
  PLAYING,
  /**
   * @description the pausing stage, so that some new players could join the game
   */
  PAUSING,
  /**
   * @description the ended stage, the game will be ended
   */
  ENDED,
}

/**
 * @description the croupier abstract class that
 * @abstract
 */
abstract class CroupierAbstract<PlayerUnscheduled extends Identifier, Match> {
  constructor(initiator: CroupierInitiator<PlayerUnscheduled>) {
    const { id, player } = initiator;
    this.id = id;
    this.owner = player;
    this.players.push(player);
    this.stage = CroupierScheduledStage.PREPARING;
  }

  /**
   * @description croupier id ( or like a room-id property )
   * @protected
   */
  protected id: string;

  /**
   * @description the owner who can notify croupier to act
   * @protected
   */
  protected owner: PlayerUnscheduled;

  /**
   * @description croupier scheduled stage
   * @protected
   */
  protected stage: CroupierScheduledStage;

  /**
   * @description the players unscheduled array, need to be re-ordered
   * @protected
   */
  protected players: (PlayerUnscheduled)[] = [];

  /**
   * @description the match instance initialized during playing stage
   * @protected
   */
  protected match: Match;

  /**
   * @description the getter for croupier
   * @abstract
   */
  abstract getCroupier(): {
    id: string; owner: PlayerUnscheduled; stage: CroupierScheduledStage;
    players: PlayerUnscheduled[], match?: Match
  };

  /**
   * @description arrange a new player into desk
   * @param player
   * @abstract
   */
  abstract arrange(player: PlayerUnscheduled);

  /**
   * @description re-order the player position
   * @param player
   * @param index
   * @abstract
   */
  abstract reorder(player: PlayerUnscheduled, index: number);

  /**
   * @description start a new match
   * @abstract
   */
  abstract start();

  /**
   * @description restart the match, which will create a new match basing on previous match's result
   * @abstract
   */
  abstract restart();

  /**
   * @description pause current match
   * @abstract
   */
  abstract pause();

  /**
   * @description end all the game
   */
  abstract end();
}

/**
 * @description the interface for handling the interactions from current croupier
 */
interface CroupierInteractive<Croupier, PlayerUnscheduled, Match> {
  /**
   * @description disposable bag
   */
  disposableBag: Subscription[];
  /**
   * @description clear the disposable bag
   */
  unsubscribe(): void

  /**
   * @description when some other subscribe this property,
   * it will receive the new unscheduled player state after be arranged
   */
  onArrangeObservable: Observable<{ player: PlayerUnscheduled, croupier: Croupier }>
  /**
   * @description when some other subscribe this property,
   * it will receive the unscheduled player list with new order after re-ordered
   */
  onReorderObservable: Observable<{ players: PlayerUnscheduled[], croupier: Croupier }>
  /**
   * @description when some other subscribe this property,
   * it will receive the match object after match started
   */
  onStartObservable: Observable<{ match: Match, croupier: Croupier }>
  /**
   * @description when some other subscribe this property,
   * it will receive the match object after match restarted
   */
  onRestartObservable: Observable<{ match: Match, croupier: Croupier }>
  /**
   * @description when some other subscribe this property,
   * it will receive the match object after match paused
   */
  onPauseObservable: Observable<{ match: Match, croupier: Croupier }>
  /**
   * @description when some other subscribe this property,
   * it will receive the match object after match ended
   */
  onEndObservable: Observable<{ match: Match, croupier: Croupier }>

  /**
   * @description add subscriptions for onArrangeObservable
   * @param subscription
   */
  onArrange:(subscription: ({ player, croupier }:
  { player: PlayerUnscheduled, croupier: Croupier }) => void)
  => Observable<{ player: PlayerUnscheduled, croupier: Croupier }>

  /**
   * @description add subscriptions for onReorderObservable
   * @param subscription
   */
  onReorder:(subscription: ({ players, croupier }:
  { players: PlayerUnscheduled[], croupier: Croupier }) => void)
  => Observable<{ players: PlayerUnscheduled[], croupier: Croupier }>

  /**
   * @description add subscriptions for onStartObservable
   * @param subscription
   */
  onStart:(subscription: ({ match, croupier }:
  { match: Match, croupier: Croupier }) => void)
  => Observable<{ match: Match, croupier: Croupier }>

  /**
   * @description add subscriptions for onRestartObservable
   * @param subscription
   */
  onRestart: (subscription: ({ match, croupier }:
  { match: Match, croupier: Croupier }) => void)
  => Observable<{ match: Match, croupier: Croupier }>

  /**
   * @description add subscriptions for onPauseObservable
   * @param subscription
   */
  onPause: (subscription: ({ match, croupier }:
  { match: Match, croupier: Croupier }) => void)
  => Observable<{ match: Match, croupier: Croupier }>

  /**
   * @description add subscriptions for onEndObservable
   * @param subscription
   */
  onEnd:(subscription: ({ match, croupier }:
  { match: Match, croupier: Croupier }) => void)
  =>Observable<{ match: Match, croupier: Croupier }>
}

export {
  CroupierAbstract,
  CroupierInteractive,
  CroupierInitiator,
  CroupierScheduledStage,
};
