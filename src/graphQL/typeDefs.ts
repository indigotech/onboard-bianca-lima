const typeDefs = `#graphql
type Query {
    hello: String!
}

input UserInput {
  name: String!
  email: String!
  password: String!
  birthDate: String!
}

type User {
  id: ID!
  name: String!
  email: String!
  birthDate: String!
}

type Login {
  user: User!
  token: String!
}

type Mutation {
  createUser(data: UserInput!): User!
  login(email: String!, password: String!): Login!
}
`;

export default typeDefs;
