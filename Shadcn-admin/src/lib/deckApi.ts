import apiClient from "@/lib/api-client";

// TypeScript Deck interface matching your backend
export interface Deck {
  id: number;
  name: string;
  description: string;
  status: boolean;
  created_at: string;
  updated_at: string;
  created_by?: any;
  updated_by?: any;
}

// Get all decks
export const getDecks = async (): Promise<Deck[]> => {
  const res = await apiClient.get<Deck[]>("/api/decks/");
  return res.data;
};

// Create a new deck
export const createDeck = async (payload: { name: string; description: string }): Promise<Deck> => {
  const res = await apiClient.post<Deck>("/api/decks/", payload);
  return res.data;
};

// Update an existing deck
export const updateDeck = async (id: number, payload: { name: string; description: string }): Promise<Deck> => {
  const res = await apiClient.put<Deck>(`/api/decks/${id}/`, payload);
  return res.data;
};

// Delete a deck
export const deleteDeck = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/decks/${id}/`);
};
