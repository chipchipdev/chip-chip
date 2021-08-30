import { Subject } from 'rxjs';
import { PlayerActionEnum, RoundStateEnum } from '@chip-chip/schema/lib';
import { Round } from '../../src/component/round';
import { Player } from '../../src/component/player';
import { PlayerAction } from '../../src/component/action';
import { Pool } from '../../src/component/pool';
import { Hand } from '../../src/component/hand';

const roundSetup = (position: number) => {
  const chips = 1000;
  const wager = 1;
  const players = [
    new Player({ id: '1', chips, name: 'player1' }),
    new Player({ id: '2', chips, name: 'player2' }),
    new Player({ id: '3', chips, name: 'player3' }),
  ];

  const channel = new Subject<PlayerAction>();

  const pool = new Pool<Hand, Round<Hand>>({
    players, chips, channel, wager, position,
  });

  const round = new Round<Hand>({
    chips, wager, channel, players, pool, position,
  });

  players.forEach((player) => {
    const { chips: c } = player.getPlayer();
    player.setJoined(c > 0);
    player.setFolded(!(c > 0));
    player.setAllin(false);
    player.setBet(false);
  });

  pool.createPot(players.filter(() => true), 0);

  return ({
    chips, wager, players, channel, pool, round,
  });
};

describe('Round Component', () => {
  it(`should auto bet the small blinds
            and big blinds during the pre flop round`,
  () => {
    const { round, players } = roundSetup(1);
    round.play(RoundStateEnum.PRE_FLOP);
    expect(players[2].getPlayer().chips).toBe(999);
    expect(players[0].getPlayer().chips).toBe(998);
  });

  it('should let the UTG have the ability to fold', (done) => {
    const { round, channel, players } = roundSetup(1);

    let doneDuringMonitor = false;
    let doneDuringDeal = false;

    round.onMonitor(({ player }) => {
      if (doneDuringMonitor) return;
      expect(player.getPlayer().id).toBe(players[1].getPlayer().id);
      doneDuringMonitor = true;
      if (doneDuringDeal && doneDuringMonitor) done();
    });

    round.onDeal(({ player }) => {
      if (player.getPlayer().id === players[1].getPlayer().id) {
        expect(player.getPlayer().folded).toBe(true);
        doneDuringDeal = true;
        if (doneDuringDeal && doneDuringMonitor) done();
      }
    });

    round.play(RoundStateEnum.PRE_FLOP);

    setTimeout(() => {
      channel.next({
        id: players[1].getPlayer().id,
        type: PlayerActionEnum.FOLD,
      });
    });
  });

  it('should let the UTG have the ability to call', (done) => {
    const { round, channel, players } = roundSetup(1);

    let doneDuringMonitor = false;
    let doneDuringDeal = false;

    round.onMonitor(({ player }) => {
      if (doneDuringMonitor) return;
      expect(player.getPlayer().id).toBe(players[1].getPlayer().id);
      doneDuringMonitor = true;
      if (doneDuringDeal && doneDuringMonitor) done();
    });

    round.onDeal(({ player }) => {
      if (player.getPlayer().id === players[1].getPlayer().id) {
        expect(player.getPlayer().chips).toBe(998);
        doneDuringDeal = true;
        if (doneDuringDeal && doneDuringMonitor) done();
      }
    });

    round.play(RoundStateEnum.PRE_FLOP);

    setTimeout(() => {
      channel.next({
        id: players[1].getPlayer().id,
        type: PlayerActionEnum.CALL,
      });
    });
  });

  it('should let the UTG have the ability to raise', (done) => {
    const { round, channel, players } = roundSetup(1);

    let doneDuringMonitor = false;
    let doneDuringDeal = false;

    round.onMonitor(({ player }) => {
      if (doneDuringMonitor) return;
      expect(player.getPlayer().id).toBe(players[1].getPlayer().id);
      doneDuringMonitor = true;
      if (doneDuringDeal && doneDuringMonitor) done();
    });

    round.onDeal(({ player }) => {
      if (player.getPlayer().id === players[1].getPlayer().id) {
        expect(player.getPlayer().chips).toBe(990);
        doneDuringDeal = true;
        if (doneDuringDeal && doneDuringMonitor) done();
      }
    });

    round.play(RoundStateEnum.PRE_FLOP);

    setTimeout(() => {
      channel.next({
        id: players[1].getPlayer().id,
        type: PlayerActionEnum.RAISE,
        amount: 10,
      });
    });
  });

  it('shouldn\'t let the UTG have the ability to bet', (done) => {
    const { round, channel, players } = roundSetup(1);

    const handler = jest.fn();

    round.onDeal(({ player }) => {
      if (player.getPlayer().id === players[1].getPlayer().id) {
        handler();
      }
    });

    round.onMonitor(() => {
      setTimeout(() => {
        expect(handler).not.toBeCalled();
        done();
      }, 3000);
    });

    round.play(RoundStateEnum.PRE_FLOP);

    setTimeout(() => {
      channel.next({
        id: players[1].getPlayer().id,
        type: PlayerActionEnum.BET,
      });
    });
  });

  it('shouldn\'t let the UTG have the ability to check', (done) => {
    const { round, channel, players } = roundSetup(1);

    const handler = jest.fn();

    round.onDeal(({ player }) => {
      if (player.getPlayer().id === players[1].getPlayer().id) {
        handler();
      }
    });

    round.onMonitor(() => {
      setTimeout(() => {
        expect(handler).not.toBeCalled();
        done();
      }, 3000);
    });

    round.play(RoundStateEnum.PRE_FLOP);

    setTimeout(() => {
      channel.next({
        id: players[1].getPlayer().id,
        type: PlayerActionEnum.CHECK,
      });
    });
  });
});
