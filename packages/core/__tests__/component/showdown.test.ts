import { Subject } from 'rxjs';
import { PlayerShowDownActionEnum } from '@chip-chip/schema/lib';
import { Player } from '../../src/component/player';
import { PlayerShowDownAction } from '../../src/component/action';
import { Showdown } from '../../src/component/showdown';

const showdownSetup = () => {
  const players = [
    new Player({ id: '1', chips: 1000, name: 'player1' }),
    new Player({ id: '2', chips: 1000, name: 'player2' }),
    new Player({ id: '3', chips: 1000, name: 'player3' }),
  ];

  players[0].setFolded(true);

  const channel = new Subject<PlayerShowDownAction>();

  const showdown = new Showdown({
    players,
    channel,
  });

  return ({
    players, channel, showdown,
  });
};

describe('Showdown Component', () => {
  let initiator;

  beforeEach(() => {
    initiator = showdownSetup();
  });

  afterEach(() => {
    const { showdown } = showdownSetup();
    showdown.end();
  });

  it('should decide the winners after the PlayerShowDownAction.END action', (done) => {
    const { showdown, channel, players } = initiator;

    showdown.onEnd(({ players: winners }) => {
      if (winners.length !== 1) return;
      done();
    });

    showdown.play(new Subject());

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
