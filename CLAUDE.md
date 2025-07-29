# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GUNSHIKIN-KANRI-V2 is a strategic household financial management PWA (Progressive Web App) with military-themed UI. It integrates three core modules:
- **軍資金 (Gunshikin)**: Expense tracking with receipt photo capture
- **作戦 (Sakusen)**: Strategic todo/task management  
- **補給庫 (Hokyūko)**: Fridge/inventory management

Built with React + TypeScript + Vite, AWS Amplify Gen 2 backend, and TailwindCSS.

## Development Commands

```bash
# Development server with hot reload
npm run dev

# Build for production (includes TypeScript compilation)
npm run build

# Lint code (ESLint with TypeScript)
npm run lint

# Preview production build
npm run preview
```

## Architecture

### Frontend Structure
- **App.tsx**: Root component with Amplify config, providers, and PWA components
- **MainApp.tsx**: Main application shell with tab navigation and header
- **Page Components**: Organized by feature (expense/, todo/, fridge/, dashboard/)
- **Common Components**: Shared utilities (auth/, common/, ui/)
- **Hooks**: Custom React hooks for data management and optimization
- **Contexts**: React context providers (ToastContext for notifications)

### Backend (AWS Amplify Gen 2)
- **amplify/backend.ts**: Main backend definition with auth, data, storage
- **amplify/data/resource.ts**: DynamoDB schema (legacy-compatible with existing tables)
- **amplify/auth/resource.ts**: Cognito User Pool authentication
- **amplify/storage/resource.ts**: S3 storage for receipts and images

### Key Data Models
- **Expense**: Financial transactions with receipt support
- **Todo**: Task management with due dates and assignments
- **FridgeItem**: Inventory tracking with urgency flags
- **Receipt**: Image metadata for uploaded receipts
- **UserProfile**: User settings and preferences

### Technology Stack
- **Frontend**: React 19, TypeScript, Vite, TailwindCSS
- **Backend**: AWS Amplify Gen 2, DynamoDB, S3, Cognito
- **UI**: Radix UI primitives, Lucide React icons
- **State**: Zustand for global state, React Hook Form for forms
- **PWA**: vite-plugin-pwa with offline caching and install prompts

### Custom Hooks Pattern
The app uses extensive custom hooks for:
- Data management (useExpenses, useTodos, useFridge)
- Authentication (useAuth with dev mode support)
- Performance (useDebounce, useMemoryCache, useVirtualization)
- PWA features (usePWA, useRealtimeSync)
- UI optimization (useInfiniteScroll, useOptimisticUpdates)

### Development Mode
- Uses mock authentication in development (`useDevAuth`, `useDevData`)
- Amplify configuration skipped in dev mode for faster iteration
- Real-time sync and PWA features available in development

### File Organization
```
src/
├── components/           # Feature-based components
│   ├── auth/            # Authentication wrapper
│   ├── common/          # Shared UI components
│   ├── dashboard/       # Main dashboard
│   ├── expense/         # Expense tracking with receipts
│   ├── todo/           # Task management
│   ├── fridge/         # Inventory management
│   └── ui/             # Base UI components
├── contexts/           # React context providers
├── hooks/              # Custom React hooks
│   └── dev/           # Development-only hooks
└── lib/               # Utilities and configuration
```

### Image and Receipt Handling
- Receipt photos captured via ImageCapture component
- Images optimized using useImageOptimization hook
- AWS S3 storage integration for receipt persistence
- Image gallery and preview components for viewing

### PWA Features
- Service worker with offline caching
- Install prompt for mobile devices
- Background sync for offline operations
- Push notifications capability
- App shortcuts for quick actions (receipt capture, new task)

## Styling and UI

Uses TailwindCSS v4 with:
- Military-themed color palette and terminology
- Responsive design with mobile-first approach
- Custom animations via tailwindcss-animate
- Consistent spacing and typography system

## Key Configuration Files

- **vite.config.ts**: PWA configuration, build optimization, alias setup
- **eslint.config.js**: TypeScript ESLint with React hooks rules
- **tsconfig.json**: TypeScript configuration with strict mode
- **package.json**: Scripts and dependencies (note: no test framework configured)