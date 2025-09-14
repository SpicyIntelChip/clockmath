/**
 * Geocoding API proxy route for ClockMath.com
 * Proxies requests to Geoapify to hide API keys and add rate limiting
 */

import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  
  // Return empty results for empty queries
  if (!q) {
    return NextResponse.json({ results: [] }, { status: 200 });
  }

  // Basic rate limiting by IP
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : req.ip || "unknown";
  const rateLimitOk = rateLimit({ 
    key: `places:${ip}`, 
    limit: 30, // 30 requests
    windowMs: 60_000 // per minute
  });
  
  if (!rateLimitOk) {
    return NextResponse.json(
      { error: "Rate limited. Please try again later." }, 
      { status: 429 }
    );
  }

  // Check for API key
  const apiKey = process.env.GEOAPIFY_KEY;
  if (!apiKey) {
    console.error("GEOAPIFY_KEY environment variable is not set");
    return NextResponse.json(
      { error: "Geocoding service unavailable" }, 
      { status: 503 }
    );
  }

  try {
    // Check if query looks like coordinates (lat,lon)
    const coordMatch = q.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    
    let url: URL;
    if (coordMatch) {
      // Reverse geocoding for coordinates
      url = new URL("https://api.geoapify.com/v1/geocode/reverse");
      url.searchParams.set("lat", coordMatch[1]);
      url.searchParams.set("lon", coordMatch[2]);
      url.searchParams.set("format", "json");
    } else {
      // Forward geocoding for place names
      url = new URL("https://api.geoapify.com/v1/geocode/autocomplete");
      url.searchParams.set("text", q);
      url.searchParams.set("limit", "5");
      url.searchParams.set("format", "json");
      url.searchParams.set("type", "city"); // Limit to city-level results
    }
    
    url.searchParams.set("apiKey", apiKey);

    // Fetch from Geoapify
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'ClockMath/1.0'
      }
    });

    if (!response.ok) {
      console.error(`Geoapify API error: ${response.status} ${response.statusText}`);
      return NextResponse.json({ results: [] }, { status: 200 });
    }

    const data = await response.json();

    // Transform results to our format
    const results = (data?.results || []).map((item: any) => ({
      name: item.formatted as string,
      lat: item.lat as number,
      lon: item.lon as number,
    })).filter((item: any) => 
      typeof item.name === 'string' && 
      typeof item.lat === 'number' && 
      typeof item.lon === 'number' &&
      !isNaN(item.lat) && 
      !isNaN(item.lon)
    );

    return NextResponse.json({ results });

  } catch (error) {
    console.error("Error fetching from Geoapify:", error);
    return NextResponse.json({ results: [] }, { status: 200 });
  }
}
