import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');

  if (!domain) {
    return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_HUNTER_API_KEY || process.env.HUNTER_API_KEY;

  if (!apiKey || apiKey === 'your_hunter_api_key_here') {
    return NextResponse.json({ error: 'Hunter API key not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://api.hunter.io/v2/domain-search?domain=${domain}&api_key=${apiKey}&limit=10`,
      { headers: { Accept: 'application/json' } }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData?.errors?.[0]?.message || `Hunter.io API returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Hunter.io API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch from Hunter.io' },
      { status: 500 }
    );
  }
}
