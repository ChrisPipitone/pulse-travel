const COUNTRY_CODES: Record<string, string> = {
  // Europe
  italy: 'IT', rome: 'IT', milan: 'IT', florence: 'IT', venice: 'IT',
  france: 'FR', paris: 'FR', nice: 'FR',
  spain: 'ES', barcelona: 'ES', madrid: 'ES', seville: 'ES', ibiza: 'ES',
  portugal: 'PT', lisbon: 'PT',
  greece: 'GR', athens: 'GR', santorini: 'GR', mykonos: 'GR',
  germany: 'DE', berlin: 'DE', munich: 'DE',
  netherlands: 'NL', amsterdam: 'NL',
  uk: 'GB', england: 'GB', london: 'GB', scotland: 'GB', wales: 'GB',
  ireland: 'IE', dublin: 'IE',
  switzerland: 'CH', zurich: 'CH', geneva: 'CH',
  austria: 'AT', vienna: 'AT',
  belgium: 'BE', brussels: 'BE',
  sweden: 'SE', stockholm: 'SE',
  norway: 'NO', oslo: 'NO',
  denmark: 'DK', copenhagen: 'DK',
  finland: 'FI', helsinki: 'FI',
  iceland: 'IS', reykjavik: 'IS',
  poland: 'PL', warsaw: 'PL', krakow: 'PL',
  croatia: 'HR', dubrovnik: 'HR',
  hungary: 'HU', budapest: 'HU',
  czechia: 'CZ', 'czech republic': 'CZ', prague: 'CZ',
  turkey: 'TR', istanbul: 'TR',
  // Asia
  japan: 'JP', tokyo: 'JP', kyoto: 'JP', osaka: 'JP',
  'south korea': 'KR', korea: 'KR', seoul: 'KR',
  china: 'CN', beijing: 'CN', shanghai: 'CN',
  taiwan: 'TW', taipei: 'TW',
  thailand: 'TH', bangkok: 'TH', phuket: 'TH', chiang: 'TH',
  vietnam: 'VN', hanoi: 'VN', 'ho chi minh': 'VN', hoi: 'VN',
  cambodia: 'KH', 'siem reap': 'KH',
  indonesia: 'ID', bali: 'ID', jakarta: 'ID',
  singapore: 'SG',
  malaysia: 'MY', 'kuala lumpur': 'MY',
  philippines: 'PH', manila: 'PH', cebu: 'PH',
  india: 'IN', delhi: 'IN', mumbai: 'IN', goa: 'IN',
  nepal: 'NP', kathmandu: 'NP',
  // Middle East / Africa
  uae: 'AE', dubai: 'AE', 'abu dhabi': 'AE',
  morocco: 'MA', marrakech: 'MA',
  egypt: 'EG', cairo: 'EG',
  kenya: 'KE', nairobi: 'KE',
  'south africa': 'ZA', 'cape town': 'ZA', johannesburg: 'ZA',
  // Americas
  usa: 'US', 'united states': 'US', 'new york': 'US', california: 'US',
  'los angeles': 'US', miami: 'US', chicago: 'US', hawaii: 'US',
  canada: 'CA', toronto: 'CA', vancouver: 'CA', montreal: 'CA',
  mexico: 'MX', cancun: 'MX', 'mexico city': 'MX',
  brazil: 'BR', 'rio de janeiro': 'BR', 'sao paulo': 'BR',
  argentina: 'AR', 'buenos aires': 'AR',
  peru: 'PE', lima: 'PE', cusco: 'PE',
  colombia: 'CO', bogota: 'CO',
  chile: 'CL', santiago: 'CL',
  // Oceania
  australia: 'AU', sydney: 'AU', melbourne: 'AU',
  'new zealand': 'NZ', auckland: 'NZ',
};

function countryCodeToFlag(cc: string): string {
  return [...cc.toUpperCase()]
    .map((c) => String.fromCodePoint(c.charCodeAt(0) - 65 + 0x1f1e6))
    .join('');
}

export function destinationEmoji(destination: string | null | undefined): string {
  if (!destination) return '✈️';
  const lower = destination.toLowerCase();
  for (const [key, cc] of Object.entries(COUNTRY_CODES)) {
    if (lower.includes(key)) return countryCodeToFlag(cc);
  }
  return '✈️';
}
