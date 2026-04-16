# Base-10 Math Manipulatives

An interactive, touch-friendly web app for elementary math classrooms to explore place value using Base-10 blocks.

🎮 **[Live Demo](https://jgrippe1.github.io/base10-math-game/)**

---

## Features

- **Draggable blocks** — Unit (1s), Ten (10s), Hundred (100s) rendered on HTML5 Canvas via Konva.js
- **Drag-to-snap** — Drag a unit block near 9 others and they auto-group into a Ten rod
- **Lasso selection** — Draw a freehand circle around exactly 10 blocks to group them
  - Lift and resume your lasso freely — it pauses and persists
  - Green flash = success, Red flash = wrong count
- **Double-tap to break apart** — Ten rod → 10 units, Hundred square → 10 tens
- **Live value display** — Shows total and per-type breakdown in real time
- **Smartboard optimised** — Touch events, no browser zoom/pan, high-contrast colours

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | React 18 + Vite |
| Canvas | react-konva + Konva.js |
| State | Zustand |
| Deploy | GitHub Pages via GitHub Actions |

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/)

## Deployment

Push to `main` — GitHub Actions builds and deploys automatically to GitHub Pages.

---

## ☕ Support the Project

If you find this tool useful in your classroom, tips are greatly appreciated!

[![Tip via PayPal](https://img.shields.io/badge/Tip%20via-PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/jgrippe1)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an issue.
