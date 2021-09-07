import { Channel, Croupier } from '@chip-chip/core';
import React from 'react';

export const ChipChipContext = React.createContext<{
  channel: Channel<{ id: string; name: string }>,
  croupier:Croupier<{ id: string; name: string }>
}>({
  channel: undefined,
  croupier: undefined,
});

export function ChipChipProvider({ channel, children }: {
  channel: Channel<{ id: string; name: string }>,
  children: any
}) {
  const croupier = new Croupier({
    channel: channel.getChannel(),
  });

  return (
    <ChipChipContext.Provider value={{
      channel,
      croupier,
    }}
    >
      {children}
    </ChipChipContext.Provider>
  );
}
