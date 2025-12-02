# Term888 - Game Top-up Platform

Term888 is a modern, premium game top-up platform designed to provide a seamless and secure experience for gamers. Built with performance and aesthetics in mind, it features a sleek "LnwTrue" inspired design, real-time data fetching, and a comprehensive admin dashboard.

## 📋 Plan & Roadmap

The goal of Term888 is to become a leading hub for game top-ups. The development plan focuses on:

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
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom design tokens.
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/)
- **Payment**: [Omise](https://www.omise.co/) (Integration in progress)

### Directory Structure
```
src/
├── app/                 # App Router pages and layouts
│   ├── (auth)/         # Authentication routes (login, register)
│   ├── admin/          # Admin dashboard routes
│   ├── [gameSlug]/     # Dynamic game detail pages
│   ├── profile/        # User profile pages
│   └── page.tsx        # Landing page
├── components/          # Reusable UI components
│   ├── Navbar.tsx      # Main navigation
│   ├── Footer.tsx      # Site footer
│   ├── GameCard.tsx    # Game display component
│   ├── AdminSidebar.tsx # Admin navigation
│   └── ...
└── lib/                 # Utilities and helper functions
```

### Key Features Implementation
- **Dynamic Routing**: Uses `[gameSlug]` for SEO-friendly game pages.
- **Admin Dashboard**: A dedicated layout with `AdminSidebar` for managing platform content.
- **Responsive Design**: Mobile-first approach ensuring compatibility across devices.

## ✅ Task Status

### Core Features
- [x] **Navbar**: Updated design with "LnwTrue" style, active states, and search bar.
- [x] **Footer**: Complete with links and branding.
- [x] **Authentication**: Login and Register pages implemented.
- [x] **Logout**: Functionality added to Navbar and Profile.

### User Interface
- [x] **Landing Page**: Hero section and game grid.
- [x] **Game Details**: Fetching dynamic data from Supabase.
- [x] **Profile Page**: User information display.

### Admin Module
- [x] **Sidebar**: Localized (Thai) navigation.
- [x] **Dashboard Structure**: Layouts for Games, Packages, Transactions.
- [x] **Localization**: Admin interface translated to Thai.

### Upcoming / In Progress
- [ ] **Real-time Chat**: Full integration of chat system.
- [ ] **Payment Gateway**: Finalizing Omise integration.
- [ ] **Calendar Module**: Project timeline and deadline tracking (Planned).

## 🚀 Walkthrough

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Getting Started

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd term888
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env.local` file in the root directory and add your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```

5.  **Open the application**
    Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Usage Guide
- **User View**: Browse games on the homepage, click a card to view details, and proceed to top-up (simulation). Access your profile via the top-right icon.
- **Admin View**: Navigate to `/admin` to access the dashboard. Use the sidebar to switch between managing Games, Packages, and viewing Transactions.
