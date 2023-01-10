/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { Configuration } from '@holeshot/web-core/src'

import { config } from '@holeshot/web-core/src';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const jsConfig = (window as any).HoleshotConfig as Configuration

console.log(jsConfig);

config.ClientId = jsConfig.ClientId ?? import.meta.env.VITE_APP_CLIENT_ID!
config.PoolId = jsConfig.PoolId ?? import.meta.env.VITE_APP_POOL_ID!
config.Api = jsConfig.Api ?? import.meta.env.VITE_APP_API!
config.ApiPorts = jsConfig.ApiPorts ?? import.meta.env.VITE_APP_API_PORTS!
config.ServiceWorkerPath = import.meta.env.VITE_APP_SERVICE_WORKER_PATH!
config.Host = import.meta.env.VITE_APP_HOST!
config.Agent = import.meta.env.VITE_APP_AGENT!
config.WebSocket = import.meta.env.VITE_APP_WEBSOCKET!
config.WebSocketPort = import.meta.env.VITE_APP_WEBSOCKET_PORT!

console.log(config)
