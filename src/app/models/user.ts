export interface UserStatus {
  id: number;
  code?: string;
  name?: string;
  label?: string;
}

export interface User {
  id?: number;
  username: string;
  email: string;
  password?: string;
  createdAt?: string;
  updatedAt?: string;
  estadoId?: number;
  estado?: UserStatus;
  active?: boolean;
}
