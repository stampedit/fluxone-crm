# FluxOne - Professional Cleaning Business Management System

A comprehensive business management system for cleaning service companies with real-time business search and lead generation capabilities.

## Features

- **Multi-Account System**: Secure account-based data separation
- **Real Business Search**: Google Places API integration for finding businesses anywhere
- **Lead Management**: Convert searched businesses into leads
- **Email Enrichment**: Hunter.io API integration for email finding
- **Client Management**: Track clients and cleaning contracts
- **Job Scheduling**: Manage cleaning jobs and schedules
- **Dashboard Analytics**: Real-time business metrics

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/stampedit/fluxone.git
cd fluxone
npm install
```

### 2. Environment Setup

Copy the environment template:

```bash
cp env.example .env.local
```

Add your Google API key to `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_api_key_here
```

### 3. Get Google Places API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "Places API" from the API library
4. Create credentials (API Key)
5. Add your API key to `.env.local`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Login

Use these credentials to access your system:
- **Email**: james@minorcleaning.com
- **Password**: password123

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY`: Your Google Places API key
4. Deploy

### Environment Variables

- `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY`: Required for business search
- `NEXT_PUBLIC_HUNTER_API_KEY`: Optional for email enrichment

## Usage

### Business Search

1. Navigate to the Leads page
2. Use the search bar to find businesses:
   - "cleaning companies Houston TX"
   - "dental offices Miami FL"
   - "restaurants Los Angeles CA"
3. Click "Add to Leads" to convert businesses to leads

### Adding Real Data

The system starts empty. Add your real:
- Clients and contracts
- Cleaning jobs and schedules
- Business leads from search results

## Tech Stack

- **Frontend**: Next.js 16, React, Tailwind CSS
- **APIs**: Google Places API, Hunter.io API
- **Deployment**: Vercel
- **Authentication**: Custom auth system

## Support

For issues or questions, create an issue on GitHub.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
