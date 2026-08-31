import { NextResponse } from 'next/server';
import nspell from 'nspell';
import dict from 'dictionary-en';

const spell = nspell(dict);

const EXTRA_WORDS = [
  'osha', 'epa', 'cdc',
  'sanitization', 'sanitize', 'sanitizing', 'sanitized', 'sanitizer',
  'disinfectant', 'disinfectants', 'disinfect', 'disinfecting', 'disinfected',
  'restroom', 'restrooms',
  'restocking', 'restocked', 'restock',
  'walkthrough', 'walkthroughs',
  'deodorize', 'deodorizing', 'deodorized', 'deodorizer',
  'fogging', 'defogging',
  'biohazard', 'biohazardous',
  'move-in', 'move-in', 'move-out', 'move-outs',
  'show-ready', 'pre-listing', 'pre-listings',
  'move-in ready', 'move-in-ready',
  'high-traffic', 'high-trafficked',
  'post-construction', 'post-construction',
  'pre-handover', 'pre-handover',
  'multi-unit', 'multi-units',
  'pressure-wash', 'pressure-washing', 'pressure-washed',
  'realtors', 'realtor',
  'stucco', 'caulk', 'caulking',
  'hvac', 'epa-approved', 'hospital-grade',
  'background-checked', 'background-check',
  'no-obligation', 'no-strings',
  'fitness center', 'laundry room',
  'businessName', 'city'
];

EXTRA_WORDS.forEach(word => {
  spell.add(word);
  spell.add(word.toLowerCase());
});

const wordPattern = /\b[a-zA-Z][a-zA-Z'\-]*(?:['][a-zA-Z]+)?\b/g;
const placeholderPattern = /\{\w+\}/g;
const urlPattern = /https?:\/\/\S+/g;
const phonePattern = /\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/g;
const emailPattern = /\S+@\S+\.\S+/g;
const numberPattern = /\b\d[\d,]*\b/g;

export async function POST(request) {
  try {
    const { text, ignore = [] } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ misspellings: [] });
    }

    const ignored = new Set(ignore.map(w => w.toLowerCase()));

    const cleaned = text
      .replace(placeholderPattern, ' ')
      .replace(urlPattern, ' ')
      .replace(emailPattern, ' ')
      .replace(phonePattern, ' ')
      .replace(numberPattern, ' ');

    const matches = cleaned.match(wordPattern) || [];
    const seen = new Set();
    const misspellings = [];

    for (const word of matches) {
      const lower = word.toLowerCase();

      if (seen.has(lower)) continue;
      seen.add(lower);

      if (ignored.has(lower)) continue;
      if (lower.length <= 1) continue;
      if (lower.startsWith('//')) continue;

      if (!spell.correct(word) && !spell.correct(lower)) {
        const suggestions = spell.suggest(word).slice(0, 5);
        if (suggestions.length === 0) {
          const lowerSuggestions = spell.suggest(lower).slice(0, 5);
          misspellings.push({ word, suggestions: lowerSuggestions });
        } else {
          misspellings.push({ word, suggestions });
        }
      }
    }

    return NextResponse.json({ misspellings });
  } catch (error) {
    console.error('Spell check error:', error);
    return NextResponse.json({ misspellings: [] }, { status: 500 });
  }
}
