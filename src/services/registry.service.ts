import {/* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Contract, ethers} from 'ethers';
import Registry from '../abi/Registry.json';
import {Box} from '../models';
import {BoxRepository} from '../repositories';
require('dotenv').config();

@injectable({scope: BindingScope.SINGLETON})
export class RegistryService {
  avalanceProvider: any;
  ethereumProvider: any;
  avalancheRegistry: Contract;
  ethereumRegistry: Contract;

  constructor(@repository(BoxRepository) public boxRepository: BoxRepository) {
    this.avalanceProvider = new ethers.providers.JsonRpcProvider(
      process.env.AVALANCHE,
    );
    this.ethereumProvider = new ethers.providers.JsonRpcProvider(
      process.env.ETHEREUM,
    );
    this.avalancheRegistry = new ethers.Contract(
      process.env.AVALANCHE_REGISTRY as string,
      Registry.abi,
      this.avalanceProvider,
    );
    this.ethereumRegistry = new ethers.Contract(
      process.env.ETHEREUM_REGISTRY as string,
      Registry.abi,
      this.ethereumProvider,
    );

    this.startListener('BoxCreated');
  }

  async startListener(eventName: string): Promise<any> {
    console.log(`start listening on ${eventName}`);
    this.avalancheRegistry.on(eventName, async (...args: any) => {
      await this.listener(eventName, 'Avalanche', args);
    });
    console.log('Avalanche');
    this.ethereumRegistry.on(eventName, async (...args: any) => {
      await this.listener(eventName, 'Ethereum', args);
    });
    console.log('Ethereum');
  }

  async listener(eventName: string, networkName: string, args: any) {
    const event = args[args.length - 1];
    const eventProperties = event.args;
    console.log(eventProperties);
    const sender = eventProperties.sender;
    const offchainId = eventProperties.offchainBoxId;
    console.log(offchainId);
    if (eventName === 'BoxCreated') {
      console.log({eventName, networkName});
      const box = await this.boxRepository.findById(offchainId.toString());
      let patch: Partial<Box> = {};
      if (box.sendNetwork == networkName)
        patch = {
          sendBlockchainId: +eventProperties.boxId.toString(),
        };
      else
        patch = {
          recieveBlockchainId: +eventProperties.boxId.toString(),
        };
      if (box.status === 'not deployed')
        patch = {
          ...patch,
          status: 'first deployed',
        };
      else if (box.status === 'first deployed')
        patch = {...patch, status: 'both deployed'};
      try {
        await this.boxRepository.updateById(box?.id, patch);
      } catch (error) {
        console.log(error);
      }
    }
  }
}
