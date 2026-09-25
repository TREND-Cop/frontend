/**
 * Location Formatter Utility
 *
 * Formats full addresses into concise "District/Area, State" strings
 * for header bars, cards, and previews while leaving the full address
 * intact in UserContext / database for GPS and Google Maps routing.
 */

export function formatDisplayLocation(raw: string | null | undefined): string {
  if (!raw || typeof raw !== 'string') return 'Maitama, Abuja';
  const trimmed = raw.trim();
  if (!trimmed) return 'Maitama, Abuja';

  let parts = trimmed
    .split(',')
    .map((p) => p.trim().replace(/\.+$/, ''))
    .filter(Boolean);

  // If country is at the end (e.g. 'Nigeria', 'Bahamas', etc.), omit from header display
  const knownCountries = [
    'nigeria',
    'ghana',
    'kenya',
    'bahamas',
    'united kingdom',
    'usa',
    'united states',
    'canada',
  ];
  if (parts.length > 2 && knownCountries.includes(parts[parts.length - 1].toLowerCase())) {
    parts.pop();
  }

  let state = parts[parts.length - 1] || 'Abuja';
  let district = parts.length > 1 ? parts[parts.length - 2] : parts[0];

  // Clean state: e.g. 'Abuja Federal Capital Territory' or 'F.C.T, Abuja' -> 'Abuja'
  if (/abuja\s+federal\s+capital\s+territory/i.test(state) || /f\.?c\.?t/i.test(state)) {
    state = 'Abuja';
  }

  // Clean district: if it repeats the state name (e.g. 'maitama Abuja')
  if (state && district.toLowerCase().includes(state.toLowerCase())) {
    district = district.replace(new RegExp('\\s*' + state, 'gi'), '').trim();
  }

  // If district segment contains street keywords and multiple words, pick the actual area name
  if (
    district.toLowerCase().includes('crescent') ||
    district.toLowerCase().includes('street') ||
    district.toLowerCase().includes('road') ||
    district.toLowerCase().includes('close')
  ) {
    const words = district.split(/\s+/);
    if (words.length > 2) {
      district = words[words.length - 1];
    }
  }

  const capitalize = (str: string) =>
    str
      .split(' ')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');

  const finalDistrict = capitalize(district) || 'Maitama';
  const finalState = capitalize(state) || 'Abuja';

  return `${finalDistrict}, ${finalState}`;
}
