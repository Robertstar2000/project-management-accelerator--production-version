# Technology Stack

## Programming Languages
- **TypeScript**: ~5.8.2 (Primary language)
- **TSX/JSX**: React component syntax

## Core Framework
- **React**: ^19.1.1 (UI framework)
- **React DOM**: ^19.1.1 (React rendering)

## Build System
- **Vite**: ^6.2.0 (Build tool and dev server)
- **@vitejs/plugin-react**: ^5.0.0 (React integration for Vite)

## AI Integration
- **@google/genai**: ^1.21.0 (Google Gemini AI SDK)

## Utilities
- **jszip**: ^3.10.1 (ZIP file handling for document management)

## Development Dependencies
- **TypeScript**: ~5.8.2 (Type checking and compilation)
- **@types/node**: ^22.14.0 (Node.js type definitions)

## Development Commands

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```
Starts Vite dev server with hot module replacement

### Build for Production
```bash
npm run build
```
Creates optimized production build

### Preview Production Build
```bash
npm run preview
```
Locally preview production build

## Environment Configuration
- **GEMINI_API_KEY**: Required in `.env.local` for AI functionality
- Environment variables loaded via Vite's env system

## Module System
- **Type**: ES Modules (ESM)
- **Import Style**: ES6 imports/exports

## TypeScript Configuration
- Configured via `tsconfig.json`
- Strict type checking enabled
- JSX support for React components

## Browser Compatibility
- Modern browsers supporting ES6+
- Vite handles transpilation and polyfills
