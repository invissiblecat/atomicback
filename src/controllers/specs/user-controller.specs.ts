import {RequestBodyObject, ResponsesObject, SchemaObject} from '@loopback/rest';

const tokensProperties: SchemaObject['properties'] = {
  refreshToken: {type: 'string'},
  accessToken: {type: 'string'},
  accessExpiresIn: {type: 'number'},
  refreshExpiresIn: {type: 'number'},
};

const TokensResponseSchema: SchemaObject = {
  type: 'object',
  properties: tokensProperties,
};

export const TokensResponseBody: ResponsesObject = {
  '200': {
    description: 'Token',
    content: {
      'application/json': {
        schema: TokensResponseSchema,
      },
    },
  },
};

export const LoginSchema: SchemaObject = {
  type: 'object',
  required: ['login', 'password'],
  properties: {
    login: {type: 'string'},
    password: {
      type: 'string',
      minLength: 5,
    },
  },
};

export const LoginRequestBody: Partial<RequestBodyObject> = {
  description: 'The input of login function',
  required: true,
  content: {
    'application/json': {schema: LoginSchema},
  },
};

const RefreshRequestSchema: SchemaObject = {
  type: 'object',
  required: ['refreshToken'],
  properties: tokensProperties,
};

export const RefreshRequestBody: Partial<RequestBodyObject> = {
  description: 'Reissuing Acess Token',
  required: true,
  content: {
    'application/json': {schema: RefreshRequestSchema},
  },
};
