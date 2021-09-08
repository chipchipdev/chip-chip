import { useContext, useEffect, useState } from 'react';
import { RoundStateEnum } from '@chip-chip/core/lib';
import { ChipChipContext } from './chip-chip-provider';

export function useChipChip() {
  const { channel, croupier } = useContext(ChipChipContext);
  // players unscheduled
  const [playersUnscheduled, setPlayersUnscheduled] = useState([]);
  // players in game
  const [players, setPlayers] = useState([]);
  const [playersShowdown, setPlayersShowdown] = useState([]);
  // match stage
  const [matchStage, setMatchStage] = useState(croupier.getCroupier().stage);
  // acting player
  const [playerActing, setPlayerActing] = useState(undefined);
  // valid actions
  const [validActions, setValidActions] = useState([]);
  // stage
  const [handStage, setHandStage] = useState<RoundStateEnum>(undefined);
  const [inShowdownStage, setInShowdownStage] = useState(false);

  const { round, showdown } = croupier.getCroupier().match.hand;
  const { hand } = croupier.getCroupier().match;

  const subscriptions = [];

  useEffect(() => {
    subscriptions.push(croupier.onArrange(({ croupier: c }) => {
      setPlayersUnscheduled([]);
      setPlayersUnscheduled(c.getCroupier().players);
    }));

    subscriptions.push(croupier.onStart(({ croupier: c }) => {
      setPlayers([]);
      setPlayers(c.getCroupier().playersInGame);
    }));

    subscriptions.push(croupier.onStageChange(({ croupier: c }) => {
      setMatchStage(c.getCroupier().stage);
    }));

    subscriptions.push(hand.onShowdown(() => {
      setInShowdownStage(true);
    }));

    subscriptions.push(round.onPlay(({ round: r }) => {
      setPlayers([]);
      setHandStage(r.is);
      setPlayers(croupier.getCroupier().playersInGame);
    }));

    subscriptions.push(round.onMonitor(({ player }) => {
      setPlayerActing(undefined);
      setPlayerActing(player);
      const { playersInGame, id } = croupier.getCroupier();
      const currentPlayer = playersInGame.find((p) => p.getPlayer().id === id);
      setValidActions(
        currentPlayer?.getPlayer?.().validActions ?? [],
      );
    }));

    subscriptions.push(round.onDeal(() => {
      setPlayers([]);
      setPlayers(croupier.getCroupier().playersInGame);
    }));

    subscriptions.push(showdown.onDeal(({ players: ps }) => {
      setPlayersShowdown([]);
      setPlayersShowdown(ps);
    }));

    subscriptions.push(hand.onEnd(() => {
      setPlayerActing(undefined);
      setValidActions(undefined);
      setHandStage(undefined);
      setInShowdownStage(false);
      setPlayersShowdown([]);
    }));

    return () => {
      subscriptions.forEach((subscription) => {
        subscription?.unsubscribe?.();
      });
    };
  }, []);

  return {
    croupier,
    channel,
    matchStage,
    handStage,
    inShowdownStage,
    players,
    playerActing,
    playersShowdown,
    playersUnscheduled,
    validActions,
  };
}
