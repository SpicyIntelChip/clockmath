# ClockMath.com Setup Instructions

## Environment Variables

To enable location-based timezone detection, you'll need to set up a Geoapify API key.

### Step 1: Get a Geoapify API Key

1. Go to [Geoapify.com](https://www.geoapify.com/)
2. Sign up for a free account
3. Create a new project and get your API key
4. The free tier includes 3,000 requests per day

### Step 2: Configure Environment Variables

Create a `.env.local` file in the project root with:

```env
GEOAPIFY_KEY=your_geoapify_api_key_here
```

### Step 3: Test the Setup

1. Start the development server: `npm run dev`
2. Navigate to `/tools/timezone`
3. Try searching for a location (e.g., "London", "Tokyo", "New York")
4. The location should resolve to the correct timezone automatically

## Features

- **Location Search**: Type any city, address, or landmark to auto-detect timezone
- **Geolocation**: Use "Use my current location" button for automatic detection
- **Manual Fallback**: Switch to manual timezone selection if needed
- **Rate Limited**: API proxy includes rate limiting for security
- **Privacy Friendly**: API keys are never exposed to the client

## API Endpoints

- `GET /api/places?q=search_term` - Returns location suggestions
- Rate limited to 30 requests per minute per IP

## Testing

This project currently has no configured test runner.
If you want tests, add a runner like Jest or Vitest and reintroduce test files.
