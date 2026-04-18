export type EntryMood =
  | 'HAPPY'
  | 'SAD'
  | 'ANXIOUS'
  | 'ANGRY'
  | 'NUMB'
  | 'HOPEFUL'
  | 'OVERWHELMED'
  | 'GRATEFUL';

export interface JournalEntry {
  id: number;
  ownerSub: string;
  title?: string | null;
  content: string;
  mood?: EntryMood | null;
  visibility: 'PRIVATE' | 'SHARED' | 'COMMUNITY';
  createdAt: string;
  updatedAt: string;
}

export interface CreateEntryDto {
  title?: string;
  content: string;
  mood?: EntryMood;
}

export interface UpdateEntryDto {
  title?: string;
  content?: string;
  mood?: EntryMood;
}
