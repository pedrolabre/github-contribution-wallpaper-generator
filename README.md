# github-contribution-wallpaper-generator

> Transforme seu historico de contribuicoes do GitHub em arte generativa e papeis de parede em alta resolucao para telas OLED e monitores 4K.

Uma Single Page Application (SPA) client-side desenvolvida em React + Vite + Tailwind CSS que consome dados publicos de qualquer perfil do GitHub e gera wallpapers personalizados atraves de Canvas 2D nativo, sem exigir login ou backend.

---

## Estrutura do Projeto

```text
github-contribution-wallpaper-generator/
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── README.md
├── src/
│   ├── App.tsx
│   ├── components/
│   │   ├── CanvasPreview.tsx
│   │   ├── CustomPaletteEditor.tsx
│   │   ├── GeometryControls.tsx
│   │   ├── HUDControls.tsx
│   │   ├── LockscreenOverlay.tsx
│   │   ├── ModelSelector.tsx
│   │   ├── ModelSpecificControls.tsx
│   │   ├── PaletteSelector.tsx
│   │   ├── TaglineEditor.tsx
│   │   └── Toolbar.tsx
│   ├── engine/
│   │   ├── canvasContext.ts
│   │   ├── cellRenderer.ts
│   │   ├── cornerHudRenderer.ts
│   │   ├── fibonacciSpiralModel.ts
│   │   ├── matrixStreamModel.ts
│   │   ├── noiseGenerator.ts
│   │   └── topographicWaveModel.ts
│   ├── hooks/
│   │   └── useCanvas.ts
│   ├── main.tsx
│   ├── presets/
│   │   └── colorPalettes.ts
│   ├── services/
│   │   ├── cache.ts
│   │   ├── githubApi.ts
│   │   ├── mockGenerator.ts
│   │   ├── normalizer.ts
│   │   └── statsCalculator.ts
│   ├── styles/
│   │   └── globals.css
│   └── types/
│       ├── contributions.ts
│       ├── schemas.ts
│       └── wallpaper.ts
├── tailwind.config.js
├── tests/
│   ├── App.test.tsx
│   ├── components/
│   │   ├── CanvasPreview.test.tsx
│   │   ├── CustomPaletteEditor.test.tsx
│   │   ├── GeometryControls.test.tsx
│   │   ├── HUDControls.test.tsx
│   │   ├── LockscreenOverlay.test.tsx
│   │   ├── ModelSelector.test.tsx
│   │   ├── ModelSpecificControls.test.tsx
│   │   ├── PaletteSelector.test.tsx
│   │   ├── TaglineEditor.test.tsx
│   │   └── Toolbar.test.tsx
│   ├── engine/
│   │   ├── canvasContext.test.ts
│   │   ├── cellRenderer.test.ts
│   │   ├── cornerHudRenderer.test.ts
│   │   ├── fibonacciSpiralModel.test.ts
│   │   ├── matrixStreamModel.test.ts
│   │   ├── noiseGenerator.test.ts
│   │   └── topographicWaveModel.test.ts
│   ├── hooks/
│   │   └── useCanvas.test.ts
│   ├── presets/
│   │   └── colorPalettes.test.ts
│   ├── services/
│   │   ├── cache.test.ts
│   │   ├── githubApi.test.ts
│   │   ├── mockGenerator.test.ts
│   │   ├── normalizer.test.ts
│   │   └── statsCalculator.test.ts
│   ├── setup.ts
│   └── types/
│       └── schemas.test.ts
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```
