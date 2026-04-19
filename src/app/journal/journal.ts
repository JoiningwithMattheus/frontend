import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { AuthService } from '../core/auth.service';
import { EntryMood, JournalEntry } from './journal.model';
import { JournalService } from './journal.service';

@Component({
  selector: 'app-journal',
  imports: [CommonModule, FormsModule],
  templateUrl: './journal.html',
  styleUrl: './journal.css',
})
export class JournalComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly journalService = inject(JournalService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  readonly moods: { value: EntryMood; label: string }[] = [
    { value: 'HOPEFUL', label: 'Hopeful' },
    { value: 'GRATEFUL', label: 'Grateful' },
    { value: 'HAPPY', label: 'Happy' },
    { value: 'SAD', label: 'Sad' },
    { value: 'ANXIOUS', label: 'Anxious' },
    { value: 'ANGRY', label: 'Angry' },
    { value: 'NUMB', label: 'Numb' },
    { value: 'OVERWHELMED', label: 'Overwhelmed' },
  ];

  entries: JournalEntry[] = [];
  title = '';
  content = '';
  mood: EntryMood | '' = '';
  error = '';
  isLoading = false;

  editingId: number | null = null;
  editingTitle = '';
  editingContent = '';
  editingMood: EntryMood | '' = '';

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.loadEntries();
    }
  }

  login(): void {
    this.auth.login();
  }

  logout(): void {
    this.auth.logout();
  }

  loadEntries(): void {
    if (!this.auth.isAuthenticated()) {
      this.error = 'Please sign in before opening your journal.';
      return;
    }

    this.error = '';
    this.isLoading = true;

    this.journalService
      .getEntries()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.markViewChanged();
        }),
      )
      .subscribe({
        next: (entries) => {
          this.entries = entries;
          this.markViewChanged();
        },
        error: (error: HttpErrorResponse) => {
          this.error = this.getRequestErrorMessage(error, 'load entries');
          this.markViewChanged();
        },
      });
  }

  createEntry(): void {
    const trimmedContent = this.content.trim();

    if (!trimmedContent) {
      this.error = 'Write at least a few words before saving.';
      return;
    }

    this.error = '';
    this.isLoading = true;

    this.journalService
      .createEntry({
        title: this.title.trim() || undefined,
        content: trimmedContent,
        mood: this.mood || undefined,
      })
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.markViewChanged();
        }),
      )
      .subscribe({
        next: (entry) => {
          this.entries = [entry, ...this.entries];
          this.title = '';
          this.content = '';
          this.mood = '';
          this.markViewChanged();
        },
        error: (error: HttpErrorResponse) => {
          this.error = this.getRequestErrorMessage(error, 'save entry');
          this.markViewChanged();
        },
      });
  }

  startEdit(entry: JournalEntry): void {
    this.editingId = entry.id;
    this.editingTitle = entry.title ?? '';
    this.editingContent = entry.content;
    this.editingMood = entry.mood ?? '';
    this.error = '';
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editingTitle = '';
    this.editingContent = '';
    this.editingMood = '';
  }

  saveEdit(entry: JournalEntry): void {
    const trimmedContent = this.editingContent.trim();

    if (!trimmedContent) {
      this.error = 'An entry cannot be empty.';
      return;
    }

    this.journalService
      .updateEntry(entry.id, {
        title: this.editingTitle.trim() || undefined,
        content: trimmedContent,
        mood: this.editingMood || undefined,
      })
      .subscribe({
        next: (updatedEntry) => {
          this.entries = this.entries.map((existingEntry) =>
            existingEntry.id === updatedEntry.id ? updatedEntry : existingEntry,
          );
          this.cancelEdit();
          this.markViewChanged();
        },
        error: (error: HttpErrorResponse) => {
          this.error = this.getRequestErrorMessage(error, 'update entry');
        },
      });
  }

  deleteEntry(entry: JournalEntry): void {
    this.journalService.deleteEntry(entry.id).subscribe({
      next: () => {
        this.entries = this.entries.filter((existingEntry) => existingEntry.id !== entry.id);
      },
      error: (error: HttpErrorResponse) => {
        this.error = this.getRequestErrorMessage(error, 'delete entry');
        this.markViewChanged();
      },
    });
  }

  moodLabel(mood: EntryMood | null | undefined): string {
    return this.moods.find((option) => option.value === mood)?.label ?? 'Unlabeled';
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

  private markViewChanged(): void {
    this.changeDetectorRef.detectChanges();
  }
}
