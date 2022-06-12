import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {Filter, FilterExcludingWhere, repository} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  patch,
  post,
  requestBody,
  response,
} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {Box} from '../models';
import {BoxRepository, UserRepository} from '../repositories';

export class BoxController {
  constructor(
    @repository(BoxRepository)
    public boxRepository: BoxRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  @authenticate('jwt')
  @post('/boxes')
  @response(200, {
    description: 'Box model instance',
    content: {'application/json': {schema: getModelSchemaRef(Box)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Box, {
            title: 'NewBox',
            exclude: ['id'],
          }),
        },
      },
    })
    box: Omit<Box, 'id'>,
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<Box> {
    const userId = currentUserProfile[securityId];
    const user = await this.userRepository.findById(userId);
    if (user.login !== box.sender) {
      throw new HttpErrors.Forbidden('Access denied');
    }
    return await this.boxRepository.create({
      ...box,
      status: 'not deployed',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  @get('/boxes')
  @response(200, {
    description: 'Array of Box model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Box, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Box) filter?: Filter<Box>): Promise<Box[]> {
    return this.boxRepository.find({...filter, fields: {secret: false}});
  }

  @authenticate('jwt')
  @get('/boxes/{id}')
  @response(200, {
    description: 'Box model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Box, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.filter(Box, {exclude: 'where'}) filter?: FilterExcludingWhere<Box>,
  ): Promise<Box> {
    const userId = currentUserProfile[securityId];
    const user = await this.userRepository.findById(userId);
    const box = await this.boxRepository.findById(id);
    if (user.login !== box.sender && user.login !== box.reciever) {
      throw new HttpErrors.Forbidden('Access denied');
    }
    if (box.status === 'first deployed' || box.status === 'not deployed') {
      filter = {...filter, fields: {secret: false}};
    }
    return this.boxRepository.findById(id, filter);
  }

  @authenticate('jwt')
  @patch('/boxes/{id}')
  @response(204, {
    description: 'Box PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Box, {partial: true}),
        },
      },
    })
    box: Box,
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<void> {
    const userId = currentUserProfile[securityId];
    const user = await this.userRepository.findById(userId);
    const oldBox = await this.boxRepository.findById(id);
    if (user.login === oldBox.sender && user.login === box.reciever) {
      throw new HttpErrors.Conflict('Reciever and sender cannot be equal');
    }
    await this.boxRepository.updateById(id, box);
  }

  @authenticate('jwt')
  @del('/boxes/{id}')
  @response(204, {
    description: 'Box DELETE success',
  })
  async deleteById(
    @param.path.string('id') id: string,
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<void> {
    const userId = currentUserProfile[securityId];
    const user = await this.userRepository.findById(userId);
    const box = await this.boxRepository.findById(id);
    if (user.login !== box.sender) {
      throw new HttpErrors.Forbidden('Access denied');
    }
    if (box.status !== 'not deployed') {
      throw new HttpErrors.Conflict('You cannot delete box after deploy');
    }
    await this.boxRepository.deleteById(id);
  }
}
