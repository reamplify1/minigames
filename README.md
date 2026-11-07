# MiniGames

A web application built with **Angular**, **TypeScript** and **Sass**, with Firebase authentication.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Add the Firebase settings

Copy `.env.example` to `.env.local` and fill in the values from the Firebase Console.

### 3. Start the development server

```bash
npm start
```

The application will be available at `http://localhost:4200`.

### 4. Build for production

```bash
npm run build
```

The production build will be generated in the `dist` directory.

### 5. Run the tests

```bash
npm test
```

## Project Structure

```
src/
├─ main.ts                starts the application
├─ styles/                design tokens, mixins and global styles
└─ app/
   ├─ app.ts              page shell: header, current page, footer, dialogs
   ├─ app.routes.ts       the list of pages
   ├─ core/               services and helpers shared by the whole app
   ├─ pages/              home, library and 404 pages
   └─ components/         everything the pages are built from
```

## Dialogs Live in the URL

`?game=palia` opens the game dialog and `?auth=login` opens the login dialog. Components change the URL through `DialogNavigationService`, and `App` reads the URL and shows the right dialog. A dialog therefore survives a page reload and works with the browser's Back button.

## App Session

After a successful login or registration (email/password or Google), the app stores a minimal session object in `localStorage` under the key `minigames:minigames-rss:app-session`. The session lives for 5 minutes, independent of Firebase's own token lifetime.

`AuthService` checks the session at startup, when the tab gets focus, before every navigation and before every protected action.
