# Home Chore Manager

A collaborative household chore management app that helps families organize, assign, and track chores together.

## Features

- **Household Management**: Create or join a household with a shareable code
- **Chore Calendar**: Visual calendar view of scheduled chores
- **Chore List**: List view with filtering and sorting options
- **Member Management**: Add family members with custom colors for easy identification
- **Recurring Chores**: Set up daily, weekly, or monthly recurring tasks
- **Maintenance Recommendations**: Get suggestions for common household maintenance tasks
- **Mobile Support**: Responsive design with mobile navigation drawer
- **PWA Ready**: Install as a standalone app on mobile devices

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Database**: Firebase Firestore (real-time sync)
- **Calendar**: FullCalendar
- **Testing**: Vitest with React Testing Library
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Firebase project (for database)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd home-chore-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Add your Firebase configuration to `.env`:
   ```
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run tests in watch mode |
| `npm run test:ui` | Run tests with UI |
| `npm run test:coverage` | Run tests with coverage report |

## Project Structure

```
src/
├── components/
│   ├── Calendar/       # Calendar view components
│   ├── Chores/         # Chore list and modal components
│   ├── Layout/         # Header, Sidebar, MobileDrawer
│   ├── Members/        # Member management components
│   ├── Onboarding/     # Household setup and member selection
│   └── Recommendations/# Maintenance suggestions
├── context/
│   ├── AuthContext.tsx     # Current user state
│   ├── ChoreContext.tsx    # Chore CRUD operations
│   ├── HouseholdContext.tsx# Household and Firebase sync
│   └── MemberContext.tsx   # Household member management
├── hooks/
│   └── useLocalStorage.ts  # Persistent state hook
├── services/
│   └── householdService.ts # Firebase Firestore operations
├── styles/
│   ├── calendar.css    # FullCalendar customizations
│   └── variables.css   # CSS variables and global styles
├── types/
│   └── index.ts        # TypeScript type definitions
├── App.tsx             # Main app component
└── main.tsx            # Entry point
```

## Deployment

The app is configured for deployment on Vercel:

1. Push your changes to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

The `vercel.json` configuration handles SPA routing and static asset caching.

## License

MIT
