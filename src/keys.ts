import {TokenService, UserService} from '@loopback/authentication';
import {BindingKey} from '@loopback/context';
import {User} from './models';
import {PasswordHasher} from './services';
import {Credentials, RefreshTokenService} from './types';

export const USER_LOGIN_SIGNATURE_KEY =
  'Atomic Swap sign confirmation' as const;

export const defaultExclude = ['createdAt', 'updatedAt'] as const;

export namespace TokenServiceConstants {
  export const TOKEN_SECRET_VALUE = '90gaga12rinac6ce77ss';
  export const TOKEN_EXPIRES_IN_VALUE = '36000'; // 10 hours
}

export namespace TokenServiceBindings {
  export const TOKEN_SECRET = BindingKey.create<string>(
    'authentication.jwt.secret',
  );
  export const TOKEN_EXPIRES_IN = BindingKey.create<string>(
    'authentication.jwt.expires.in.seconds',
  );
  export const TOKEN_SERVICE = BindingKey.create<TokenService>(
    'services.authentication.jwt.tokenservice',
  );
}

export namespace PasswordHasherBindings {
  export const PASSWORD_HASHER =
    BindingKey.create<PasswordHasher>('services.hasher');
  export const ROUNDS = BindingKey.create<number>('services.hasher.round');
}
export namespace UserServiceBindings {
  export const USER_SERVICE = BindingKey.create<UserService<User, Credentials>>(
    'services.user.service',
  );
  export const USER_REPOSITORY = 'repositories.UserRepository';
  export const USER_CREDENTIALS_REPOSITORY =
    'repositories.UserCredentialsRepository';
}

export namespace RefreshTokenConstants {
  /**
   * The default secret used when generating refresh token.
   */
  export const REFRESH_SECRET_VALUE = 'g17ag21ar88inre7f9resh';
  /**
   * The default expiration time for refresh token.
   */
  export const REFRESH_EXPIRES_IN_VALUE = '216000'; // 60 hours
  /**
   * The default issuer used when generating refresh token.
   */
  export const REFRESH_ISSUER_VALUE = 'loopback4';
}
export namespace RefreshTokenServiceBindings {
  export const REFRESH_TOKEN_SERVICE = BindingKey.create<RefreshTokenService>(
    'services.authentication.jwt.refresh.tokenservice',
  );
  export const REFRESH_SECRET = BindingKey.create<string>(
    'authentication.jwt.refresh.secret',
  );
  export const REFRESH_EXPIRES_IN = BindingKey.create<string>(
    'authentication.jwt.refresh.expires.in.seconds',
  );
  export const REFRESH_ISSUER = BindingKey.create<string>(
    'authentication.jwt.refresh.issuer',
  );
  /**
   * Key for the repository that stores the refresh token and its bound user
   * information
   */
  export const REFRESH_REPOSITORY = 'repositories.RefreshTokenRepository';
}
