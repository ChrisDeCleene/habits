# Habit Tracker

A progressive web app for tracking daily, weekly, and monthly habits with customizable goals.

## Features

- **Google Authentication**: Secure sign-in with Google OAuth
- **Flexible Goal Settings**: Set target quantities as ranges (e.g., 4-6) or single values (e.g., 5)
- **Multiple Frequency Options**: Track habits daily, on workdays, weekly, or monthly
- **Visual Progress Tracking**: Monitor completion with increment buttons and progress indicators
- **PWA Support**: Install on mobile devices for a native app experience
- **Timezone Aware**: Accurate tracking across different timezones

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Authentication**: Firebase Auth (Google Sign-in)
- **Database**: Cloud Firestore
- **PWA**: vite-plugin-pwa with Workbox
- **Icons**: Lucide React
- **Testing**: Vitest + React Testing Library
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Firebase project with Firestore and Authentication enabled

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/habits.git
   cd habits
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
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Generate coverage report
- `npm run lint` - Run ESLint

## Project Structure

```
habits/
├── .github/
│   └── workflows/       # GitHub Actions CI/CD
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   └── __tests__/   # Component tests
│   ├── contexts/        # React contexts (Auth, etc.)
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Firebase config and utilities
│   ├── test/            # Test setup and utilities
│   └── types/           # TypeScript type definitions
├── .env.example         # Environment variables template
├── index.html           # HTML entry point
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
├── vitest.config.ts     # Vitest configuration
└── vercel.json          # Vercel deployment config
```

## Firebase Setup

1. Create a new Firebase project at https://console.firebase.google.com
2. Enable Google Authentication in Authentication > Sign-in method
3. Create a Firestore database in production mode
4. Add your web app in Project Settings and copy the config

## Deployment

### Vercel

This project is configured for deployment on Vercel.

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard:
   - All `VITE_FIREBASE_*` variables from your `.env`
4. Deploy!

The GitHub Actions workflow will automatically deploy to Vercel on pushes to `main`.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - feel free to use this project for your own habit tracking needs!

## Roadmap

### V1 (MVP)
- [x] Project setup and infrastructure
- [x] Google authentication
- [x] Basic dashboard layout
- [x] Testing setup
- [x] CI/CD pipeline
- [ ] Habit CRUD operations
- [ ] Daily tracking interface
- [ ] Progress calculation
- [ ] Weekly/monthly views
- [ ] PWA icons and manifest

### V2 (Future)
- [ ] Push notifications
- [ ] Statistics and insights
- [ ] Data export
- [ ] Habit streaks
- [ ] Custom themes
- [ ] Social features
