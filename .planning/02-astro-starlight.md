# 02 — Astro Starlight: Setup

**Status:** 🔲 Belum dimulai
**Tujuan:** Inisiasi project Astro Starlight sebagai platform dokumentasi baru,
menggantikan docs site vanilla HTML/JS saat ini. Deploy ke Vercel.

---

## Checklist

- [ ] Init project Astro + Starlight
- [ ] Konfigurasi sidebar structure di `astro.config.mjs`
- [ ] Install Vercel adapter
- [ ] Setup `vercel.json` jika diperlukan
- [ ] Push ke GitHub, connect ke Vercel
- [ ] Verifikasi preview URL berjalan
- [ ] Custom domain (jika sudah ada)

---

## Keputusan Teknis

### Kenapa Astro Starlight

- **Built-in search** — Pagefind, zero config, berjalan 100% client-side
- **MDX support** — bisa sisipkan komponen React/Astro di dalam konten
- **Vercel-ready** — `@astrojs/vercel` adapter, satu perintah langsung deploy
- **AI-friendly** — output HTML bersih, mudah di-index oleh LLM via `llms.txt`
- **Dark mode** — built-in, tidak perlu setup manual
- **i18n** — sudah ada slot, mudah ditambahkan next-intl jika perlu

### Repo strategy

Dua opsi yang perlu dipilih:

| Opsi | Deskripsi | Cocok jika |
|------|-----------|------------|
| **A — Monorepo** | Docs dan convention spec di satu repo | Ingin convention dan docs selalu sinkron |
| **B — Repo terpisah** | Docs di repo sendiri | Tim docs dan tim convention berbeda, atau ingin URL repo yang bersih |

**Rekomendasi:** Opsi A (monorepo) — lebih mudah maintain, satu PR bisa update spec + docs sekaligus.

Struktur monorepo:
```
nextjs-clean-architecture/   ← nama repo baru
├── .planning/               ← context files (tidak ikut build)
├── apps/
│   └── docs/                ← Astro Starlight project
├── example/
│   └── login/               ← contoh implementasi
└── CLAUDE.md
```

---

## Init Commands

```bash
# dari root repo
npm create astro@latest apps/docs -- --template starlight
cd apps/docs
npm install
npm install @astrojs/vercel
```

---

## Konfigurasi `astro.config.mjs`

```js
import { defineConfig } from "astro/config"
import starlight from "@astrojs/starlight"
import vercel from "@astrojs/vercel/static"

export default defineConfig({
    output: "static",
    adapter: vercel(),
    integrations: [
        starlight({
            title: "Next.js Clean Architecture",
            description: "Convention guide for Next.js 15+ App Router projects",
            logo: {
                src: "./src/assets/logo.svg",
            },
            social: {
                github: "https://github.com/[username]/nextjs-clean-architecture",
            },
            sidebar: [
                { label: "Introduction", slug: "index" },
                {
                    label: "Folder & File Structure",
                    items: [
                        { label: "Overview", slug: "structure/overview" },
                        { label: "Root", slug: "structure/root" },
                        { label: "Feature", slug: "structure/feature" },
                        { label: "Action", slug: "structure/action" },
                        { label: "Element", slug: "structure/element" },
                        { label: "Function", slug: "structure/function" },
                        { label: "Store", slug: "structure/store" },
                        { label: "API", slug: "structure/api" },
                        { label: "Library", slug: "structure/lib" },
                        { label: "Registry", slug: "structure/registry" },
                        { label: "Language", slug: "structure/lang" },
                    ],
                },
                {
                    label: "Naming Conventions",
                    items: [
                        { label: "Overview", slug: "naming/overview" },
                        { label: "Folder", slug: "naming/folder" },
                        { label: "File", slug: "naming/file" },
                        { label: "Symbol & Function", slug: "naming/symbol" },
                    ],
                },
                {
                    label: "Pattern Guide",
                    items: [
                        { label: "Overview", slug: "patterns/overview" },
                        { label: "A — Server Fetch", slug: "patterns/server-fetch" },
                        { label: "B — Client Fetch (TanStack Query)", slug: "patterns/client-fetch" },
                        { label: "C — Form Submit", slug: "patterns/form-submit" },
                        { label: "D — URL Search Params", slug: "patterns/url-params" },
                        { label: "E — Zustand Store", slug: "patterns/zustand" },
                        { label: "F — shadcn/ui Extension", slug: "patterns/shadcn" },
                    ],
                },
                {
                    label: "Stack Guide",
                    items: [
                        { label: "shadcn/ui", slug: "stack/shadcn" },
                        { label: "Zustand", slug: "stack/zustand" },
                        { label: "TanStack Query", slug: "stack/tanstack-query" },
                        { label: "TanStack Form", slug: "stack/tanstack-form" },
                        { label: "Zod", slug: "stack/zod" },
                    ],
                },
                { label: "Contributing", slug: "contributing" },
            ],
            customCss: ["./src/styles/custom.css"],
        }),
    ],
})
```

---

## Vercel Deployment

```json
// vercel.json (di root apps/docs)
{
    "buildCommand": "npm run build",
    "outputDirectory": "dist",
    "framework": "astro"
}
```

Atau jika monorepo, set di Vercel dashboard:
- Root directory: `apps/docs`
- Build command: `npm run build`
- Output directory: `dist`

---

## Custom Styling

Starlight mendukung CSS variables untuk theming. File: `src/styles/custom.css`

```css
:root {
    --sl-color-accent-low: #1e3a5f;
    --sl-color-accent: #2563eb;
    --sl-color-accent-high: #93c5fd;
    --sl-font: "Inter", sans-serif;
}
```

---

## Catatan Pengembangan Lanjutan

### Menambah UI interaktif di docs

Astro MDX memungkinkan import komponen React langsung di halaman docs:

```mdx
---
title: Pattern B — Client Fetch
---

import { CodeDemo } from "../../components/CodeDemo.tsx"

<CodeDemo client:load code={`...`} />
```

Cocok untuk menambahkan:
- Live code preview
- Interactive diagram
- Tab code comparison (before/after convention)

### Menambah i18n pada docs

Starlight punya built-in i18n. Tambahkan ke `astro.config.mjs`:
```js
starlight({
    defaultLocale: "id",
    locales: {
        id: { label: "Bahasa Indonesia" },
        en: { label: "English" },
    },
})
```
Lalu struktur konten jadi `src/content/docs/id/` dan `src/content/docs/en/`.

### Menambah versioning

Jika convention berkembang ke v3, Starlight mendukung versioning via plugin komunitas
`starlight-versions`. Setiap versi adalah folder terpisah di `src/content/docs/`.
