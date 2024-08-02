const express = require('express')
const { ApolloServer, gql} = require('apollo-server-express')

const app = express();

const schema = gql(`
  type Query {
    hello: String!
  }
`);

const resolvers = {
    Query: {
        hello: () => 'Hello, World!'
    }
};

let server = new ApolloServer({ typeDefs:schema, resolvers });
async function startServer (){    
    await server.start();
    server.applyMiddleware({ app });
}

startServer();

app.listen({ port: 4000}, () => console.log(`Servidor rodando na porta localhost:4000${server.graphqlPath}`));