export interface Task {
  id: number;
  title: string;
  description?: string | null;
  completed: boolean;
  ownerSub: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  completed?: boolean;
}
