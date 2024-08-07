const resolvers = {
  Query: {
    hello: () => 'Hello, World!',
  },
  Mutation: {
    createUser: (parent, args) => {
      const { data } = args;
      const userId = Math.floor(Math.random() * 1000) + 1;
      return {
        id: userId,
        name: data.name,
        email: data.email,
        birthDate: data.birthDate,
      };
    },
  },
};

export default resolvers;
