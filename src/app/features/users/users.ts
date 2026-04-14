import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { User, CreateUserDto, UpdateUserDto, UsersService } from '../../users';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-users',
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class UsersComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly usersService = inject(UsersService);

  users: User[] = [];

  name = '';
  email = '';
  role: 'ADMIN' | 'USER' = 'USER';

  isLoading = false;
  error = '';

  editingId: number | null = null;
  editingName = '';
  editingEmail = '';
  editingRole: 'ADMIN' | 'USER' = 'USER';

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.loadUsers();
    }
  }

  loadUsers(): void {
    if (!this.auth.isAuthenticated()) {
      this.error = 'Please sign in before loading users.';
      return;
    }

    this.error = '';
    this.isLoading = true;

    this.usersService
      .getUsers()
      .pipe(finalize(() => this.finishRequest()))
      .subscribe({
        next: (users: User[]) => {
          this.users = users;
          this.markViewChanged();
        },
        error: (error: HttpErrorResponse) => {
          this.error = this.getRequestErrorMessage(error, 'load users');
          this.markViewChanged();
        },
      });
  }

  addUser(): void {
    if (!this.auth.isAuthenticated()) {
      this.error = 'Please sign in before creating users.';
      return;
    }

    if (!this.canManageUsers()) {
      this.error = 'Your Keycloak account needs the admin role before creating users.';
      return;
    }

    const trimmedName = this.name.trim();
    const trimmedEmail = this.email.trim();

    if (!trimmedName || !trimmedEmail) {
      this.error = 'Please enter name and email.';
      return;
    }

    const dto: CreateUserDto = {
      name: trimmedName,
      email: trimmedEmail,
      role: this.role,
    };

    this.error = '';
    this.isLoading = true;

    this.usersService
      .createUser(dto)
      .pipe(finalize(() => this.finishRequest()))
      .subscribe({
        next: (createdUser: User) => {
          this.users = [...this.users, createdUser];
          this.name = '';
          this.email = '';
          this.role = 'USER';
          this.markViewChanged();
        },
        error: (error: HttpErrorResponse) => {
          this.error = this.getRequestErrorMessage(error, 'create user');
          this.markViewChanged();
        },
      });
  }

  startEdit(user: User): void {
    this.editingId = user.id;
    this.editingName = user.name;
    this.editingEmail = user.email ?? '';
    this.editingRole = user.role ?? 'USER';
    this.error = '';
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editingName = '';
    this.editingEmail = '';
    this.editingRole = 'USER';
  }

  saveEdit(user: User): void {
    if (!this.auth.isAuthenticated()) {
      this.error = 'Please sign in before updating users.';
      return;
    }

    if (!this.canManageUsers()) {
      this.error = 'Your Keycloak account needs the admin role before updating users.';
      return;
    }

    const trimmedName = this.editingName.trim();
    const trimmedEmail = this.editingEmail.trim();

    if (!trimmedName || !trimmedEmail) {
      this.error = 'Please enter name and email.';
      return;
    }

    const dto: UpdateUserDto = {
      name: trimmedName,
      email: trimmedEmail,
      role: this.editingRole,
    };

    this.error = '';
    this.isLoading = true;

    this.usersService
      .updateUser(user.id, dto)
      .pipe(finalize(() => this.finishRequest()))
      .subscribe({
        next: (updatedUser: User) => {
          this.users = this.users.map((existingUser) =>
            existingUser.id === updatedUser.id ? updatedUser : existingUser,
          );
          this.cancelEdit();
          this.markViewChanged();
        },
        error: (error: HttpErrorResponse) => {
          this.error = this.getRequestErrorMessage(error, 'update user');
          this.markViewChanged();
        },
      });
  }

  deleteUser(user: User): void {
    if (!this.auth.isAuthenticated()) {
      this.error = 'Please sign in before deleting users.';
      return;
    }

    if (!this.canManageUsers()) {
      this.error = 'Your Keycloak account needs the admin role before deleting users.';
      return;
    }

    this.error = '';
    this.isLoading = true;

    this.usersService
      .deleteUser(user.id)
      .pipe(finalize(() => this.finishRequest()))
      .subscribe({
        next: () => {
          this.users = this.users.filter((existingUser) => existingUser.id !== user.id);
          this.markViewChanged();
        },
        error: (error: HttpErrorResponse) => {
          this.error = this.getRequestErrorMessage(error, 'delete user');
          this.markViewChanged();
        },
      });
  }

  login(): void {
    this.auth.login();
  }

  logout(): void {
    this.auth.logout();
  }

  canManageUsers(): boolean {
    return this.auth.hasRole('admin');
  }

  private getRequestErrorMessage(error: HttpErrorResponse, action: string): string {
    if (error.status === 0) {
      return `Could not ${action}. Make sure the backend is running on http://localhost:3000.`;
    }

    if (error.status === 401) {
      return `Could not ${action}. Please sign in again so Angular can send a valid Keycloak token.`;
    }

    if (error.status === 403) {
      return `Could not ${action}. Your Keycloak account needs the admin role for this action.`;
    }

    return `Could not ${action}. API returned HTTP ${error.status}.`;
  }

  private finishRequest(): void {
    this.isLoading = false;
    this.markViewChanged();
  }

  private markViewChanged(): void {
    this.changeDetectorRef.markForCheck();
  }
}
