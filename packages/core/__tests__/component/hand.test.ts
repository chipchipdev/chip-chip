import { Subject } from 'rxjs';
import { PlayerActionEnum, PlayerShowDownActionEnum, RoundStateEnum } from '@chip-chip/schema/lib';
import { Hand } from '../../src/component/hand';
import { Player } from '../../src/component/player';
import { PlayerAction, PlayerShowDownAction } from '../../src/component/action';
import { Pool } from '../../src/component/pool';
import { Round } from '../../src/component/round';

const handSetup = (position: number) => {
  const chips = 1000;
  const wager = 1;
  const players = [
    new Player({ id: '1', chips, name: 'player1' }),
    new Player({ id: '2', chips, name: 'player2' }),
    new Player({ id: '3', chips, name: 'player3' }),
  ];

  const channel = new Subject<PlayerAction | PlayerShowDownAction>();
  const pool = new Pool<Hand, Round<Hand>>({
    players, chips, channel, wager, position,
  });

  const hand = new Hand({
    chips,
    wager,
    players,
    channel,
    pool,
    position,
  });

  return {
    chips, wager, players, channel, pool, hand,
  };
};

describe('Hand Component', () => {
  let initiator;

  beforeEach(() => {
    initiator = handSetup(1);
  });

  it('should go to flop round that after pre-flop there is no winner decided', (done) => {
    const { hand, channel, players } = initiator;

    hand.onPlay(({ is }) => {
      if (is !== RoundStateEnum.FLOP) return;
      done();
    });

    hand.start();

    setTimeout(() => {
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
    });
  });

  it(
    'should migrate the subscriptions from pre-flop to flop and turn round when round changed',
    (done) => {
      const { hand, channel, players } = initiator;

      const round = hand.getRound();

      round?.onPlay(({ round: r }) => {
        if (
          r.is === RoundStateEnum.TURN
          && !players
            .filter((p) => p.getPlayer().joined && !p.getPlayer().folded)
            .find((p) => p.getPlayer().chips !== 988)
        ) {
          done();
        }
      });

      hand.start();

      setTimeout(() => {
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
      });
    },
  );

  it('should settle the chips result if there is a winner in each round',
    (done) => {
      const { hand, channel, players } = initiator;

      hand.onEnd(() => {
        if (players[1].getPlayer().chips === 1014) {
          done();
        }
      });

      hand.start();

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

        setTimeout(() => {
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
        });

        setTimeout(() => {
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
        });
      });
    });

  it('should settle the chips result if there is a winner in each round( for all-in player )',
    (done) => {
      const { hand, channel, players } = initiator;

      hand.onEnd(() => {
        if (players[2].getPlayer().chips === 1004) done();
      });

      hand.start();

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

        setTimeout(() => {
        // flop
          channel.next({
            id: players[2].getPlayer().id,
            type: PlayerActionEnum.BET,
            amount: 998,
          });

          channel.next({
            id: players[0].getPlayer().id,
            type: PlayerActionEnum.FOLD,
          });

          channel.next({
            id: players[1].getPlayer().id,
            type: PlayerActionEnum.FOLD,
          });
        });
      });
    });

  it('should calculate the right answer that if there are many complex actions that could decide the winner',
    (done) => {
      const { hand, channel, players } = initiator;

      hand.onEnd(() => {
        done();
      });

      hand.start();

      setTimeout(() => {
      // pre-flop
        channel.next({
          id: players[1].getPlayer().id,
          type: PlayerActionEnum.RAISE,
          amount: 10,
        });

        channel.next({
          id: players[2].getPlayer().id,
          type: PlayerActionEnum.CALL,
        });

        channel.next({
          id: players[0].getPlayer().id,
          type: PlayerActionEnum.RAISE,
          amount: 20,
        });

        channel.next({
          id: players[1].getPlayer().id,
          type: PlayerActionEnum.CALL,
        });

        channel.next({
          id: players[2].getPlayer().id,
          type: PlayerActionEnum.RAISE,
          amount: 50,
        });

        channel.next({
          id: players[0].getPlayer().id,
          type: PlayerActionEnum.CALL,
        });

        channel.next({
          id: players[1].getPlayer().id,
          type: PlayerActionEnum.CALL,
        });

        // flop
        channel.next({
          id: players[2].getPlayer().id,
          type: PlayerActionEnum.BET,
          amount: 50,
        });

        channel.next({
          id: players[0].getPlayer().id,
          type: PlayerActionEnum.CALL,
        });

        channel.next({
          id: players[1].getPlayer().id,
          type: PlayerActionEnum.CALL,
        });

        // turn
        channel.next({
          id: players[2].getPlayer().id,
          type: PlayerActionEnum.BET,
          amount: 100,
        });

        channel.next({
          id: players[0].getPlayer().id,
          type: PlayerActionEnum.FOLD,
        });

        channel.next({
          id: players[1].getPlayer().id,
          type: PlayerActionEnum.CALL,
        });

        // river
        channel.next({
          id: players[2].getPlayer().id,
          type: PlayerActionEnum.FOLD,
        });
      });
    });

  it('should calculate the right answer that if there are many complex actions that could decide the winner(all-in contains)',
    (done) => {
      const { hand, channel, players } = initiator;

      hand.onEnd(() => {
        done();
      });

      hand.start();

      setTimeout(() => {
        // pre-flop
        channel.next({
          id: players[1].getPlayer().id,
          type: PlayerActionEnum.RAISE,
          amount: 10,
        });

        channel.next({
          id: players[2].getPlayer().id,
          type: PlayerActionEnum.CALL,
        });

        channel.next({
          id: players[0].getPlayer().id,
          type: PlayerActionEnum.RAISE,
          amount: 20,
        });

        channel.next({
          id: players[1].getPlayer().id,
          type: PlayerActionEnum.CALL,
        });

        channel.next({
          id: players[2].getPlayer().id,
          type: PlayerActionEnum.RAISE,
          amount: 50,
        });

        channel.next({
          id: players[0].getPlayer().id,
          type: PlayerActionEnum.CALL,
        });

        channel.next({
          id: players[1].getPlayer().id,
          type: PlayerActionEnum.CALL,
        });

        // flop
        channel.next({
          id: players[2].getPlayer().id,
          type: PlayerActionEnum.BET,
          amount: 840,
        });

        channel.next({
          id: players[0].getPlayer().id,
          type: PlayerActionEnum.CALL,
        });

        channel.next({
          id: players[1].getPlayer().id,
          type: PlayerActionEnum.FOLD,
        });

        // turn
        channel.next({
          id: players[2].getPlayer().id,
          type: PlayerActionEnum.BET,
          amount: 110,
        });

        channel.next({
          id: players[0].getPlayer().id,
          type: PlayerActionEnum.FOLD,
        });
      });
    });

  it('should decide the winners with showdown', (done) => {
    const { hand, channel, players } = initiator;

    hand.onEnd(() => {
      done();
    });

    hand.start();

    setTimeout(() => {
      // pre-flop
      channel.next({
        id: players[1].getPlayer().id,
        type: PlayerActionEnum.RAISE,
        amount: 10,
      });

      channel.next({
        id: players[2].getPlayer().id,
        type: PlayerActionEnum.CALL,
      });

      channel.next({
        id: players[0].getPlayer().id,
        type: PlayerActionEnum.RAISE,
        amount: 20,
      });

      channel.next({
        id: players[1].getPlayer().id,
        type: PlayerActionEnum.CALL,
      });

      channel.next({
        id: players[2].getPlayer().id,
        type: PlayerActionEnum.RAISE,
        amount: 50,
      });

      channel.next({
        id: players[0].getPlayer().id,
        type: PlayerActionEnum.CALL,
      });

      channel.next({
        id: players[1].getPlayer().id,
        type: PlayerActionEnum.CALL,
      });

      // flop
      channel.next({
        id: players[2].getPlayer().id,
        type: PlayerActionEnum.BET,
        amount: 840,
      });

      channel.next({
        id: players[0].getPlayer().id,
        type: PlayerActionEnum.CALL,
      });

      channel.next({
        id: players[1].getPlayer().id,
        type: PlayerActionEnum.CALL,
      });

      // turn
      channel.next({
        id: players[2].getPlayer().id,
        type: PlayerActionEnum.CHECK,
      });

      channel.next({
        id: players[0].getPlayer().id,
        type: PlayerActionEnum.CHECK,
      });

      channel.next({
        id: players[1].getPlayer().id,
        type: PlayerActionEnum.CHECK,
      });

      // river
      channel.next({
        id: players[2].getPlayer().id,
        type: PlayerActionEnum.CHECK,
      });

      channel.next({
        id: players[0].getPlayer().id,
        type: PlayerActionEnum.CHECK,
      });

      channel.next({
        id: players[1].getPlayer().id,
        type: PlayerActionEnum.CHECK,
      });

      setTimeout(() => {
        channel.next({
          id: players[0].getPlayer().id,
          type: PlayerShowDownActionEnum.IN,
        });

        channel.next({
          id: players[1].getPlayer().id,
          type: PlayerShowDownActionEnum.IN,
        });

        channel.next({
          id: players[2].getPlayer().id,
          type: PlayerShowDownActionEnum.IN,
        });

        channel.next({
          id: players[2].getPlayer().id,
          type: PlayerShowDownActionEnum.OUT,
        });

        channel.next({
          id: players[0].getPlayer().id,
          type: PlayerShowDownActionEnum.END,
        });
      });
    });
  });

  it('should decide the winners with showdown(all-in contains)', (done) => {
    const { hand, channel, players } = initiator;

    hand.onEnd(() => {
      done();
    });

    hand.start();

    setTimeout(() => {
      // pre-flop
      channel.next({
        id: players[1].getPlayer().id,
        type: PlayerActionEnum.RAISE,
        amount: 10,
      });

      channel.next({
        id: players[2].getPlayer().id,
        type: PlayerActionEnum.CALL,
      });

      channel.next({
        id: players[0].getPlayer().id,
        type: PlayerActionEnum.RAISE,
        amount: 20,
      });

      channel.next({
        id: players[1].getPlayer().id,
        type: PlayerActionEnum.CALL,
      });

      channel.next({
        id: players[2].getPlayer().id,
        type: PlayerActionEnum.RAISE,
        amount: 50,
      });

      channel.next({
        id: players[0].getPlayer().id,
        type: PlayerActionEnum.CALL,
      });

      channel.next({
        id: players[1].getPlayer().id,
        type: PlayerActionEnum.CALL,
      });

      // flop
      channel.next({
        id: players[2].getPlayer().id,
        type: PlayerActionEnum.BET,
        amount: 950,
      });

      channel.next({
        id: players[0].getPlayer().id,
        type: PlayerActionEnum.CALL,
      });

      channel.next({
        id: players[1].getPlayer().id,
        type: PlayerActionEnum.CALL,
      });

      setTimeout(() => {
        channel.next({
          id: players[0].getPlayer().id,
          type: PlayerShowDownActionEnum.IN,
        });

        channel.next({
          id: players[1].getPlayer().id,
          type: PlayerShowDownActionEnum.IN,
        });

        channel.next({
          id: players[2].getPlayer().id,
          type: PlayerShowDownActionEnum.IN,
        });

        channel.next({
          id: players[2].getPlayer().id,
          type: PlayerShowDownActionEnum.OUT,
        });

        channel.next({
          id: players[0].getPlayer().id,
          type: PlayerShowDownActionEnum.END,
        });
      });
    });
  });
});
