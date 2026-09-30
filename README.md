<div align="center">

# RustaBase Templates

Ready-made websites for the [RustaBase](https://rustabase.com) Marketplace.

</div>

Each folder in `templates/` is a small, dependency-free website that talks to a RustaBase backend. When a customer deploys a full-stack template from the console, RustaBase creates the backend, then builds the matching folder here and publishes it as an Application Stack.

| Template | Folder | What it does |
| --- | --- | --- |
| Blog & CMS | `templates/blog-cms` | Public blog with topics and post pages |
| POS & online store | `templates/pos-store` | Product list, cart, sign-in and checkout |
| SaaS starter | `templates/saas-starter` | Pricing, sign-in and team dashboard |
| Booking | `templates/booking` | Services, open times and booking form |

## Run one locally

```bash
cd templates/blog-cms
bun ../../scripts/build.mjs https://your-backend.rustabase.net
npx serve dist
```

Or open any built site with `?backend=https://…` to point it at a different backend.

## Add a template

1. Create `templates/<slug>/src/index.html` and `app.js` (import helpers from `./rb.js`).
2. Add the slug to `templates.json`.
3. Set the same slug on the template in the admin console's Marketplace page.

## License

MIT
