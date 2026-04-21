import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environment/environment';
import {
  CreateEntryDto,
  JournalEntry,
  ShareEntryDto,
  SharedEntry,
  UpdateEntryDto,
} from './journal.model';

@Injectable({ providedIn: 'root' })
export class JournalService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/entries`;

  getEntries(): Observable<JournalEntry[]> {
    return this.http.get<JournalEntry[]>(this.apiUrl);
  }

  createEntry(dto: CreateEntryDto): Observable<JournalEntry> {
    return this.http.post<JournalEntry>(this.apiUrl, dto);
  }

  updateEntry(id: number, dto: UpdateEntryDto): Observable<JournalEntry> {
    return this.http.patch<JournalEntry>(`${this.apiUrl}/${id}`, dto);
  }

  deleteEntry(id: number): Observable<JournalEntry> {
    return this.http.delete<JournalEntry>(`${this.apiUrl}/${id}`);
  }

  shareEntry(id: number, dto: ShareEntryDto) {
    return this.http.post(`${this.apiUrl}/${id}/shares`, dto);
  }

  getSharedWithMe(): Observable<SharedEntry[]> {
    return this.http.get<SharedEntry[]>(`${this.apiUrl}/shared-with-me`);
  }

  unshareEntry(entryId: number, shareId: number) {
    return this.http.delete(`${this.apiUrl}/${entryId}/shares/${shareId}`);
  }
}
