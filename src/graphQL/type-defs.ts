const typeDefs = `#graphql

input UserInput {
  name: String!
  email: String!
  password: String!
  birthDate: String!
  addresses: [AddressInput!]
}

input LoginInput {
  email: String!
  password: String!
  rememberMe: Boolean
}

input AddressInput {
  cep: String!
  street: String!
  streetNumber: String!
  complement: String
  neighborhood: String!
  city: String!
  state: String!
}

type Address {
  id: ID!
  cep: String!
  street: String!
  streetNumber: String!
  complement: String
  neighborhood: String!
  city: String!
  state: String!
  user: User!
}

type User {
  id: ID!
  name: String!
  email: String!
  birthDate: String!
  addresses: [Address!]
}

type LoginResponse {
  user: User!
  token: String!
}

type UsersResponse {
  users: [User!]
  totalUsers: Int!
  hasMore: Boolean!
  hasPrevious: Boolean!
}

type Query {
  user(id: Int!): User!
  users(skip: Int, take: Int): UsersResponse!
}

type Mutation {
  createUser(data: UserInput!): User!
  login(data: LoginInput!): LoginResponse!
  addAddress(userId: ID!, address: AddressInput!): User!
}
`;

export default typeDefs;
