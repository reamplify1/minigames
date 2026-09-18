export function renderHomePage(): void {
  const root = document.createElement('div');
  root.id = 'app';
  root.textContent = 'Home Page (SPA placeholder)';

  document.body.replaceChildren(root);
}