export interface Socket {
  send(data: unknown): void
  json(data: unknown): void
  close(code?: number, reason?: string): void
  reconnect(): void
  open(): void
}
