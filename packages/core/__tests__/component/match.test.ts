import { Subject } from 'rxjs';
import { Croupier } from '../../src/component/croupier';
import { Match } from '../../src/component/match';
import { PlayerAction } from '../../src/component/action';
import { Pool } from '../../src/component/pool';
import { Player } from '../../src/component/player';

describe('Playing A Match', () => {
  it('should play a whole game', async () => {
    const channel = new Subject<PlayerAction>();

    const player1 = new Player({ id: '1', chips: 1000, name: 'player1' });
    const player2 = new Player({ id: '2', chips: 1000, name: 'player2' });
    const player3 = new Player({ id: '3', chips: 1000, name: 'player3' });

    const match = new Match({
      channel,
      chips: 1000,
      pool: new Pool({
        channel,
        chips: 1000,
        players: [player1, player2, player3],
        wager: 1,
      }),
      players: [player1, player2, player3],
      wager: 1,
    });

    match.start();
  });
});
