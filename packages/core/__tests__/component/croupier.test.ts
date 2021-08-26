import * as casual from 'casual';
import { CroupierScheduledStage } from '@chip-chip/schema';
import { Croupier } from '../../src/component/croupier';

type FakePlayerUnscheduled = {};

type FakeMatch = {};

const setupFakeCroupier = () => {
  const fakeId = casual.uuid;
  const fakePlayer = {} as FakePlayerUnscheduled;
  return new Croupier<FakePlayerUnscheduled, FakeMatch>({
    id: fakeId,
    player: fakePlayer,
  });
};

describe('Croupier Component', () => {
  it('should create a croupier instance via required id and player-unscheduled', () => {
    const fakeId = casual.uuid;
    const fakePlayer = {} as FakePlayerUnscheduled;
    const fakeCroupier = new Croupier<FakePlayerUnscheduled, FakeMatch>({
      id: fakeId,
      player: fakePlayer,
    });

    expect.objectContaining<Croupier<FakePlayerUnscheduled, FakeMatch>>(fakeCroupier);

    const currentCroupier = fakeCroupier.getCroupier();
    expect(currentCroupier.id).toBe(fakeId);
    expect(currentCroupier.owner).toBe(fakePlayer);
    expect(currentCroupier.stage).toBe(CroupierScheduledStage.PREPARING);
  });

  it(
    `should set the new player in players list synchronously by arrange func,
      and if someone subscribe the onArrange event,
      someone will receive the changes as well`,
    (done) => {
      const fakeCroupier = setupFakeCroupier();
      const fakePlayer = {} as FakePlayerUnscheduled;

      fakeCroupier.onArrange.subscribe((({ player, croupier }) => {
        expect(player).toStrictEqual(fakePlayer);
        expect(croupier).toStrictEqual(fakeCroupier);
        done();
      }));

      fakeCroupier.arrange(fakePlayer);

      const { players } = fakeCroupier.getCroupier();
      const currentPlayer = players.find((p) => p === fakePlayer);
      expect(currentPlayer).toBeDefined();
    },
  );
});
