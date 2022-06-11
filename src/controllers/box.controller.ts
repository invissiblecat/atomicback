import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {Box} from '../models';
import {BoxRepository} from '../repositories';

export class BoxController {
  constructor(
    @repository(BoxRepository)
    public boxRepository: BoxRepository,
  ) {}

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
  ): Promise<Box> {
    return await this.boxRepository.create({
      ...box,
      status: 'not deployed',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  @get('/boxes/count')
  @response(200, {
    description: 'Box model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Box) where?: Where<Box>): Promise<Count> {
    return this.boxRepository.count(where);
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
    return this.boxRepository.find(filter);
  }

  @patch('/boxes')
  @response(200, {
    description: 'Box PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Box, {partial: true}),
        },
      },
    })
    box: Box,
    @param.where(Box) where?: Where<Box>,
  ): Promise<Count> {
    return this.boxRepository.updateAll(box, where);
  }

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
    @param.filter(Box, {exclude: 'where'}) filter?: FilterExcludingWhere<Box>,
  ): Promise<Box> {
    return this.boxRepository.findById(id, filter);
  }

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
  ): Promise<void> {
    await this.boxRepository.updateById(id, box);
  }

  @put('/boxes/{id}')
  @response(204, {
    description: 'Box PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() box: Box,
  ): Promise<void> {
    await this.boxRepository.replaceById(id, box);
  }

  @del('/boxes/{id}')
  @response(204, {
    description: 'Box DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.boxRepository.deleteById(id);
  }
}
