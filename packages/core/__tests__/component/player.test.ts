import * as casual from 'casual';
import { Player } from '../../src/component/player';

describe('Player Component', () => {
  it('should create the player instance successfully via id, name, initialize chips', () => {
    const fakeUuid = casual.uuid;
    const fakeName = casual.name;
    const fakeChips = 1000;
    const player = new Player({ id: fakeUuid, name: fakeName, chips: fakeChips });

    expect.objectContaining<Player>(player);

    const currentPlayer = player.getPlayer();

    expect(currentPlayer.id).toBe(fakeUuid);
    expect(currentPlayer.name).toBe(fakeName);
    expect(currentPlayer.chips).toBe(fakeChips);
  });

  it(
    `should set the chips synchronously by setChips func,
      and if someone subscribe the onChipsChange event,
      someone will receive the changes as well`,
    async () => {
      const fakeUuid = casual.uuid;
      const fakeName = casual.name;
      const fakeChips = 1000;
      const fakeChipsChanged = 100;
      const fakePlayer = new Player({ id: fakeUuid, name: fakeName, chips: fakeChips });

      fakePlayer.onChipsChange.subscribe(({ chips, player }) => {
        expect(chips).toBe(fakeChipsChanged);
        expect(player.getPlayer().chips).toBe(fakeChipsChanged);
      });

      fakePlayer.setChips(fakeChipsChanged);
      const { chips } = fakePlayer.getPlayer();

      expect(chips).toBe(fakeChipsChanged);
    },
  );

  it(
    `should set the joined state synchronously by setJoined func,
      and if someone subscribe the onJoinedChange event,
      someone will receive the changes as well`,
    async () => {
      const fakeUuid = casual.uuid;
      const fakeName = casual.name;
      const fakeChips = 1000;
      const fakeJoinedState = false;
      const fakePlayer = new Player({ id: fakeUuid, name: fakeName, chips: fakeChips });

      fakePlayer.onJoinedStateChange.subscribe(({ joined, player }) => {
        expect(player.getPlayer().joined).toBe(fakeJoinedState);
        expect(joined).toBe(fakeJoinedState);
      });

      fakePlayer.setJoined(fakeJoinedState);
      const { joined } = fakePlayer.getPlayer();

      expect(joined).toBe(fakeJoinedState);
    },
  );
});
