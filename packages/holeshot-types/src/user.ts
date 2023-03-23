import { GPS } from './index';

export type User = {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  gps?: GPS;
}
