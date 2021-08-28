import * as casual from 'casual';
import { Player } from '../../src/component/player';

type FakePlayerAction = {};

const setupFakePlayer = () => {
  const fakeUuid = casual.uuid;
  const fakeName = casual.name;
  const fakeChips = 1000;
  return new Player<FakePlayerAction>({ id: fakeUuid, name: fakeName, chips: fakeChips });
};

describe('Player Component', () => {
  it('should create the player instance successfully via id, name, initialize chips', () => {
    const fakeUuid = casual.uuid;
    const fakeName = casual.name;
    const fakeChips = 1000;
    const player = new Player({ id: fakeUuid, name: fakeName, chips: fakeChips });

    expect.objectContaining<Player<FakePlayerAction>>(player);

    const currentPlayer = player.getPlayer();

    expect(currentPlayer.id).toBe(fakeUuid);
    expect(currentPlayer.name).toBe(fakeName);
    expect(currentPlayer.chips).toBe(fakeChips);
  });

  it(`should set the chips synchronously by setChips func,
      and if someone subscribe the onChipsChange event,
      someone will receive the changes as well`, (done) => {
    const fakePlayer = setupFakePlayer();
    const fakeChipsChanged = 100;

    fakePlayer.onChipsChange(({ chips, player }) => {
      expect(chips).toBe(fakeChipsChanged);
      expect(player.getPlayer().chips).toBe(fakeChipsChanged);
      done();
    });

    fakePlayer.setChips(fakeChipsChanged);
    const { chips } = fakePlayer.getPlayer();

    expect(chips).toBe(fakeChipsChanged);
  });

  it(`should set the joined state synchronously by setJoined func,
      and if someone subscribe the onJoinedStateChange event,
      someone will receive the changes as well`, (done) => {
    const fakePlayer = setupFakePlayer();
    const fakeJoinedState = false;

    fakePlayer.onJoinedStateChange(({ joined, player }) => {
      expect(player.getPlayer().joined).toBe(fakeJoinedState);
      expect(joined).toBe(fakeJoinedState);
      done();
    });

    fakePlayer.setJoined(fakeJoinedState);
    const { joined } = fakePlayer.getPlayer();

    expect(joined).toBe(fakeJoinedState);
  });

  it(`should set the folded state synchronously by setFolded func,
      and if someone subscribe the onFoldedStateChange event,
      someone will receive the changes as well`, (done) => {
    const fakePlayer = setupFakePlayer();
    const fakeFoldedState = false;

    fakePlayer.onFoldedStateChange(({ folded, player }) => {
      expect(player.getPlayer().folded).toBe(fakeFoldedState);
      expect(folded).toBe(fakeFoldedState);
      done();
    });

    fakePlayer.setFolded(fakeFoldedState);
    const { folded } = fakePlayer.getPlayer();

    expect(folded).toBe(fakeFoldedState);
  });

  it(`should set the allin state synchronously by setAllin func,
      and if someone subscribe the onAllinStateChange event,
      someone will receive the changes as well`, (done) => {
    const fakePlayer = setupFakePlayer();
    const fakeAllinState = false;

    fakePlayer.onAllinStateChange(({ allin, player }) => {
      expect(player.getPlayer().allin).toBe(fakeAllinState);
      expect(allin).toBe(fakeAllinState);
      done();
    });

    fakePlayer.setAllin(fakeAllinState);
    const { allin } = fakePlayer.getPlayer();

    expect(allin).toBe(fakeAllinState);
  });

  it(`should set the bet state synchronously by setBet func,
      and if someone subscribe the onBetStateChange event,
      someone will receive the changes as well`, (done) => {
    const fakePlayer = setupFakePlayer();
    const fakeBetState = false;

    fakePlayer.onBetStateChange(({ bet, player }) => {
      expect(player.getPlayer().bet).toBe(fakeBetState);
      expect(bet).toBe(fakeBetState);
      done();
    });

    fakePlayer.setBet(fakeBetState);
    const { bet } = fakePlayer.getPlayer();

    expect(bet).toBe(fakeBetState);
  });

  it(`should set the optioned state synchronously by setOptioned func,
      and if someone subscribe the onOptionedStateChange event,
      someone will receive the changes as well`, (done) => {
    const fakePlayer = setupFakePlayer();
    const fakeOptionedState = false;

    fakePlayer.onOptionedStateChange(({ optioned, player }) => {
      expect(player.getPlayer().optioned).toBe(fakeOptionedState);
      expect(optioned).toBe(fakeOptionedState);
      done();
    });

    fakePlayer.setOptioned(fakeOptionedState);
    const { optioned } = fakePlayer.getPlayer();

    expect(optioned).toBe(fakeOptionedState);
  });

  it(`should set the player action synchronously by setAction func,
      and if someone subscribe the onActionChange event,
      someone will receive the changes as well`, (done) => {
    const fakePlayer = setupFakePlayer();
    const fakeAction = {} as FakePlayerAction;

    fakePlayer.onActionChange(({ action, player }) => {
      expect(player.getPlayer().action).toBe(fakeAction);
      expect(action).toBe(fakeAction);
      done();
    });

    fakePlayer.setAction(fakeAction);
    const { action } = fakePlayer.getPlayer();
    expect(action).toBe(fakeAction);
  });
});
