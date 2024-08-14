import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import typeDefs from './graphql/type-defs.js';
import resolvers from './graphql/resolvers.js';
import { CustomError } from './errors/custom-error.js';

const formatError = (error) => {
  const { originalError } = error;
  if (originalError instanceof CustomError) {
    return {
      message: originalError.message,
      code: originalError.code,
      additionalInfo: originalError.additionalInfo,
      ...error,
    };
  }
  return error;
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError,
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
