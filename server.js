const express = require('express')
const { ApolloServer, gql} = require('apollo-server-express')
const http = require("http");


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

let server = null;
async function startServer (){    
    server = new ApolloServer({ typeDefs:schema, resolvers });
    await server.start();
    server.applyMiddleware({ app });
}

startServer();

app.listen({ port: 4000}, () => console.log(`Servidor rodando na porta localhost:4000${server.graphqlPath}`));

