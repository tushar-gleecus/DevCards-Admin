import axios from "axios";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function createCardContent({
  name,
  shortDesc,
  richText,
  categoryId,
  deckId,
  status,
}: {
  name: string;
  shortDesc: string;
  richText: string;
  categoryId: number;
  deckId: number;
  status: "published" | "draft";
}) {
  const payload = {
    name,
    short_description: shortDesc,
    description: richText,
    category_id: categoryId,
    deck_id: deckId,
    status,
    read_time: 3,
    tags: "",
  };

  const token = localStorage.getItem("access_token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Token ${token}`;
  }

  const res = await fetch(`${BASE}/api/cards/`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    try {
      // Try to parse it as JSON
      const error = JSON.parse(errorText);
      throw new Error(error.detail || "Failed to create card content");
    } catch (e) {
      // If parsing fails, it's not JSON, so throw the raw text
      throw new Error(`Failed to create card content. Server responded with: ${errorText}`);
    }
  }

  return await res.json();
}

export async function getPublicCard(id: string) {
  const token = localStorage.getItem("access_token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Token ${token}`;
  }

  const res = await fetch(`${BASE}/api/cards/${id}/`, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    throw new Error("Failed to fetch public card");
  }

  return await res.json();
}

export async function updateCardContent(id: string, data: any) {
  const token = localStorage.getItem("access_token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Token ${token}`;
  }

  const res = await fetch(`${BASE}/api/cards/update/${id}/`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorText = await res.text();
    try {
      const error = JSON.parse(errorText);
      throw new Error(error.detail || "Failed to update card content");
    } catch (e) {
      throw new Error(`Failed to update card content. Server responded with: ${errorText}`);
    }
  }

  return await res.json();
}

export async function getPublicCards() {
  const token = localStorage.getItem("access_token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Token ${token}`;
  }

  const res = await fetch(`${BASE}/api/cards/public/`, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    throw new Error("Failed to fetch public cards");
  }

  return await res.json();
}

/**
 * Updates the status of a card content
 * @param id The ID of the card content to update
 * @param newStatus The new status to set ('draft', 'published', or 'inactive')
 * @returns The updated card content
 */
export async function updateCardStatus(id: string, newStatus: "draft" | "published" | "inactive") {
  const token = localStorage.getItem("access_token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Token ${token}`;
  }

  // First get the current card data
  const card = await getPublicCard(id);

  // Update only the status field
  const updateData = {
    name: card.name,
    short_description: card.short_description,
    description: card.description,
    category_id: card.category_id,
    deck_id: card.deck_id || 2,
    status: newStatus,
    tags: card.tags || "",
    read_time: card.read_time || 3,
  };

  const res = await fetch(`${BASE}/api/cards/update/${id}/`, {
    method: "PUT",
    headers,
    body: JSON.stringify(updateData),
  });

  if (!res.ok) {
    const errorText = await res.text();
    try {
      const error = JSON.parse(errorText);
      throw new Error(error.detail || `Failed to update card status to ${newStatus}`);
    } catch (e) {
      throw new Error(`Failed to update card status. Server responded with: ${errorText}`);
    }
  }

  return await res.json();
}

export async function deleteCardContent(id: string) {
  const token = localStorage.getItem("access_token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Token ${token}`;
  }

  const res = await fetch(`${BASE}/api/cards/delete/${id}/`, {
    method: "DELETE",
    headers,
  });

  if (!res.ok) {
    const errorText = await res.text();
    try {
      const error = JSON.parse(errorText);
      throw new Error(error.detail || "Failed to delete card content");
    } catch (e) {
      throw new Error(`Failed to delete card content. Server responded with: ${errorText}`);
    }
  }

  return true;
}
