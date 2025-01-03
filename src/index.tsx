import { createRoot } from 'react-dom/client';

import './vendor';
import './sass/noscript.scss';
import { Application } from './Application';

window.addEventListener('vite:preloadError', () => {
  window.location.reload();
});

const domNode = document.getElementById('react-root');
const root = createRoot(domNode);
root.render(<Application />);
