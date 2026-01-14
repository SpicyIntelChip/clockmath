// Post-build script to inject the places API into the worker
const fs = require('fs');
const path = require('path');

const workerPath = path.join(__dirname, '../.vercel/output/static/_worker.js/index.js');
const placesApiCode = `
// Injected Places API handler
async function handlePlacesApi(request, env) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!query || query.trim().length === 0) {
    return new Response(
      JSON.stringify({ error: 'Query parameter is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  // Try multiple ways to access the API key
  const apiKey = env.GEOAPIFY_API_KEY || env.GEOAPIFY_KEY || (globalThis.process?.env?.GEOAPIFY_API_KEY);

  if (!apiKey) {
    console.error('GEOAPIFY_API_KEY not found in environment. Available keys:', Object.keys(env || {}));
    return new Response(
      JSON.stringify({ error: 'API configuration error', debug: Object.keys(env || {}).join(',') }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  try {
    const geoapifyUrl = new URL('https://api.geoapify.com/v1/geocode/search');
    geoapifyUrl.searchParams.set('text', query.trim());
    geoapifyUrl.searchParams.set('apiKey', apiKey);
    geoapifyUrl.searchParams.set('limit', '8');
    geoapifyUrl.searchParams.set('format', 'json');
    geoapifyUrl.searchParams.set('type', 'city');

    const fetchUrl = geoapifyUrl.toString();
    const response = await fetch(fetchUrl);

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error('Geoapify API error: ' + response.status + ' - ' + responseText.substring(0, 200));
    }

    const data = await response.json();

    const formatPlaceName = (item) => {
      const parts = [];
      if (item.name) parts.push(item.name);
      else if (item.city) parts.push(item.city);
      if (item.state && item.state !== item.name) parts.push(item.state);
      else if (item.county && item.county !== item.name) parts.push(item.county);
      if (item.country && item.country !== item.state && item.country !== item.name) parts.push(item.country);
      return parts.filter(Boolean).join(', ');
    };

    const results = (data.results || []).map((item) => ({
      name: formatPlaceName(item),
      lat: item.lat,
      lon: item.lon,
    }));

    return new Response(
      JSON.stringify({ results }),
      { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600', ...corsHeaders } }
    );
  } catch (error) {
    console.error('Places API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to search locations', message: error?.message || String(error), results: [] }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
}
`;

// Read the existing worker
let workerContent = fs.readFileSync(workerPath, 'utf8');

// Find the fetch handler and wrap it
const originalExport = 'var ks={async fetch(e,t,r){';
const wrappedExport = `${placesApiCode}
var ks={async fetch(e,t,r){
  // Check if this is a places API request
  const reqUrl = new URL(e.url);
  if (reqUrl.pathname === '/api/places' || reqUrl.pathname === '/api/places/') {
    return handlePlacesApi(e, t);
  }
`;

if (workerContent.includes(originalExport)) {
  workerContent = workerContent.replace(originalExport, wrappedExport);
  fs.writeFileSync(workerPath, workerContent);
  console.log('✅ Successfully injected places API into worker');
} else {
  console.error('❌ Could not find worker export to patch');
  process.exit(1);
}
