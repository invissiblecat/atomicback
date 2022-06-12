import {Entity, model, property} from '@loopback/repository';

@model()
export class Box extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
  })
  status: string;

  @property({
    type: 'number',
  })
  sendBlockchainId: number;

  @property({
    type: 'number',
  })
  recieveBlockchainId: number;

  @property({
    type: 'string',
    required: true,
  })
  sender: string;

  @property({
    type: 'string',
  })
  reciever?: string;

  @property({
    type: 'string',
    required: true,
  })
  sendNetwork: string;

  @property({
    type: 'string',
    required: true,
  })
  recieveNetwork: string;

  @property({
    type: 'string',
    required: true,
  })
  sendToken: string;

  @property({
    type: 'string',
    required: true,
  })
  recieveToken: string;

  @property({
    type: 'string',
    required: true,
  })
  sendAmount: string;

  @property({
    type: 'string',
    required: true,
  })
  recieveAmount: string;

  @property({
    type: 'string',
  })
  secret?: string;

  @property({
    type: 'string',
  })
  hashSecret?: string;

  @property({
    type: 'number',
  })
  unlockTimestamp?: number;

  @property({
    type: 'number',
  })
  createdAt?: number;

  @property({
    type: 'number',
  })
  updatedAt?: number;

  constructor(data?: Partial<Box>) {
    super(data);
  }
}

export interface BoxRelations {
  // describe navigational properties here
}

export type BoxWithRelations = Box & BoxRelations;
