import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {JsonDataSource} from '../datasources';
import {RefreshToken, RefreshTokenRelations} from '../models';

export class RefreshTokenRepository extends DefaultCrudRepository<
  RefreshToken,
  typeof RefreshToken.prototype.id,
  RefreshTokenRelations
> {
  constructor(
    @inject('datasources.json') dataSource: JsonDataSource,
  ) {
    super(RefreshToken, dataSource);
  }
}
