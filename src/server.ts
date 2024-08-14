import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import typeDefs from './graphql/typeDefs.js';
import resolvers from './graphql/resolvers.js';

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

export const startServer = async (port: number) => {
  const { url } = await startStandaloneServer(server, {
    listen: { port },
  });
  console.log(`Servidor rodando na porta ${url}`);
  return { server, url };
};

export const stopServer = async (server: ApolloServer) => {
  await server.stop();
};
