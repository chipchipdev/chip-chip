import { Observable } from 'rxjs';
import { MatchSharedInteractive } from './match.abstract';

enum ShowdownEnum {
  SHOWDOWN = 'SHOWDOWN',
}

abstract class ShowdownAbstract<Player, PlayerShowdownAction, HandStatus> {
  protected channel: Observable<PlayerShowdownAction>;

  protected players: Player[];

  abstract winners: Player[];

  constructor({ channel, players }:
  { channel: Observable<PlayerShowdownAction>, players: Player[] }) {
    this.channel = channel;
    this.players = players;
  }

  abstract play(status: Observable<HandStatus>): Observable<HandStatus>;

  abstract deal(action: PlayerShowdownAction, status: Observable<HandStatus>);

  abstract end();
}

interface ShowdownInteractive<Player>
  extends MatchSharedInteractive{

  /**
   * @description when some other subscribe this property,
   * it will receive the match instance after it start to play
   */
  onPlayObservable: Observable<void>
  /**
   * @description when some other subscribe this property,
   * it will receive the match instance after it start to play
   */
  onDealObservable: Observable<{ players: Player[] }>

  /**
   * @description when some other subscribe this property,
   * it will receive the match instance after it start to play
   */
  onEndObservable: Observable<{ players: Player[] }>

  /**
   * @description add subscriptions for onPlayObservable
   * @param subscription
   */
  onPlay:(subscription: () => void)
  => Observable<void>

  /**
   * @description add subscriptions for onDealObservable
   * @param subscription
   */
  onDeal:(subscription: ({ players }: { players: Player[] }) => void)
  => Observable<{ players: Player[] }>

  /**
   * @description add subscriptions for onEndObservable
   * @param subscription
   */
  onEnd:(subscription: ({ players }: { players: Player[] }) => void)
  => Observable<{ players: Player[] }>
}

export {
  ShowdownAbstract,
  ShowdownInteractive,
  ShowdownEnum,
};
