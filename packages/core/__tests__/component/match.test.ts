import { Subject } from 'rxjs';
import { PlayerActionEnum } from '@chip-chip/schema/lib';
import { Player } from '../../src/component/player';
import { PlayerAction, PlayerShowDownAction } from '../../src/component/action';
import { Pool } from '../../src/component/pool';
import { Hand } from '../../src/component/hand';
import { Round } from '../../src/component/round';
import { Match } from '../../src/component/match';

const matchSetup = () => {
  const chips = 1000;
  const wager = 1;
  const players = [
    new Player({ id: '1', chips, name: 'player1' }),
    new Player({ id: '2', chips, name: 'player2' }),
    new Player({ id: '3', chips, name: 'player3' }),
  ];

  const channel = new Subject<PlayerAction | PlayerShowDownAction>();
  const pool = new Pool<Hand, Round<Hand>>({
    players, chips, channel, wager,
  });

  const match = new Match({
    chips, wager, players, channel, pool,
  });

  return {
    chips, wager, players, channel, pool, match,
  };
};

describe('Match Component', () => {
  it(`should play hands automatically, and if pause triggered, 
            stop after current hand ended`,
  (done) => {
    const { match, channel, players } = matchSetup();

    let times = 0;

    match.hand.onEnd(() => {
      times += 1;
      if (times !== 2) return;
      done();
    });

    match.start(0);

    // hand 1
    setTimeout(() => {
      // pre-flop
      channel.next({
        id: players[1].getPlayer().id,
        type: PlayerActionEnum.CALL,
      });

      channel.next({
        id: players[2].getPlayer().id,
        type: PlayerActionEnum.CALL,
      });

      channel.next({
        id: players[0].getPlayer().id,
        type: PlayerActionEnum.CHECK,
      });
      // flop
      channel.next({
        id: players[2].getPlayer().id,
        type: PlayerActionEnum.BET,
        amount: 10,
      });

      channel.next({
        id: players[0].getPlayer().id,
        type: PlayerActionEnum.FOLD,
      });

      channel.next({
        id: players[1].getPlayer().id,
        type: PlayerActionEnum.CALL,
      });

      // TURN
      channel.next({
        id: players[2].getPlayer().id,
        type: PlayerActionEnum.CHECK,
      });

      channel.next({
        id: players[1].getPlayer().id,
        type: PlayerActionEnum.CHECK,
      });

      // RIVER
      channel.next({
        id: players[2].getPlayer().id,
        type: PlayerActionEnum.FOLD,
      });
    }, 1000);

    // hand 2
    setTimeout(() => {
      // pre-flop
      channel.next({
        id: players[2].getPlayer().id,
        type: PlayerActionEnum.CALL,
      });

      channel.next({
        id: players[0].getPlayer().id,
        type: PlayerActionEnum.CALL,
      });

      channel.next({
        id: players[1].getPlayer().id,
        type: PlayerActionEnum.CHECK,
      });
      // flop
      channel.next({
        id: players[0].getPlayer().id,
        type: PlayerActionEnum.BET,
        amount: 10,
      });

      channel.next({
        id: players[1].getPlayer().id,
        type: PlayerActionEnum.FOLD,
      });

      channel.next({
        id: players[2].getPlayer().id,
        type: PlayerActionEnum.CALL,
      });

      // TURN
      channel.next({
        id: players[0].getPlayer().id,
        type: PlayerActionEnum.CHECK,
      });

      channel.next({
        id: players[2].getPlayer().id,
        type: PlayerActionEnum.CHECK,
      });

      // RIVER
      channel.next({
        id: players[0].getPlayer().id,
        type: PlayerActionEnum.FOLD,
      });
    }, 2000);
  });
});
