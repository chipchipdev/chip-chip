import React from 'react';
import {
  Channel, CroupierScheduledStage, RoundStateEnum,
} from '@chip-chip/core';
import ReactDOM from 'react-dom';
import { ChipChipProvider } from './chip-chip-provider';
import { useChipChip } from './use-chip-chip';

const channel = new Channel<{ id: string; name: string }>();

// @ts-ignore
window.$ = channel;

const App = () => {
  const {
    playersUnscheduled,
    playerActing,
    players,
    validActions,
    matchStage,
    handStage,
    inShowdownStage,
    playersShowdown,
  } = useChipChip();

  return (
    <div>
      <div>
        stage:
        {
        Object.values(CroupierScheduledStage)[matchStage]
      }
      </div>
      <div>
        hand stage:
        {
                Object.values(RoundStateEnum)[handStage]
        }
      </div>
      <div>
        showdown:
        {
                inShowdownStage ? 'in' : 'out'
            }
      </div>
      <div>
        players showdown:
        {
                playersShowdown.map((p) => (
                  <p>{JSON.stringify(p.getPlayer())}</p>
                ))
            }
      </div>
      <div>
        player acting:
        {
        JSON.stringify(playerActing?.getPlayer())
      }
      </div>
      <div>
        valid actions:
        {
                JSON.stringify(validActions)
            }
      </div>
      <div>
        players unscheduled:
        { playersUnscheduled.map((p) => (
          <p key={p.id}>
            { p.id }
            ,
            {p.name}
          </p>
        ))}
      </div>
      <div>
        players:
        {
              players.map((p) => <p key={p.getPlayer().id}>{(JSON.stringify(p.getPlayer()))}</p>)
          }
      </div>
    </div>
  );
};

ReactDOM.render(

  <ChipChipProvider channel={channel}>
    <App />
  </ChipChipProvider>,
  document.getElementById('root'),
);
