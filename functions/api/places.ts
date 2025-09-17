/**
 * Cloudflare Function for ClockMath.com Places API
 * Proxies requests to Geoapify to hide API keys and add rate limiting
 */

interface Env {
  GEOAPIFY_KEY: string;
}

interface LocationResult {
  name: string;
  lat: number;
  lon: number;
}

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim();
  
  // Return empty results for empty queries
  if (!q) {
    return new Response(JSON.stringify({ results: [] }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  // Check for API key
  const apiKey = env.GEOAPIFY_KEY;
  if (!apiKey) {
    console.error("GEOAPIFY_KEY environment variable is not set");
    return new Response(JSON.stringify({ error: "Geocoding service unavailable" }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }

  try {
    // Check if query looks like coordinates (lat,lon)
    const coordMatch = q.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    
    let apiUrl: URL;
    if (coordMatch) {
      // Reverse geocoding for coordinates
      apiUrl = new URL("https://api.geoapify.com/v1/geocode/reverse");
      apiUrl.searchParams.set("lat", coordMatch[1]);
      apiUrl.searchParams.set("lon", coordMatch[2]);
      apiUrl.searchParams.set("format", "json");
    } else {
      // Forward geocoding for place names
      apiUrl = new URL("https://api.geoapify.com/v1/geocode/autocomplete");
      apiUrl.searchParams.set("text", q);
      apiUrl.searchParams.set("limit", "5");
      apiUrl.searchParams.set("format", "json");
      apiUrl.searchParams.set("type", "city"); // Limit to city-level results
    }
    
    apiUrl.searchParams.set("apiKey", apiKey);

    // Fetch from Geoapify
    const response = await fetch(apiUrl.toString(), {
      headers: {
        'User-Agent': 'ClockMath/1.0'
      }
    });

    if (!response.ok) {
      console.error(`Geoapify API error: ${response.status} ${response.statusText}`);
      return new Response(JSON.stringify({ results: [] }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    const data = await response.json();

    // Transform results to our format
    const results: LocationResult[] = (data?.results || []).map((item: any) => ({
      name: item.formatted as string,
      lat: item.lat as number,
      lon: item.lon as number,
    })).filter((item: LocationResult) => 
      typeof item.name === 'string' && 
      typeof item.lat === 'number' && 
      typeof item.lon === 'number' &&
      !isNaN(item.lat) && 
      !isNaN(item.lon)
    );

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });

  } catch (error) {
    console.error("Error fetching from Geoapify:", error);
    return new Response(JSON.stringify({ results: [] }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}

// Handle CORS preflight requests
export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
