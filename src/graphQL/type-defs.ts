const typeDefs = `#graphql

input UserInput {
  name: String!
  email: String!
  password: String!
  birthDate: String!
}

input LoginInput {
  email: String!
  password: String!
  rememberMe: Boolean
}

type User {
  id: ID!
  name: String!
  email: String!
  birthDate: String!
}

type LoginResponse {
  user: User!
  token: String!
}

type UsersResponse {
  users: [User]
  totalUsers: Int
  hasMore: Boolean
  hasPrevious: Boolean
}

type Query {
  hello: String!
  user(id: Int!): User
  users(skip: Int, take: Int): UsersResponse
}

type Mutation {
  createUser(data: UserInput!): User!
  login(data: LoginInput!): LoginResponse!
}
`;

export default typeDefs;
