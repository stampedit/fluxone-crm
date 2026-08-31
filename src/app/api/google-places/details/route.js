import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('place_id');

    if (!placeId) {
      return NextResponse.json(
        { error: 'place_id parameter is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

    if (!apiKey || apiKey === 'your_google_api_key_here') {
      return NextResponse.json(
        { error: 'Google Places API key not configured' },
        { status: 500 }
      );
    }

    const fields = [
      'name',
      'formatted_address',
      'formatted_phone_number',
      'international_phone_number',
      'website',
      'rating',
      'user_ratings_total',
      'reviews',
      'opening_hours',
      'address_components',
      'business_status',
      'price_level',
      'types',
      'photos',
      'url',
      'utc_offset',
      'vicinity',
      'plus_code',
    ].join(',');

    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`;

    const response = await fetch(detailsUrl);
    const data = await response.json();

    if (data.status !== 'OK') {
      return NextResponse.json(
        { error: `Google Places Details API error: ${data.status}` },
        { status: 400 }
      );
    }

    const result = data.result;

    const addressComponents = result.address_components || [];
    const getComponent = (type) => {
      const comp = addressComponents.find(c => c.types.includes(type));
      return comp ? comp.long_name : '';
    };

    const reviews = (result.reviews || []).slice(0, 3).map(review => ({
      author: review.author_name,
      rating: review.rating,
      text: review.text,
      time: review.relative_time_description,
      profile_photo: review.profile_photo_url,
    }));

    const openingHours = result.opening_hours ? {
      isOpen: result.opening_hours.open_now,
      weekdayText: result.opening_hours.weekday_text || [],
      periods: result.opening_hours.periods || [],
    } : null;

    const enriched = {
      place_id: placeId,
      name: result.name,
      address: result.formatted_address,
      phone: result.formatted_phone_number || '',
      international_phone: result.international_phone_number || '',
      website: result.website || '',
      rating: result.rating || 0,
      rating_count: result.user_ratings_total || 0,
      business_status: result.business_status,
      price_level: result.price_level,
      types: result.types || [],
      street_number: getComponent('street_number'),
      street: getComponent('route'),
      city: getComponent('locality') || getComponent('sublocality'),
      state: getComponent('administrative_area_level_1'),
      state_short: getComponent('administrative_area_level_1'),
      zip: getComponent('postal_code'),
      country: getComponent('country'),
      county: getComponent('administrative_area_level_2'),
      neighborhood: getComponent('neighborhood'),
      opening_hours: openingHours,
      reviews: reviews,
      google_url: result.url,
      photos: (result.photos || []).slice(0, 3).map(p => p.photo_reference),
      vicinity: result.vicinity || '',
    };

    return NextResponse.json({ status: 'OK', result: enriched });
  } catch (error) {
    console.error('Google Places Details API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch place details', message: error.message },
      { status: 500 }
    );
  }
}
