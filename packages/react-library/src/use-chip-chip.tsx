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

  useEffect(() => {
    croupier.onArrange(({ croupier: c }) => {
      setPlayersUnscheduled([]);
      setPlayersUnscheduled(c.getCroupier().players);
    });

    croupier.onStart(({ croupier: c }) => {
      setPlayers([]);
      setPlayers(c.getCroupier().playersInGame);
    });

    croupier.onStageChange(({ croupier: c }) => {
      setMatchStage(c.getCroupier().stage);
    });

    hand.onShowdown(() => {
      setInShowdownStage(true);
    });

    round.onPlay(({ round: r }) => {
      setPlayers([]);
      setHandStage(r.is);
      setPlayers(croupier.getCroupier().playersInGame);
    });

    round.onMonitor(({ player }) => {
      setPlayerActing(undefined);
      setPlayerActing(player);
      const { playersInGame, id } = croupier.getCroupier();
      const currentPlayer = playersInGame.find((p) => p.getPlayer().id === id);
      setValidActions(
        currentPlayer?.getPlayer?.().validActions ?? [],
      );
    });

    round.onDeal(() => {
      setPlayers([]);
      setPlayers(croupier.getCroupier().playersInGame);
    });

    showdown.onDeal(({ players: ps }) => {
      setPlayersShowdown([]);
      setPlayersShowdown(ps);
    });

    hand.onEnd(() => {
      setPlayerActing(undefined);
      setValidActions(undefined);
      setHandStage(undefined);
      setInShowdownStage(false);
      setPlayersShowdown([]);
    });
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
