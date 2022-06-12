import {TokenService} from '@loopback/authentication';
import {
  BindingScope,
  generateUniqueId,
  inject,
  injectable,
} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {promisify} from 'util';
import {
  RefreshTokenServiceBindings,
  TokenServiceBindings,
  UserServiceBindings,
} from '../keys';
import {RefreshTokenWithRelations} from '../models';
import {RefreshTokenRepository, UserRepository} from '../repositories';
import {TokenObject} from '../types';
import {UserService} from './';
const jwt = require('jsonwebtoken');
const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify);

@injectable({scope: BindingScope.TRANSIENT})
export class RefreshtokenService {
  constructor(
    @inject(TokenServiceBindings.TOKEN_EXPIRES_IN) private jwtExpiresIn: string,
    @inject(RefreshTokenServiceBindings.REFRESH_SECRET)
    private refreshSecret: string,
    @inject(RefreshTokenServiceBindings.REFRESH_EXPIRES_IN)
    private refreshExpiresIn: string,
    @inject(RefreshTokenServiceBindings.REFRESH_ISSUER)
    private refreshIssuer: string,
    @repository(RefreshTokenRepository)
    public refreshTokenRepository: RefreshTokenRepository,
    @inject(UserServiceBindings.USER_SERVICE) public userService: UserService,
    @inject(TokenServiceBindings.TOKEN_SERVICE) public jwtService: TokenService,
    @repository(UserRepository) public userRepository: UserRepository,
  ) {}
  /**
   * Generate a refresh token, bind it with the given user profile + access
   * token, then store them in backend.
   */
  async generateToken(
    userProfile: UserProfile,
    token: string,
  ): Promise<TokenObject> {
    const data = {
      token: generateUniqueId(),
    };
    const refreshToken: string = await signAsync(data, this.refreshSecret, {
      expiresIn: Number(this.refreshExpiresIn),
      issuer: this.refreshIssuer,
    });

    const timestamp = Date.now();
    const jwtExpiresInMiliseconds = this.jwtExpiresIn + '000';
    const refreshExpiresInMiliseconds = this.refreshExpiresIn + '000';
    const accessExpiresIn = +jwtExpiresInMiliseconds + timestamp;
    const refreshExpiresIn = +refreshExpiresInMiliseconds + timestamp;

    const tokens: TokenObject = {
      accessToken: token,
      refreshToken,
      accessExpiresIn,
      refreshExpiresIn,
    };

    await this.refreshTokenRepository.create({
      userId: userProfile[securityId],
      refreshToken: tokens.refreshToken,
    });

    return tokens;
  }

  /*
   * Refresh the access token bound with the given refresh token.
   */
  async refreshToken(refreshToken: string): Promise<TokenObject> {
    try {
      if (!refreshToken) {
        throw new HttpErrors.Unauthorized(
          `Error verifying token : 'refresh token' is null`,
        );
      }

      const {userId} = await this.verifyToken(refreshToken);
      const user = await this.userRepository.findById(userId);

      if (!user) {
        throw new HttpErrors.Unauthorized('invalid User');
      }

      const userProfile = this.userService.convertToUserProfile(user);
      // create a JSON Web Token based on the user profile
      const token: string = await this.jwtService.generateToken(userProfile);
      const tokens: TokenObject = await this.generateToken(userProfile, token);

      await this.removeToken(refreshToken);

      return tokens;
    } catch (error: any) {
      throw new HttpErrors.Unauthorized(`${error.message}`);
    }
  }

  async removeToken(refreshToken: string) {
    try {
      const currentRefreshToken: RefreshTokenWithRelations | null =
        await this.refreshTokenRepository.findOne({
          where: {refreshToken: refreshToken},
        });

      await this.refreshTokenRepository.deleteById(currentRefreshToken?.id);
    } catch (e) {
      console.error('removeToken', e);
    }
  }

  /**
   * Verify the validity of a refresh token, and make sure it exists in backend.
   * @param refreshToken
   */
  async verifyToken(refreshToken: string): Promise<RefreshTokenWithRelations> {
    try {
      await verifyAsync(refreshToken, this.refreshSecret);
      const userRefreshData: RefreshTokenWithRelations | null =
        await this.refreshTokenRepository.findOne({
          where: {refreshToken: refreshToken},
        });

      if (!userRefreshData) {
        throw new HttpErrors.Unauthorized(
          `Error verifying token : Invalid Token`,
        );
      }
      return userRefreshData;
    } catch (error: any) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token : ${error.message}`,
      );
    }
  }
}
