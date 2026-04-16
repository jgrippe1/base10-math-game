/**
 * App.jsx — Root layout: Toolbar | Canvas
 */

import Toolbar    from './components/Toolbar';
import GameCanvas from './components/GameCanvas';

export default function App() {
  return (
    <main className="app-layout">
      <Toolbar />
      <GameCanvas />
    </main>
  );
}
