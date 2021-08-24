import * as casual from 'casual';

import { firstValueFrom } from 'rxjs';
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
    'should set the chips by setChips func, '
      + 'and if someone subscribe the onChipsChange event,'
      + 'someone will receive the changes as well',
    async () => {
      const fakeUuid = casual.uuid;
      const fakeName = casual.name;
      const fakeChips = 1000;
      const fakeChipsChanged = 100;
      const player = new Player({ id: fakeUuid, name: fakeName, chips: fakeChips });

      player.onChipsChange.subscribe((p) => {
        const { chips } = p.getPlayer();
        expect(chips).toBe(fakeChipsChanged);
      });

      player.setChips(fakeChipsChanged);
    },
  );
});
