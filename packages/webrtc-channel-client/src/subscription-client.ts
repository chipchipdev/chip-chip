import {
  ApolloClient, HttpLink, InMemoryCache, split,
} from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';

export const createSubscriptionClient = (uri: string, wsuri: string) => {
  const httpLink = new HttpLink({
    uri,
  });

  const wsLink = new WebSocketLink({
    uri: wsuri,
    options: {
      reconnect: true,
    },
  });

  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition'
                && definition.operation === 'subscription'
      );
    },
    wsLink,
    httpLink,
  );

  return new ApolloClient({
    uri,
    cache: new InMemoryCache(),
    link: splitLink,
  });
};
