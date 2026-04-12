import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/users';

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  createUser(name: string): Observable<User> {
    return this.http.post<User>(this.apiUrl, { name });
  }

  getUser(id: number): Observable<User | null> {
    return this.http.get<User | null>(`${this.apiUrl}/${id}`);
  }

  updateUser(id: number, name: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}`, { name });
  }

  deleteUser(id: number): Observable<User> {
    return this.http.delete<User>(`${this.apiUrl}/${id}`);
  }
}
