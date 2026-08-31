import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    
    if (!apiKey || apiKey === 'your_google_api_key_here') {
      return NextResponse.json(
        { 
          error: 'Google Places API key not configured',
          message: 'Please add your Google Places API key to environment variables'
        },
        { status: 500 }
      );
    }

    // Google Places Text Search API
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;
    
    console.log('=== SERVER-SIDE GOOGLE PLACES API CALL ===');
    console.log('Query:', query);
    console.log('API URL:', searchUrl);

    const response = await fetch(searchUrl);
    const data = await response.json();

    console.log('Google API response status:', data.status);
    console.log('Google API response results count:', data.results?.length || 0);

    if (data.status !== 'OK') {
      // ZERO_RESULTS is not an error — just no matches
      if (data.status === 'ZERO_RESULTS') {
        return NextResponse.json({
          status: 'OK',
          results: []
        });
      }

      console.warn('Google API error:', data);
      return NextResponse.json(
        { 
          error: `Google Places API error: ${data.status}`,
          message: data.error_message || 'Unknown Google API error',
          details: data
        },
        { status: 400 }
      );
    }

    // Transform Google Places results to our format
    const results = data.results.map(place => ({
      place_id: place.place_id,
      name: place.name,
      address: place.formatted_address,
      phone: place.formatted_phone_number || '',
      website: place.website || '',
      rating: place.rating || 0,
      business_status: place.business_status,
      opening_hours: place.opening_hours,
      photos: place.photos,
      types: place.types,
      price_level: place.price_level,
      user_ratings_total: place.user_ratings_total
    }));

    console.log('Transformed results count:', results.length);

    return NextResponse.json({
      status: 'OK',
      results: results
    });

  } catch (error) {
    console.warn('=== SERVER-SIDE GOOGLE PLACES API WARNING ===');
    console.warn('Error:', error.message);

    return NextResponse.json(
      { 
        error: 'Failed to fetch Google Places data',
        message: error.message,
        details: error.stack
      },
      { status: 500 }
    );
  }
}
