import { Subject } from 'rxjs';
import { CroupierAction, PlayerAction, PlayerShowDownAction } from './action';

export class Channel<PlayerUnscheduled extends { id: string, name: string }> {
  protected channel: Subject<
  CroupierAction<PlayerUnscheduled>
  | PlayerAction
  | PlayerShowDownAction
  > = new Subject();

  trigger(action: (CroupierAction<PlayerUnscheduled> | PlayerAction | PlayerShowDownAction)) {
    this.channel.next(action);
  }

  getChannel() {
    return this.channel;
  }

  unsubscribe() {
    this.channel.unsubscribe();
  }
}
