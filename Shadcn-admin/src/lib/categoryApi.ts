import apiClient from "@/lib/api-client";

// Types based on your backend
export interface Category {
  id: number;
  name: string;
  description: string;
  status: boolean;
  created_at: string;
  updated_at: string;
  deck: number; // deck id (foreign key)
  deck_name: string; // deck name for display
  created_by?: any;
  updated_by?: any;
}

export interface Deck {
  id: number;
  name: string;
}

// Get all categories
export const getCategories = async (): Promise<Category[]> => {
  const res = await apiClient.get<Category[]>("/api/categories/");
  return res.data;
};

// Create a new category
export const createCategory = async (payload: {
  name: string;
  description: string;
  deck: number;
}): Promise<Category> => {
  const res = await apiClient.post<Category>("/api/categories/", payload);
  return res.data;
};

// Update category
export const updateCategory = async (
  id: number,
  payload: { name: string; description: string; deck: number },
): Promise<Category> => {
  const res = await apiClient.put<Category>(`/api/categories/${id}/`, payload);
  return res.data;
};

// Delete category
export const deleteCategory = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/categories/${id}/`);
};
