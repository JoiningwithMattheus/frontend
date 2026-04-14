export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: 'ADMIN' | 'USER';
}