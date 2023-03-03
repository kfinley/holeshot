import { Construct } from 'constructs';
import { createLambda } from '.';

export class BaseServiceConstruct extends Construct {

  protected nodeCodePath: string;
  protected node_env: string;

  constructor(scope: Construct, id: string, nodeCodepath: string, node_env: string) {
    super(scope, id);
    this.nodeCodePath = this.nodeCodePath;
    this.node_env = node_env;
  }

  protected newLambda(name: string, handler: string, env?: {
    [key: string]: string;
  } | undefined) {
    return createLambda(this, name, this.nodeCodePath, handler, this.node_env, env);
  }

}