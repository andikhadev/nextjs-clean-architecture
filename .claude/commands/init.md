# /init — Next.js Clean Architecture Convention v2

Setup atau sync convention v2 di project ini. Idempotent — re-run berfungsi sebagai sync.

## Step 1: Context Scan

Baca dan catat:
- Nama project dari `package.json` → field `name`
- Stack yang terdeteksi di `dependencies` / `devDependencies`:
  Next.js, shadcn/ui, TanStack Query, TanStack Form, Zustand, next-intl, Zod, MSW, nuqs
- Folder yang ada vs tidak: `src/app/`, `src/api/`, `src/lib/`, `src/reg/`, `messages/`

## Step 2: Detect Mode

Cek apakah `CLAUDE.md` sudah ada:
- **Tidak ada** → mode: first-time setup
- **Ada** → cek apakah sudah ada section "Next.js Clean Architecture Convention"
  - Sudah ada → mode: sync (bandingkan versi)
  - Belum ada → mode: first-time merge

## Step 3: Fetch & Install Skills

Fetch convention terbaru:
```
https://[domain]/llms.txt
```

Install mandatory skills ke `.claude/skills/` (per-project, bukan global):
- `frontend-design`
- `shadcn`
- `nextjs-app-router-patterns`

Update `nextjs-ca/references/` jika sync mode dan ada perubahan konten.

Jika ada skill yang sudah ada di `.claude/skills/` → skip install, cek versi saja.

## Step 4: Generate / Merge CLAUDE.md

### First-time setup

Generate section convention berdasarkan context scan. Struktur section:

```markdown
---

## Next.js Clean Architecture Convention v2

Convention reference: https://[domain]/llms.txt

### Active Skills
[tabel skills yang aktif — mandatory selalu ada, on-demand sesuai stack terdeteksi]

### Stack
[hanya stack yang terdeteksi di package.json — jangan list yang tidak ada]

### Missing Structure
[folder yang belum ada — kosong jika semua sudah ada]

### Critical Rules
[dari llms.txt — key rules section]
```

Jika CLAUDE.md belum ada → buat file baru.
Jika CLAUDE.md sudah ada tapi belum punya section convention → append di bawah.

### Sync mode

1. Diff section convention lama vs baru dari llms.txt
2. Tampilkan apa yang berubah
3. Jika ada overlap dengan konten existing diluar section convention → tampilkan excerpt + saran
4. **Tidak apply perubahan apapun tanpa konfirmasi user**
5. Setelah user approve → apply

## Step 5: Report

Tampilkan ringkasan:
```
✓/✗ Skills: [nama] installed / already up to date / failed
✓/✗ CLAUDE.md: created / merged / no changes
⚠  Missing folders: [list] (akan dibuat otomatis saat /new-feature)

Suggested next step: /new-feature untuk scaffold feature pertama
```

## Rules

- Jangan modifikasi konten CLAUDE.md yang sudah ada di luar section convention
- Jangan hapus konten apapun tanpa konfirmasi eksplisit
- Jika install skill gagal → laporkan, jangan hentikan proses
- Skills di-install ke `.claude/skills/` project ini, bukan ke `~/.claude/skills/` global
