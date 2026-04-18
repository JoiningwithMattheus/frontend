import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { AuthService } from '../core/auth.service';
import { CreateTaskDto, Task } from './tasks.model';
import { TasksService } from './tasks.service';

@Component({
  selector: 'app-tasks',
  imports: [CommonModule, FormsModule],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css',
})
export class TaskComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly tasksService = inject(TasksService);

  tasks: Task[] = [];
  title = '';
  description = '';
  error = '';
  isLoading = false;

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.loadTasks();
    }
  }

  login(): void {
    this.auth.login();
  }

  logout(): void {
    this.auth.logout();
  }

  loadTasks(): void {
    if (!this.auth.isAuthenticated()) {
      this.error = 'Please sign in before loading tasks.';
      return;
    }

    this.error = '';
    this.isLoading = true;

    this.tasksService
      .getTasks()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (tasks) => {
          this.tasks = tasks;
        },
        error: (error: HttpErrorResponse) => {
          this.error = this.getRequestErrorMessage(error, 'load tasks');
        },
      });
  }

  addTask(): void {
    const trimmedTitle = this.title.trim();
    const trimmedDescription = this.description.trim();

    if (!trimmedTitle) {
      this.error = 'Please enter a task title.';
      return;
    }

    const dto: CreateTaskDto = {
      title: trimmedTitle,
      description: trimmedDescription || undefined,
    };

    this.error = '';
    this.isLoading = true;

    this.tasksService
      .createTask(dto)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (task) => {
          this.tasks = [task, ...this.tasks];
          this.title = '';
          this.description = '';
        },
        error: (error: HttpErrorResponse) => {
          this.error = this.getRequestErrorMessage(error, 'create task');
        },
      });
  }

  toggleTask(task: Task): void {
    this.tasksService
      .updateTask(task.id, { completed: !task.completed })
      .subscribe({
        next: (updatedTask) => {
          this.tasks = this.tasks.map((existingTask) =>
            existingTask.id === updatedTask.id ? updatedTask : existingTask,
          );
        },
        error: (error: HttpErrorResponse) => {
          this.error = this.getRequestErrorMessage(error, 'update task');
        },
      });
  }

  deleteTask(task: Task): void {
    this.tasksService.deleteTask(task.id).subscribe({
      next: () => {
        this.tasks = this.tasks.filter((existingTask) => existingTask.id !== task.id);
      },
      error: (error: HttpErrorResponse) => {
        this.error = this.getRequestErrorMessage(error, 'delete task');
      },
    });
  }

  private getRequestErrorMessage(error: HttpErrorResponse, action: string): string {
    if (error.status === 0) {
      return `Could not ${action}. Make sure the backend is running.`;
    }

    if (error.status === 401) {
      return `Could not ${action}. Please sign in again so Angular can send a valid Cognito token.`;
    }

    return `Could not ${action}. API returned HTTP ${error.status}.`;
  }
}
