import React from 'react';
import { Croupier, Channel } from '@chip-chip/core/lib';
import ReactDOM from 'react-dom';

const App = () => {
  const channel = new Channel();

  const croupier = new Croupier({
    id: '1',
    channel: channel.getChannel(),
    player: {
      id: '2',
      name: 'kuku',
    },
    chips: 1000,
  });

  return (
    <div>
      {
                JSON.stringify(croupier.getCroupier())
            }
    </div>
  );
};

ReactDOM.render(
  <App />,
  document.getElementById('root'),
);
