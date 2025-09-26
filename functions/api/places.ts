// Cloudflare Function for location search using Geoapify
// This replaces the Next.js API route for static export compatibility

interface Env {
  GEOAPIFY_API_KEY: string;
}

interface EventContext<Env = any, P = any, Data = any> {
  request: Request;
  env: Env;
  params: P;
  data: Data;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  waitUntil: (promise: Promise<any>) => void;
}

type PagesFunction<Env = any, P = any, Data = any> = (context: EventContext<Env, P, Data>) => Response | Promise<Response>;

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const query = url.searchParams.get('q');

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!query || query.trim().length === 0) {
    return new Response(
      JSON.stringify({ error: 'Query parameter is required' }),
      { 
        status: 400, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  }

  if (!env.GEOAPIFY_API_KEY) {
    console.error('GEOAPIFY_API_KEY not found in environment');
    return new Response(
      JSON.stringify({ error: 'API configuration error' }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  }

  try {
    // Use Geoapify Geocoding API
    const geoapifyUrl = new URL('https://api.geoapify.com/v1/geocode/search');
    geoapifyUrl.searchParams.set('text', query.trim());
    geoapifyUrl.searchParams.set('apiKey', env.GEOAPIFY_API_KEY);
    geoapifyUrl.searchParams.set('limit', '8');
    geoapifyUrl.searchParams.set('format', 'json');
    
    // Prioritize populated places (cities, towns, etc.)
    geoapifyUrl.searchParams.set('type', 'city,locality,district,neighbourhood');

    const response = await fetch(geoapifyUrl.toString());
    
    if (!response.ok) {
      throw new Error(`Geoapify API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform Geoapify response to our Place format
    const results = (data.results || []).map((item: any) => ({
      name: formatPlaceName(item),
      lat: item.lat,
      lon: item.lon,
    }));

    return new Response(
      JSON.stringify({ results }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
          ...corsHeaders
        } 
      }
    );

  } catch (error) {
    console.error('Places API error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to search locations',
        results: [] 
      }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  }
};

// Helper function to format place names nicely
function formatPlaceName(item: any): string {
  const parts = [];
  
  // Add the main place name
  if (item.name) {
    parts.push(item.name);
  } else if (item.city) {
    parts.push(item.city);
  } else if (item.town) {
    parts.push(item.town);
  } else if (item.village) {
    parts.push(item.village);
  }
  
  // Add state/region if different from main name
  if (item.state && item.state !== parts[0]) {
    parts.push(item.state);
  }
  
  // Add country
  if (item.country) {
    parts.push(item.country);
  }
  
  return parts.filter(Boolean).join(', ');
}