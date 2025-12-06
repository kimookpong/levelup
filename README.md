# LevelUp - Game Top-up Platform

LevelUp is a modern, premium game top-up platform designed to provide a seamless and secure experience for gamers. Built with performance and aesthetics in mind, it features a sleek "LnwTrue" inspired design, real-time data fetching, and a comprehensive admin dashboard.

## 📋 Plan & Roadmap

The goal of LevelUp is to become a leading hub for game top-ups. The development plan focuses on:

- **Phase 1: Core Foundation (Completed)**
    - Project setup with Next.js and Tailwind CSS.
    - Responsive UI/UX design implementation.
    - Authentication system (Login/Register).
    - Database integration (Supabase).

- **Phase 2: User Features (Current)**
    - Game browsing and details.
    - Top-up flow with payment integration (Omise).
    - User profile management.
    - Transaction history.

- **Phase 3: Admin & Operations (In Progress)**
    - Admin dashboard for managing games and packages.
    - Transaction monitoring.
    - Promotion management.
    - Customer support chat widget.

## 🛠 Implementation Details

### Tech Stack
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router with Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with custom design tokens
- **Database & Auth**: [Supabase](https://supabase.com/) with `@supabase/ssr` v0.8.0
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/)
- **Payment**: [Omise](https://www.omise.co/) (Integration in progress)

### Directory Structure
```
src/
├── app/                    # App Router pages and layouts
│   ├── (auth)/            # Authentication routes
│   │   └── login/         # Login page (OAuth: Google, Facebook)
│   ├── admin/             # Admin dashboard routes
│   │   ├── chat/          # Customer support chat
│   │   ├── games/         # Game management
│   │   ├── packages/      # Package management
│   │   ├── promotions/    # Promotion management
│   │   ├── transactions/  # Transaction monitoring
│   │   └── users/         # User management
│   ├── auth/              # Auth callbacks
│   │   └── callback/      # OAuth callback handler
│   ├── games/             # Games listing page
│   ├── [gameSlug]/        # Dynamic game detail & top-up pages
│   ├── profile/           # User profile page
│   └── page.tsx           # Landing page (Home)
├── components/             # Reusable UI components
│   ├── AdminGamesClient.tsx   # Admin games CRUD
│   ├── AdminLayoutClient.tsx  # Admin layout wrapper
│   ├── AdminSidebar.tsx       # Admin navigation sidebar
│   ├── ChatWidget.tsx         # Customer support chat widget
│   ├── Footer.tsx             # Site footer
│   ├── GameCard.tsx           # Game display card
│   ├── GamesClient.tsx        # Games listing client
│   ├── HomeClient.tsx         # Home page client
│   ├── Navbar.tsx             # Main navigation
│   ├── PackageCard.tsx        # Package display card
│   └── PaymentModal.tsx       # Payment modal
└── lib/                    # Utilities and helper functions
    ├── supabase/           # Supabase client configurations
    │   ├── client.ts       # Browser client (Client Components)
    │   └── server.ts       # Server client (Server Components)
    └── supabaseClient.ts   # Re-exports for backward compatibility
```

---

## 🗄️ Supabase Architecture

### Client Configuration

#### Client-Side (Browser)
```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
```
**Use in**: Client Components (`'use client'`)

#### Server-Side
```typescript
// src/lib/supabase/server.ts

// For public data & SSG (no auth needed)
export function createStaticClient() { ... }

// For authenticated requests (reads cookies)
export async function createServerClient() { ... }
```
**Use in**: Server Components, API Routes, Server Actions

### Database Schema

#### Tables
| Table | Description |
|-------|-------------|
| `users` | User profiles (extends Supabase Auth) |
| `games` | Available games for top-up |
| `packages` | Top-up packages for each game |
| `transactions` | Purchase transaction records |
| `promotions` | Discount codes and promotions |
| `chat_messages` | Customer support chat messages |

#### Key SQL Functions
```sql
-- Get chat users with last message timestamp
create or replace function public.get_chat_users()
returns table (id uuid, full_name text, email text, avatar_url text, last_message_at timestamptz)
```

#### Row Level Security (RLS)
- **Games/Packages**: Public read access
- **Transactions**: Users see own, Admins see all
- **Chat Messages**: Users see own, Admins see all
- **Users**: Role-based access control

---

## ✅ Task Status

### Core Features
- [x] **Navbar**: Updated design with "LnwTrue" style, active states, and search bar
- [x] **Footer**: Complete with links and branding
- [x] **Authentication**: OAuth login (Google, Facebook) with callback handling
- [x] **Logout**: Functionality added to Navbar and Profile
- [x] **User Sync**: Auto-sync user profile on OAuth callback

### User Interface
- [x] **Landing Page**: Hero section with game grid
- [x] **Games Page**: Dynamic listing from Supabase with SSG (revalidate: 1h)
- [x] **Game Details**: Dynamic `[gameSlug]` pages with packages
- [x] **Profile Page**: User information display with transaction history

### Admin Module
- [x] **Admin Layout**: Dedicated layout with sidebar navigation
- [x] **Dashboard**: Overview statistics
- [x] **Games Management**: CRUD operations for games
- [x] **Packages Management**: Package configuration
- [x] **User Management**: View and manage users (Server Component)
- [x] **Chat System**: Admin-to-user chat with polling (5s interval)
- [x] **Localization**: Admin interface in Thai

### Supabase Integration
- [x] **Client Setup**: Proper SSR client configuration
- [x] **Cookie Handling**: Using `getAll`/`setAll` API (latest best practice)
- [x] **Auth State**: Using `supabase.auth.onAuthStateChange` for session management
- [x] **API Calls**: Standard REST API calls (no WebSocket/Realtime)
- [x] **RPC Functions**: Custom `get_chat_users()` function

### Upcoming / In Progress
- [ ] **Payment Gateway**: Finalizing Omise integration
- [ ] **Transaction Processing**: Complete purchase flow
- [ ] **Email Notifications**: Order confirmations
- [ ] **Analytics Dashboard**: Sales and user metrics

---

## 🔧 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Omise (Payment)
OMISE_PUBLIC_KEY=your_omise_public_key
OMISE_SECRET_KEY=your_omise_secret_key
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18 or higher
- npm or yarn
- Supabase project with schema applied

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd levelup
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Apply Database Schema**
   Run the following SQL files in Supabase SQL Editor:
   - `schema.sql` - Main tables
   - `chat_helpers.sql` - Chat RPC functions
   - `chat_policies.sql` - Chat RLS policies

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   Visit [http://localhost:3000](http://localhost:3000)

### Available Scripts
```bash
npm run dev      # Start development server (Turbopack)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 📱 Page Routes

| Route | Description | Type |
|-------|-------------|------|
| `/` | Home/Landing page | Static |
| `/games` | Games listing | Static (ISR 1h) |
| `/[gameSlug]` | Game details & top-up | Dynamic |
| `/login` | OAuth login page | Static |
| `/profile` | User profile | Client |
| `/admin` | Admin dashboard | Dynamic |
| `/admin/games` | Manage games | Dynamic |
| `/admin/packages` | Manage packages | Dynamic |
| `/admin/users` | Manage users | Server |
| `/admin/transactions` | View transactions | Dynamic |
| `/admin/promotions` | Manage promotions | Dynamic |
| `/admin/chat` | Customer support | Client |

---

## 🔄 Recent Updates (December 2024)

### Supabase Client Refactoring
- Standardized import paths: `@/lib/supabase/client` for client, `@/lib/supabase/server` for server
- Updated auth callback to use `getAll`/`setAll` cookie API
- Fixed `useCallback` for `fetchConversations` in admin chat to prevent memory leaks
- Added backward compatibility exports in `supabaseClient.ts`

### Code Quality
- Consistent TypeScript interfaces across components
- Proper error handling for Supabase queries
- Polling-based data refresh (no WebSocket dependencies)

---

## 📝 Development Notes

### Supabase Client Usage Guidelines

| Component Type | Import | Function |
|----------------|--------|----------|
| Client Component (`'use client'`) | `@/lib/supabase/client` | `supabase` |
| Server Component (public data) | `@/lib/supabase/server` | `createStaticClient()` |
| Server Component (auth required) | `@/lib/supabase/server` | `createServerClient()` |
| API Route/Server Action | `@/lib/supabase/server` | `createServerClient()` |

### Data Fetching Pattern (Polling)
```typescript
const POLLING_INTERVAL = 5000; // 5 seconds

const fetchData = useCallback(async () => {
  const { data, error } = await supabase.from('table').select('*');
  if (data) setData(data);
}, []);

useEffect(() => {
  fetchData();
  
  const intervalId = setInterval(() => {
    fetchData();
  }, POLLING_INTERVAL);
  
  return () => clearInterval(intervalId);
}, [fetchData]);
```

### Auth State Management (Only WebSocket allowed)
```typescript
// supabase.auth uses WebSocket internally - this is expected
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null);
  });
  
  return () => subscription.unsubscribe();
}, []);
```

---

## 📄 License

This project is private and proprietary.