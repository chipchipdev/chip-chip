import React, {useState} from 'react';
import {useChipChip} from "@chip-chip/react-library";
import {CroupierScheduledStage, RoundStateEnum} from "@chip-chip/core/lib";

function App() {

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


export default App;
