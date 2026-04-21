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
  shares?: EntryShare[];
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

export interface EntryShare {
  id: number;
  entryId: number;
  recipientUsername: string;
  createdAt: string;
}

export interface SharedEntry {
  id: number;
  entryId: number;
  recipientUsername: string;
  createdAt: string;
  entry: JournalEntry;
}

export interface ShareEntryDto {
  recipientUsername: string;
}
