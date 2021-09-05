import casual from 'casual';
import { CroupierActionEnum, PlayerActionEnum } from '../../src/base';
import { Channel, Croupier } from '../../src';

describe('Croupier Component', () => {
  it('should create the croupier', (done) => {
    const fakeId = casual.uuid;
    const fakeChannel = new Channel();
    const fakePlayer = { id: casual.uuid, name: casual.name };
    const fakeCroupier = new Croupier<typeof fakePlayer>({
      id: fakeId,
      player: fakePlayer,
      chips: 1000,
      channel: fakeChannel.getChannel(),
    });

    let times = 0;

    fakeCroupier.getCroupier().match.hand.onEnd(() => {
      times += 1;
      if (times !== 2) return;

      setTimeout(() => {
        fakeChannel.trigger({
          id: fakePlayer.id,
          type: CroupierActionEnum.PAUSE,
        });

        fakeChannel.trigger({
          id: fakePlayer.id,
          type: CroupierActionEnum.ARRANGE,
          payload: {
            id: casual.uuid,
            name: casual.name,
          },
        });

        fakeChannel.trigger({
          id: fakePlayer.id,
          type: CroupierActionEnum.RESTART,
          payload: {
            wager: 1,
          },
        });

        if (fakeCroupier.getCroupier().players.length === 4) {
          done();
        }
      });
    });

    setTimeout(() => {
      const newId = casual.uuid;

      fakeChannel.trigger({
        id: fakePlayer.id,
        type: CroupierActionEnum.ARRANGE,
        payload: {
          id: newId,
          name: casual.name,
        },
      });

      fakeChannel.trigger({
        id: fakePlayer.id,
        type: CroupierActionEnum.ARRANGE,
        payload: {
          id: casual.uuid,
          name: casual.name,
        },
      });

      fakeChannel.trigger({
        id: fakePlayer.id,
        type: CroupierActionEnum.REORDER,
        payload: {
          id: newId,
          index: 0,
        },
      });

      fakeChannel.trigger({
        id: fakePlayer.id,
        type: CroupierActionEnum.START,
        payload: {
          wager: 1,
        },
      });

      if (
        fakeCroupier.getCroupier().players.length === 3
          && fakeCroupier.getCroupier().players[0].id === newId
          && fakeCroupier.getCroupier().match.playing
      ) {
        const { players } = fakeCroupier.getCroupier();

        // hand 1
        setTimeout(() => {
          // pre-flop
          fakeChannel.trigger({
            id: players[1].id,
            type: PlayerActionEnum.CALL,
          });

          fakeChannel.trigger({
            id: players[2].id,
            type: PlayerActionEnum.CALL,
          });

          fakeChannel.trigger({
            id: players[0].id,
            type: PlayerActionEnum.CHECK,
          });
          // flop
          fakeChannel.trigger({
            id: players[2].id,
            type: PlayerActionEnum.BET,
            amount: 10,
          });

          fakeChannel.trigger({
            id: players[0].id,
            type: PlayerActionEnum.FOLD,
          });

          fakeChannel.trigger({
            id: players[1].id,
            type: PlayerActionEnum.CALL,
          });

          // TURN
          fakeChannel.trigger({
            id: players[2].id,
            type: PlayerActionEnum.CHECK,
          });

          fakeChannel.trigger({
            id: players[1].id,
            type: PlayerActionEnum.CHECK,
          });

          // RIVER
          fakeChannel.trigger({
            id: players[2].id,
            type: PlayerActionEnum.FOLD,
          });
        }, 1000);

        // hand 2
        setTimeout(() => {
          // pre-flop
          fakeChannel.trigger({
            id: players[2].id,
            type: PlayerActionEnum.CALL,
          });

          fakeChannel.trigger({
            id: players[0].id,
            type: PlayerActionEnum.CALL,
          });

          fakeChannel.trigger({
            id: players[1].id,
            type: PlayerActionEnum.CHECK,
          });
          // flop
          fakeChannel.trigger({
            id: players[0].id,
            type: PlayerActionEnum.BET,
            amount: 10,
          });

          fakeChannel.trigger({
            id: players[1].id,
            type: PlayerActionEnum.FOLD,
          });

          fakeChannel.trigger({
            id: players[2].id,
            type: PlayerActionEnum.CALL,
          });

          // TURN
          fakeChannel.trigger({
            id: players[0].id,
            type: PlayerActionEnum.CHECK,
          });

          fakeChannel.trigger({
            id: players[2].id,
            type: PlayerActionEnum.CHECK,
          });

          // RIVER
          fakeChannel.trigger({
            id: players[0].id,
            type: PlayerActionEnum.FOLD,
          });
        }, 2000);
      }
    });
  });
});
