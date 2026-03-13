import type { UserEntry } from '@/types';

export async function insertUser(data: Omit<UserEntry, 'id' | 'created_at'>): Promise<UserEntry> {
  const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Failed to save user');
  }

  return res.json();
}

export async function fetchAllUsers(): Promise<UserEntry[]> {
  const res = await fetch('/api/users');

  if (!res.ok) {
    throw new Error('Failed to fetch users');
  }

  return res.json();
}
