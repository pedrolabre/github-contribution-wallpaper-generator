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
│   ├── main.tsx
│   ├── services/
│   │   ├── cache.ts
│   │   └── githubApi.ts
│   ├── styles/
│   │   └── globals.css
│   └── types/
│       ├── contributions.ts
│       ├── schemas.ts
│       └── wallpaper.ts
├── tailwind.config.js
├── tests/
│   ├── App.test.tsx
│   ├── services/
│   │   ├── cache.test.ts
│   │   └── githubApi.test.ts
│   ├── setup.ts
│   └── types/
│       └── schemas.test.ts
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```
