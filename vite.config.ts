import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: './',
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        // The test files themselves — not application logic, so they aren't
        // counted toward the coverage target.
        'src/**/*.test.ts',
        // Only registers routes and starts the router/dialog-sync listeners on
        // DOMContentLoaded — no branching or business logic of its own to test.
        'src/main.ts',
        // Only wires up the Firebase SDK with config values from env vars, no
        // business logic of its own to test.
        'src/firebase/firebase-config.ts',
        // Ambient type declarations only (import.meta.env typings) — contains
        // no runtime code at all.
        'src/vite-env.d.ts',
        // Static markup only: build a fixed HTML template with no conditions,
        // event listeners or other logic of their own to test.
        'src/components/hero/hero.ts',
        'src/components/footer/footer.ts',
        'src/components/developer-cta/developer-cta.ts',
        'src/components/game-card/game-card.ts',
        // Only puts the home-page sections together in order, no logic of its
        // own to test.
        'src/pages/home/home-page.ts',
        // TypeScript types only — contains no runtime code at all.
        'src/components/leaderboard/leaderboard.types.ts',
      ],
    },
  },
});
