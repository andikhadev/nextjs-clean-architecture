import { defineConfig } from "astro/config"
import starlight from "@astrojs/starlight"
import vercel from "@astrojs/vercel"

export default defineConfig({
    output: "static",
    adapter: vercel(),
    integrations: [
        starlight({
            head: [
                {
                    tag: "link",
                    attrs: { rel: "llms", href: "/llms.txt" },
                },
            ],
            title: "Next.js Clean Architecture",
            description: "Convention guide for Next.js 15+ App Router projects",
            social: [
                {
                    icon: "github",
                    label: "GitHub",
                    href: "https://github.com/andikhadev/nextjs-clean-architecture",
                },
            ],
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
                        { label: "G — Library Adapter", slug: "patterns/lib-adapter" },
                        { label: "H — i18n (next-intl)", slug: "patterns/i18n" },
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
                        { label: "next-intl", slug: "stack/next-intl" },
                    ],
                },
                { label: "Contributing", slug: "contributing" },
            ],
            customCss: ["./src/styles/custom.css"],
        }),
    ],
})
