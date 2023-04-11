export interface Configuration {
  ClientId: string;
  PoolId: string;
  Host: string;
  Agent: string;
  Api: string;
  WebSocket: string,
}

export const config: Configuration = {
  ClientId: process.env.VITE_APP_CLIENT_ID as string,
  PoolId: process.env.VITE_APP_POOL_ID as string,
  Host: process.env.VITE_APP_HOST as string,
  Agent: process.env.VITE_APP_AGENT as string,
  Api: process.env.VITE_APP_API as string,
  WebSocket: process.env.VITE_APP_WEBSOCKET as string,
};
