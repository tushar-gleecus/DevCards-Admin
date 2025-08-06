import { Category as APICategory, Deck as APIDeck } from "@/lib/categoryApi";

export type UIDeck = APIDeck;

export type UICategory = Omit<APICategory, 'id'> & {
  id: string;
  deckId: string;
  deck_name: string;
  deck: number;
};