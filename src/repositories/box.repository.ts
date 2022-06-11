import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {JsonDataSource} from '../datasources';
import {Box, BoxRelations} from '../models';

export class BoxRepository extends DefaultCrudRepository<
  Box,
  typeof Box.prototype.id,
  BoxRelations
> {
  constructor(
    @inject('datasources.json') dataSource: JsonDataSource,
  ) {
    super(Box, dataSource);
  }
}
