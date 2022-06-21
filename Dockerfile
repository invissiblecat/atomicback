# Check out https://hub.docker.com/_/node to select a new base image
FROM node:16-slim

# Set to a non-root built-in user `node`
USER node

# Create app directory (with user `node`)
RUN mkdir -p /home/node/app

WORKDIR /home/node/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY --chown=node package*.json ./

RUN npm ci

# Bundle app source code
COPY --chown=node . .

RUN npm run build

# Bind to all network interfaces so that it can be mapped to the host OS
ENV HOST=0.0.0.0 PORT=3000 ETHEREUM_REGISTRY=0xE9d959bB03cFdb72B7e25B6a2Cf0c2dC380F9a2E AVALANCHE_REGISTRY=0x91E5AC4a7F0Da2a2c69996BC1616cebD8c7f272E AVALANCHE=https://api.avax-test.network/ext/bc/C/rpc ETHEREUM=https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161

EXPOSE ${PORT}
CMD [ "node", "." ]
