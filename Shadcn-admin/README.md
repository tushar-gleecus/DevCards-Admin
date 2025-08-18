# DevCards Admin Dashboard

📊 **DevCards Admin** is a full-stack admin dashboard built with **Next.js**, **Tailwind CSS**, **ShadCN UI**, and a Django backend.  
It provides content management capabilities (Decks, Categories, Cards, Card Content) with CRUD operations, rich text editing, and an intuitive UI/UX.

---

## 🚀 Tech Stack

- **Frontend**: Next.js (App Router), Tailwind CSS, ShadCN UI components  
- **Backend**: Django (REST API, authentication, session management)  
- **Database**: PostgreSQL (via Django ORM)  
- **Auth**: WorkOS (SSO for Admin), GitHub OAuth for Users  
- **Storage**: Supabase (for media files, offline sync)  
- **Editor**: TipTap (Rich Text Editor with full toolbar)  
- **Tables**: TanStack Table / AG Grid (sorting, filtering, pagination, export)  
- **Deployment**:  
  - Frontend: [Vercel](https://vercel.com/)  
  - Backend: Railway / Ngrok (for API tunneling during dev)  

---

## ✅ Current Features

- 🔑 **Admin Authentication** via WorkOS  
- 🛡️ **Role-based Access** (Super Admin vs Admin permissions)  
- 📂 **CRUD** for Decks, Categories, and Cards  
- 📝 **Card Content Management** with Rich Text Editor (TipTap)  
- 📊 **Tables** with:
  - Sorting, Filtering, Pagination
  - Column Toggling
  - CSV Export
  - Row-level actions (View/Edit/Delete)  
- 📈 **KPI Dashboard** cards for quick stats  
- 📷 **Media Uploads** with offline sync (Supabase + IndexedDB)  

---

## 🛠️ Remaining / Planned Features

These are **not yet implemented**, but should be resumed next:

1. **Utilities**
   - 🧪 Synthetic data generation (for testing/demo)  
   - 📑 Table extraction from `.sql` file  

2. **UI/UX Enhancements**
   - 📊 More **KPI cards** on dashboard  
   - 🔖 Bookmark & ❤️ Likes functionality for Card Content  

---

## 📂 Project Structure

```
DevCards-Admin/
 ├── src/
 │   ├── app/            # Next.js pages and layouts
 │   ├── components/     # ShadCN UI components
 │   ├── lib/            # API utilities (categoryApi, deckApi, auth, etc.)
 │   ├── _components/    # Feature-specific UI components
 │   └── styles/         # Tailwind configs and global styles
 ├── public/             # Static assets
 ├── package.json
 └── README.md
```

---

## ▶️ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/tushar-gleecus/DevCards-Admin.git
cd DevCards-Admin
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment variables
Create a `.env.local` file with:
```env
NEXT_PUBLIC_API_URL=<your-django-backend-url>
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
WORKOS_CLIENT_ID=<your-workos-client-id>
WORKOS_API_KEY=<your-workos-api-key>
```

### 4. Run the development server
```bash
npm run dev
```

Dashboard will be available at **http://localhost:3000**

---

## 📌 Notes

- Use Django backend for authentication, profile update, and media upload APIs.  
- Ngrok/Railway URLs need updating if backend is restarted.  
- Current deployment:  
  - Frontend → [Vercel](https://vercel.com/)  
  - Backend → Railway/Ngrok  

---

## 📅 Status

This project is **paused/parked** for now.  
Last worked on: **August 2025**.  
Pending features: *Synthetic Data, SQL Table Extraction, KPI Cards, Bookmarks, Likes*.

---

## 🔗 Links

- GitHub Repo: [DevCards-Admin](https://github.com/tushar-gleecus/DevCards-Admin)  
- Live Frontend: *(update when deployed)*  
- Backend API: *(update ngrok/railway link as needed)*  

---
