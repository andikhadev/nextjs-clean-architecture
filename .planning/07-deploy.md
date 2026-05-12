# 06 — Deploy

**Status:** 🔲 Belum dimulai
**Tujuan:** Publish dokumentasi ke Vercel dan skills ke skills.sh.
Bergantung pada: Step 02–05 selesai.

---

## Checklist

### Dokumentasi (Vercel)
- [ ] Connect repo GitHub ke Vercel
- [ ] Set root directory ke `apps/docs`
- [ ] Verifikasi build sukses
- [ ] Cek `[url]/llms.txt` bisa diakses
- [ ] Setup custom domain (jika ada)
- [ ] Enable Vercel Analytics (opsional)

### Skills (skills.sh)
- [ ] Buat akun di skills.sh
- [ ] Publish 4 skills
- [ ] Verifikasi install command berjalan: `claude skills install nextjs-ca-scaffold`
- [ ] Buat grup/package jika memungkinkan: `nextjs-clean-architecture`

### Proposal ke Team Lead
- [ ] Buat dokumen proposal (lihat template di bawah)
- [ ] Screenshot docs site
- [ ] Demo install skill + generate feature
- [ ] List benefit dan adoption plan

---

## Vercel Setup

### Via Vercel Dashboard

1. Import repo dari GitHub
2. Set konfigurasi project:
   ```
   Framework Preset : Astro
   Root Directory   : apps/docs
   Build Command    : npm run build
   Output Directory : dist
   ```
3. Deploy — Vercel otomatis assign URL `[project].vercel.app`

### Environment Variables (jika ada)

```
SITE_URL = https://[domain].vercel.app
```

### Custom Domain

Di Vercel dashboard → Settings → Domains → Add domain.
Update DNS record di domain provider.

---

## skills.sh Publish

```bash
# Install CLI
npm install -g @skills-sh/cli

# Auth
skills login

# Publish satu per satu
skills publish .claude/skills/nextjs-ca-scaffold --name nextjs-ca-scaffold
skills publish .claude/skills/nextjs-ca-component --name nextjs-ca-component
skills publish .claude/skills/nextjs-ca-store --name nextjs-ca-store
skills publish .claude/skills/nextjs-ca-review --name nextjs-ca-review
```

Setelah publish, update `README.md` repo dengan install instructions:

```md
## Install Claude Skills

Pasang skill berikut untuk development sesuai convention:

\`\`\`bash
claude skills install nextjs-ca-scaffold   # scaffold feature baru
claude skills install nextjs-ca-component  # scaffold component
claude skills install nextjs-ca-store      # scaffold Zustand store
claude skills install nextjs-ca-review     # audit kode vs convention
\`\`\`
```

---

## Template Proposal ke Team Lead

```md
# Proposal: Next.js Clean Architecture Convention v2

## Masalah yang diselesaikan

Tanpa convention yang jelas, tiap developer membuat struktur folder dan
naming yang berbeda-beda. Ini mempersulit onboarding, code review, dan
AI-assisted development.

## Solusi

Convention v2 mendefinisikan:
- Struktur folder yang konsisten per feature
- Naming system dengan prefix yang eksplisit (ACT_, SE_, CE_, dll)
- 6 pattern data flow yang sudah teruji
- Stack modern: Zustand, TanStack Query, TanStack Form, Zod, shadcn/ui

## Deliverable

- Dokumentasi: [URL docs]
- 4 Claude Skills yang bisa di-install satu command
- Template/example: login feature sebagai referensi

## Adoption Plan

1. Minggu 1-2: Team lead review dan beri feedback
2. Minggu 3: Pilot pada 1 feature baru di project aktif
3. Minggu 4: Evaluasi, penyesuaian jika perlu
4. Minggu 5+: Rollout ke seluruh tim

## Biaya & Effort

- Zero cost — docs open source, skills gratis
- Setup awal: ~30 menit per developer (baca docs + install skills)
- Onboarding developer baru: jauh lebih cepat dengan docs terstruktur
```

---

## Maintenance Plan

### Saat ada perubahan convention

1. Update `01-convention-spec.md` — source of truth teknis
2. Update konten docs di `apps/docs/src/content/docs/`
3. Update `llms.txt` dan `llms-full.txt`
4. Update skills yang terdampak + re-publish
5. Bump version di docs header

### Cek rutin yang disarankan

- **Per sprint:** Cek apakah ada pola baru yang muncul di codebase yang perlu di-formalize
- **Per kuartal:** Review apakah stack masih relevan (misal: ada major update di TanStack)
- **Saat onboarding:** Verifikasi docs masih akurat dengan minta feedback dari dev baru
