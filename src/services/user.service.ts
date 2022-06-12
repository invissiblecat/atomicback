import {UserService as LoopbackUserService} from '@loopback/authentication';
import {inject} from '@loopback/context';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {PasswordHasherBindings} from '../keys';
import {User} from '../models';
import {UserRepository} from '../repositories';
import {Credentials} from '../types';
import {PasswordHasher} from './password-hasher.service';

export class UserService implements LoopbackUserService<User, Credentials> {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
  ) {}

  async verifyCredentials(credentials: Credentials): Promise<User> {
    const invalidCredentialsError = 'Invalid login or password.';

    const foundUser = await this.userRepository.findOne({
      where: {login: credentials.login},
    });
    if (!foundUser) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    const credentialsFound = await this.userRepository.findCredentials(
      foundUser.id,
    );
    if (!credentialsFound) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    const passwordMatched = await this.passwordHasher.comparePassword(
      credentials.password,
      credentialsFound.password,
    );

    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    return foundUser;
  }

  convertToUserProfile(user: User): UserProfile {
    // since first name and lastName are optional, no error is thrown if not provided
    return {
      [securityId]: user.id!,
      id: user.id,
    };
  }

  validateCredentials(credentials: Pick<Credentials, 'password'>) {
    // Validate Password Length
    if (!credentials.password || credentials.password.length < 5) {
      throw new HttpErrors.UnprocessableEntity(
        'password must be minimum 5 characters',
      );
    }
  }

  async checkAccess(userProfile: UserProfile, id: string) {
    const profileId = userProfile[securityId];
    const user = await this.userRepository.findById(profileId);
    if (profileId !== id) {
      throw new HttpErrors.Forbidden('Access denied');
    }
  }
}
