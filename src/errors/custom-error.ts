import { GraphQLError } from "graphql";

export class CustomError {

  static unsecurityPassword() {
    return new GraphQLError('Password does not meet security requirements', {
      extensions: {
        additionalInfo: 'Password must be at least 6 characters long and contain at least 1 letter and 1 digit',
        code: 'BAD_USER_INPUT',
      },
    });
  }

  static emailInUse() {
    return new GraphQLError('Email is already in use', {
      extensions: {
        additionalInfo: 'Use a different email',
        code: 'BAD_USER_INPUT',
      },
    });
  }
}