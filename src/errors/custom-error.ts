import { GraphQLError } from 'graphql';

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

  static invalidCredentials() {
    return new GraphQLError('Invalid email or password', {
      extensions: {
        additionalInfo: 'Invalid credentials',
        code: 'BAD_USER_INPUT',
      },
    });
  }

  static authenticationRequired() {
    return new GraphQLError('No token provided', {
      extensions: {
        additionalInfo: 'Authentication required',
        code: 'BAD_USER_INPUT',
      },
    });
  }

  static authenticationFalied() {
    return new GraphQLError('Invalid token', {
      extensions: {
        additionalInfo: 'Authentication failed',
        code: 'BAD_USER_INPUT',
      },
    });
  }
}
