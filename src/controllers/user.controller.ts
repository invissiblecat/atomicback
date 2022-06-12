import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors, post, requestBody} from '@loopback/rest';
import {ethers} from 'ethers';
import {
  RefreshTokenServiceBindings,
  TokenServiceBindings,
  UserServiceBindings,
  USER_LOGIN_SIGNATURE_KEY,
} from '../keys';
import {UserRepository} from '../repositories';
import {JWTService, RefreshtokenService, UserService} from '../services';
import {TokenObject} from '../types';
import {
  LoginRequestBody,
  TokensResponseBody,
} from './specs/user-controller.specs';

export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject(RefreshTokenServiceBindings.REFRESH_TOKEN_SERVICE)
    public refreshService: RefreshtokenService,
    @inject(UserServiceBindings.USER_SERVICE) public userService: UserService,
    @inject(TokenServiceBindings.TOKEN_SERVICE) public jwtService: JWTService,
  ) {}

  @post('/users/login', {
    responses: TokensResponseBody,
  })
  async login(
    @requestBody(LoginRequestBody) {signature}: {signature: string},
  ): Promise<TokenObject> {
    try {
      const ethAddress = ethers.utils.verifyMessage(
        USER_LOGIN_SIGNATURE_KEY,
        signature,
      );
      let foundUser = await this.userRepository.findOne({
        where: {login: ethAddress},
      });

      if (!foundUser) {
        foundUser = await this.userRepository.create({
          login: ethAddress,
        });
      }

      const userProfile = this.userService.convertToUserProfile(foundUser);
      const accessToken = await this.jwtService.generateToken(userProfile);
      return await this.refreshService.generateToken(userProfile, accessToken);
    } catch (err) {
      console.error(err);
      throw new HttpErrors.Unauthorized('Invalid signature');
    }
  }
}
