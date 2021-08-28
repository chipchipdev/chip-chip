import {
  RoundAbstract, RoundInteractive, RoundInitiator, HandStatus,
} from '@chip-chip/schema';

import { Pool } from './pool';
import { Hand } from './hand';
import { Player } from './player';

export class Round<PlayerAction>
  extends RoundAbstract<Pool, Hand, Round, Player, PlayerAction, HandStatus>
  implements RoundInteractive<Round<PlayerAction>, Player<PlayerAction>> {

}
