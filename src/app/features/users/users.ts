import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { User, UsersService } from '../../core/users';

@Component({
  selector: 'app-users',
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class UsersComponent implements OnInit {
  private readonly usersService = inject(UsersService);

  users: User[] = [];
  name = '';
  isLoading = false;
  error = '';
  editingId: number | null = null;
  editingName = '';

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.error = '';
    this.isLoading = true;

    this.usersService
      .getUsers()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (users) => {
          this.users = users;
        },
        error: () => {
          this.error = 'Could not load users. Make sure the backend is running.';
        },
      });
  }

  addUser(): void {
    const trimmedName = this.name.trim();

    if (!trimmedName) {
      this.error = 'Please enter a name.';
      return;
    }

    this.error = '';
    this.isLoading = true;

    this.usersService
      .createUser(trimmedName)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (createdUser) => {
          this.users = [...this.users, createdUser];
          this.name = '';
        },
        error: () => {
          this.error = 'Could not create user. Check the API and database connection.';
        },
      });
  }

  startEdit(user: User): void {
    this.editingId = user.id;
    this.editingName = user.name;
    this.error = '';
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editingName = '';
  }

  saveEdit(user: User): void {
    const trimmedName = this.editingName.trim();

    if (!trimmedName) {
      this.error = 'Please enter a name.';
      return;
    }

    this.error = '';
    this.isLoading = true;

    this.usersService
      .updateUser(user.id, trimmedName)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (updatedUser) => {
          this.users = this.users.map((existingUser) =>
            existingUser.id === updatedUser.id ? updatedUser : existingUser,
          );
          this.cancelEdit();
        },
        error: () => {
          this.error = 'Could not update user. Check the API and database connection.';
        },
      });
  }

  deleteUser(user: User): void {
    this.error = '';
    this.isLoading = true;

    this.usersService
      .deleteUser(user.id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.users = this.users.filter((existingUser) => existingUser.id !== user.id);
        },
        error: () => {
          this.error = 'Could not delete user. Check the API and database connection.';
        },
      });
  }
}
