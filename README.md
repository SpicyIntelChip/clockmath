# ClockMath

![ClockMath](https://clockmath.com/og.png)

Free online time calculators and timezone conversion tools.

**Live Site**: [clockmath.com](https://clockmath.com)

## Features

### Tools

- **Date Duration Calculator** - Calculate the exact time between any two dates with detailed breakdowns (years, months, weeks, days, hours, minutes, seconds)
- **Timezone Converter** - Convert times across global timezones with automatic location detection and daylight saving time support

### Educational Content

14 articles covering practical time management topics:
- Work hours and overtime calculation
- Sleep tracking and optimization
- Freelancer time management
- Remote work meeting scheduling
- Travel timezone planning
- And more...

## Tech Stack

- **Framework**: Next.js 15 / React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Date Handling**: date-fns
- **Hosting**: Cloudflare Pages

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/clockmath.git
cd clockmath

# Install dependencies
npm install

# Start development server
npm run dev
```

The site will be available at `http://localhost:3000`

## Environment Variables

For location-based timezone detection, create a `.env.local` file:

```env
GEOAPIFY_KEY=your_geoapify_api_key
```

Get a free API key at [geoapify.com](https://www.geoapify.com/) (3,000 requests/day free).

The site works without this key - location features will fall back to manual timezone selection.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── page.tsx           # Home (Date Duration Calculator)
│   ├── tools/timezone/    # Timezone Converter
│   └── articles/          # Educational content
├── components/            # React components
│   ├── ui/               # Radix UI components
│   └── ...               # Feature components
├── lib/                   # Utilities
│   ├── time.ts           # Time calculations
│   ├── seo.ts            # SEO utilities
│   └── articlesCatalog.ts # Content catalog
├── public/               # Static assets
└── functions/            # Cloudflare Pages Functions
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Deployment

### Cloudflare Pages

```bash
npm run pages:build
npx wrangler pages deploy out
```

### Other Platforms

The site exports as static HTML and can be deployed to any static hosting provider:
- Vercel
- Netlify
- GitHub Pages

Build output is in the `out/` directory.

## License

MIT License - see [LICENSE](LICENSE) for details.
