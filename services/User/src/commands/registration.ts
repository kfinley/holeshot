import { Command } from '@holeshot/commands/src';
import { Inject, injectable } from 'inversify-props';

export type RegistrationCommandRequest = {

}

export type RegistrationCommandResponse = {

}

@injectable()
export class RegistrationCommand implements Command<RegistrationCommandRequest, RegistrationCommandResponse> {
  runAsync(params: RegistrationCommandRequest): Promise<RegistrationCommandResponse> {

    throw new Error('Method not implemented.');
  }

}
