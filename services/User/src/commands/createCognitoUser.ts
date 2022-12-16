import { Command } from '@holeshot/commands/src';
import { Inject, injectable } from 'inversify-props';

export type CreateCognitoUserCommandRequest = {

}

export type CreateCognitoUserCommandResponse = {

}

@injectable()
export class CreateCognitoUserCommand implements Command<CreateCognitoUserCommandRequest, CreateCognitoUserCommandResponse> {
    runAsync(params: CreateCognitoUserCommandRequest): Promise<CreateCognitoUserCommandResponse> {

        throw new Error('Method not implemented.');
    }

}

