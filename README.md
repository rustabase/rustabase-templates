<div align="center">

# RustaBase Templates

Production-ready TanStack Start applications for the [RustaBase](https://rustabase.com) Marketplace.

</div>

Every full-stack Marketplace deployment creates a RustaBase backend, then builds one of these editable TanStack applications and connects it automatically.

| Template | Folder | Included experience |
| --- | --- | --- |
| Blog & CMS | `templates/blog-cms` | Article collection, topic filters, and story pages |
| POS & online store | `templates/pos-store` | Product catalogue, account access, cart, and checkout |
| SaaS starter | `templates/saas-starter` | Pricing, authentication, and team workspace |
| Booking | `templates/booking` | Services, availability, and appointment requests |

## Standard stack

- TanStack Start and Router
- TanStack Query for server data
- React 19 and TypeScript
- Shared accessible components in `shared/`
- RustaBase collections and authentication

## Develop a template

```bash
bun install
VITE_RUSTABASE_URL=https://your-backend.rustabase.net \
  bun run --cwd templates/blog-cms dev
```

Build every template with `bun run build:all`.

## Add a template

1. Copy an existing folder under `templates/`.
2. Keep shared controls and data access in `shared/`.
3. Add the slug and folder to `templates.json`.
4. Add the matching backend blueprint in the Marketplace admin console.

## License

MIT
