// Cloudflare Pages Function for location search using Geoapify
// Using the official Cloudflare Pages Functions API

export async function onRequestGet(context) {
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

  // Access the encrypted secret from Cloudflare environment
  if (!env.GEOAPIFY_API_KEY) {
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
    geoapifyUrl.searchParams.set('type', 'city');

    const response = await fetch(geoapifyUrl.toString());
    
    if (!response.ok) {
      throw new Error(`Geoapify API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform Geoapify response to our Place format
    const results = (data.results || []).map((item) => ({
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

  } catch {
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
}

// Helper function to format place names nicely
function formatPlaceName(item) {
  const parts = [];
  
  if (item.name) {
    parts.push(item.name);
  } else if (item.city) {
    parts.push(item.city);
  }

  if (item.state && item.state !== item.name) {
    parts.push(item.state);
  } else if (item.county && item.county !== item.name) {
    parts.push(item.county);
  }

  if (item.country && item.country !== item.state && item.country !== item.name) {
    parts.push(item.country);
  }

  return parts.filter(Boolean).join(', ');
}
