import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const website = searchParams.get('website');

    if (!website) {
      return NextResponse.json({ error: 'Website parameter is required' }, { status: 400 });
    }

    let url = website;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    console.log('Scraping emails from:', url);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    let response;
    try {
      response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        redirect: 'follow',
      });
    } catch (fetchError) {
      // Try http fallback
      try {
        url = url.replace('https://', 'http://');
        response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html',
          },
          redirect: 'follow',
        });
      } catch (e) {
        clearTimeout(timeout);
        return NextResponse.json({ emails: [], error: 'Could not fetch website' });
      }
    }
    clearTimeout(timeout);

    if (!response || !response.ok) {
      return NextResponse.json({ emails: [], error: `HTTP ${response?.status || 'unknown'}` });
    }

    const html = await response.text();

    // Extract emails using regex - exclude common false positives
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const rawEmails = html.match(emailRegex) || [];

    // Filter out junk emails
    const excludePatterns = [
      'sentry', 'wixpress', 'example.com', 'domain.com', 'yourdomain',
      'email.com', 'test.com', 'sample.org', 'noreply', 'no-reply',
      '.png', '.jpg', '.gif', '.webp', '.svg', '.css', '.js',
      'sentry.io', 'googletagmanager', 'google-analytics', 'facebook.com',
      'schema.org', 'w3.org', 'data:', 'blob:',
    ];

    const cleanEmails = [...new Set(rawEmails)]
      .map(e => e.toLowerCase().trim())
      .filter(e => {
        // Must have a valid TLD
        if (!e.match(/\.[a-z]{2,}$/)) return false;
        // Exclude image files and tracking pixels
        if (e.match(/\.(png|jpg|gif|webp|svg|css|js)$/)) return false;
        // Exclude known non-contact patterns
        if (excludePatterns.some(p => e.includes(p))) return false;
        // Exclude emails that are too long (likely encoded)
        if (e.length > 80) return false;
        return true;
      });

    // Also check for mailto: links which are more reliable
    const mailtoRegex = /mailto:([^"'?\s>]+)/gi;
    const mailtoEmails = [];
    let match;
    while ((match = mailtoRegex.exec(html)) !== null) {
      const email = match[1].toLowerCase().trim();
      if (email.match(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/)) {
        mailtoEmails.push(email);
      }
    }

    // Combine and deduplicate, prioritizing mailto emails
    const allEmails = [...new Set([...mailtoEmails, ...cleanEmails])];

    // Also look for contact page link
    const contactLinkMatch = html.match(/href=["']([^"']*contact[^"']*)["']/i);
    const aboutLinkMatch = html.match(/href=["']([^"']*about[^"']*)["']/i);

    let contactPageEmails = [];
    if (contactLinkMatch && allEmails.length === 0) {
      // Try to fetch contact page
      try {
        let contactUrl = contactLinkMatch[1];
        if (contactUrl.startsWith('/')) {
          const baseUrl = new URL(url);
          contactUrl = baseUrl.origin + contactUrl;
        } else if (!contactUrl.startsWith('http')) {
          const baseUrl = new URL(url);
          contactUrl = baseUrl.origin + '/' + contactUrl;
        }

        const contactResp = await fetch(contactUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          signal: AbortSignal.timeout(8000),
        });

        if (contactResp.ok) {
          const contactHtml = await contactResp.text();
          const contactEmails = contactHtml.match(emailRegex) || [];
          const contactMailto = [];
          let m;
          const mr = /mailto:([^"'?\s>]+)/gi;
          while ((m = mr.exec(contactHtml)) !== null) {
            contactMailto.push(m[1].toLowerCase().trim());
          }
          contactPageEmails = [...new Set([...contactMailto, ...contactEmails])]
            .map(e => e.toLowerCase().trim())
            .filter(e => {
              if (!e.match(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/)) return false;
              if (e.match(/\.(png|jpg|gif|webp|svg|css|js)$/)) return false;
              if (excludePatterns.some(p => e.includes(p))) return false;
              return true;
            });
        }
      } catch (e) {
        // Contact page fetch failed, continue
      }
    }

    const finalEmails = [...new Set([...allEmails, ...contactPageEmails])];

    console.log(`Found ${finalEmails.length} emails from ${url}:`, finalEmails);

    return NextResponse.json({
      emails: finalEmails,
      source: 'website_scrape',
    });
  } catch (error) {
    console.error('Email scrape error:', error);
    return NextResponse.json({ emails: [], error: error.message });
  }
}
