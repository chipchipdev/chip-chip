import { Observable, Subscription } from 'rxjs';

type Identifier = {
  id: string;
};

/**
 * @description the initiator for create a croupier instance
 */
type CroupierInitiator<PlayerUnscheduled extends Identifier, Action> = {
  id: string;
  player: PlayerUnscheduled
  chips: number
  channel: Observable<Action>
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
abstract class CroupierAbstract<PlayerUnscheduled extends Identifier, Match, Action> {
  constructor(initiator: CroupierInitiator<PlayerUnscheduled, Action>) {
    const {
      id, player, chips, channel,
    } = initiator;
    this.id = id;
    this.owner = player;
    this.players.push(player);
    this.stage = CroupierScheduledStage.PREPARING;
    this.chips = chips;
    this.channel = channel;
  }

  /**
   * @description message channel
   */
  protected channel: Observable<Action>;

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
   * @description the initial chips for current match
   * @protected
   */
  protected chips: number;

  /**
   * @description the getter for croupier
   * @abstract
   */
  protected abstract getCroupier(): {
    id: string; owner: PlayerUnscheduled; stage: CroupierScheduledStage;
    players: PlayerUnscheduled[], match?: Match
  };

  /**
   * @description arrange a new player into desk
   * @param player
   * @abstract
   */
  protected abstract arrange(player: PlayerUnscheduled);

  /**
   * @description re-order the player position
   * @param player
   * @param index
   * @abstract
   */
  protected abstract reorder(player: PlayerUnscheduled, index: number);

  /**
   * @description start a new match
   * @abstract
   */
  protected abstract start(wager: number);

  /**
   * @description restart the match, which will create a new match basing on previous match's result
   * @abstract
   */
  protected abstract restart(wager: number);

  /**
   * @description pause current match
   * @abstract
   */
  protected abstract pause();

  /**
   * @description end all the game
   */
  protected abstract end();
}

/**
 * @description the interface for handling the interactions from current croupier
 */
interface CroupierInteractive<Croupier, PlayerUnscheduled, Match> {
  /**
   * @description disposable bag
   */
  disposableBag: Subscription;
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
