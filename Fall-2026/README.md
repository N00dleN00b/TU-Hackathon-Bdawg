# React Shadcn Starter

React + Vite + TypeScript template for building apps with shadcn/ui.

## Getting Started

```bash
npx degit hayyi2/react-shadcn-starter my-project
cd my-project
npm install
npm run dev
```

## Getting Done

- [x] Single page app with navigation and responsif layout
- [x] Customable configuration `/config`
- [x] Simple starting page/feature `/pages`
- [x] Github action deploy github pages

## Deploy `gh-pages`

- change `basenameProd` in `/vite.config.ts`
- create deploy key `GITHUB_TOKEN` in github `/settings/keys`
- commit and push changes code
- setup gihub pages to branch `gh-pages`
- run action `Build & Deploy`

### Auto Deploy

- change file `.github/workflows/build-and-deploy.yml`
- Comment on `workflow_dispatch`
- Uncomment on `push`

```yaml
# on:
#   workflow_dispatch:
on:
  push:
    branches: ["main"]
```

## Features

- React + Vite + TypeScript
- Tailwind CSS
- [shadcn-ui](https://github.com/shadcn-ui/ui/)
- [react-router-dom](https://www.npmjs.com/package/react-router-dom)

## Project Structure

```md
react-shadcn-starter/
├── public/            # Public assets
├── src/               # Application source code
│   ├── components/    # React components
│   ├── context/       # contexts components
│   ├── config/        # Config data
│   ├── hook/          # Custom hooks
│   ├── lib/           # Utility functions
│   ├── pages/         # pages/features components
│   ├── App.tsx        # Application entry point
│   ├── index.css      # Main css and tailwind configuration
│   ├── main.tsx       # Main rendering file
│   └── Router.tsx     # Routes component
├── index.html         # HTML entry point
├── tsconfig.json      # TypeScript configuration
└── vite.config.ts     # Vite configuration
```

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/hayyi2/react-shadcn-starter/blob/main/LICENSE) file for details.





## Hackathon Ideas
-
igital City Layer (Augmented Web Map)

A browser-based “AR-style” city interface.

Overlay data like noise, safety, carbon footprint on a map
Crowd-sourced + IoT-style simulation
Could integrate with something like Google Maps APIs

Bonus: Let users “vote” to improve city areas and simulate impact.
-
Decentralized Identity Wallet (Web3-lite)

A simple identity system where users control their data.

Store credentials (education, work, certifications)
Share selectively via secure links
No central authority
-
Synthetic Society Sandbox

A simulation of a mini digital society.

AI agents with jobs, needs, and behaviors
Users tweak policies (UBI, taxes, AI laws)
Watch emergent outcomes

Feels like: a lightweight version of SimCity but policy-focused.
-
Self-sovereign identity (SSI)

Passwords die.

Instead:

You own your identity
You selectively reveal info (age, citizenship, etc.)
No centralized databases to hack

This is one of the most practical long-term DApp use cases.
-

