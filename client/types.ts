
export type UserType = 'admin' | 'dispatcher' | 'container';

export interface User {
  _id: string;
  username: string;
  email: string;
  userType: UserType;
  userMainId?: string;
}

export interface JobStatus {
  type: string;
  timestamp: string;
  _id?: string;
}

export interface Job {
  _id: string;
  jobStart: string;
  pin: string;
  slot: string;
  commodityCode: string;
  size: string;
  dg: string;
  uplift: string;
  offload: string;
  doors: string;
  random: string;
  release?: string;
  containerNumber?: string;
  weight: string;
  instructions: string;
  userMainId?: string;
  status: JobStatus[];
  daysDifference?: number;
}

export interface AddressOption {
  _id: string;
  name: string;
  address: string;
  email: string;
}
