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
    this.startListener('Claim');
  }

  async startListener(eventName: string): Promise<any> {
    console.log(`start listening on ${eventName}`);
    this.avalancheRegistry.on(eventName, async (...args: any) => {
      await this.listener(eventName, 'Avalanche', args);
    });
    this.ethereumRegistry.on(eventName, async (...args: any) => {
      await this.listener(eventName, 'Ethereum', args);
    });
  }

  async listener(eventName: string, networkName: string, args: any) {
    const event = args[args.length - 1];
    const eventProperties = event.args;
    const sender = eventProperties.sender;
    const offchainId = eventProperties.offchainBoxId;

    switch (eventName) {
      case 'BoxCreated':
        await this.boxCreated(
          offchainId,
          eventProperties.boxId.toString(),
          networkName,
        );
        break;
      case 'Claim':
        await this.claim(offchainId);
        break;
    }
  }

  async boxCreated(offchainId: string, boxId: string, networkName: string) {
    const box = await this.boxRepository.findById(offchainId.toString());
    let patch: Partial<Box> = {};
    if (box.sendNetwork == networkName)
      patch = {
        sendBlockchainId: +boxId,
      };
    else
      patch = {
        recieveBlockchainId: +boxId,
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

  async claim(offchainId: string) {
    const box = await this.boxRepository.findById(offchainId.toString());
    let patch: Partial<Box> = {};
    if (box.status === 'both deployed')
      patch = {
        status: 'first claimed',
      };
    else patch = {status: 'both claimed'};
    try {
      await this.boxRepository.updateById(box?.id, patch);
    } catch (error) {
      console.log(error);
    }
  }
}
