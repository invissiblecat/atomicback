import {UserProfile} from '@loopback/security';

export type Credentials = {
  login: string;
  password: string;
  ethAddress: string;
  role?: string;
};

export type TokenObject = {
  accessToken: string;
  refreshToken?: string;
  accessExpiresIn?: number;
  refreshExpiresIn?: number;
};

export type RefreshGrant = {
  refreshToken: string;
};

export interface RefreshTokenService {
  /**
   * Generate a refresh token, bind it with the given user profile + access
   * token, then store them in backend.
   */
  generateToken(userProfile: UserProfile, token: string): Promise<TokenObject>;

  /**
   * Refresh the access token bound with the given refresh token.
   */
  refreshToken(refreshToken: string): Promise<TokenObject>;
}
