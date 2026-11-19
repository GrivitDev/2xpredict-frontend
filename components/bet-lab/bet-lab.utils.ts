import {
  asRecord,
  firstValue,
  numeric,
  rowsFrom,
  text,
  type ApiRecord,
} from '@/lib/api-shapes';
import type { MatchPresentation } from '@/hooks/use-match-presentation';
import type { BetLabSelectionPricing } from './bet-lab-pricing';

export type TicketPick = {
  eventId: string;
  eventName: string;
  marketCode: string;
  marketName: string;
  selectionCode: string;
  selectionName: string;
  odds: number;
  pricing?: BetLabSelectionPricing;
};

export type LeagueGroup = {
  id: string;
  name: string;
  priority: string;
  country: string;
  logo: string | null;
  isOpen: boolean;
  fixtures: ApiRecord[];
};

export type CountryGroup = {
  key: string;
  name: string;
  leagues: LeagueGroup[];
  matchCount: number;
};

export enum CompetitionRegion {
  NIGERIA = 'NIGERIA',
  AFRICA = 'AFRICA',
  EUROPE = 'EUROPE',
  SOUTH_AMERICA = 'SOUTH_AMERICA',
  NORTH_AMERICA = 'NORTH_AMERICA',
  ASIA = 'ASIA',
  OCEANIA = 'OCEANIA',
  WORLD = 'WORLD',
}

export type RegionGroup = {
  key: string;
  code: CompetitionRegion | 'OTHER';
  name: string;
  leagues: LeagueGroup[];
  countries: CountryGroup[];
  matchCount: number;
};

export type MarketView = {
  code: string;
  name: string;
  category: string;
  selections: ApiRecord[];
  catalogOrder: number;
};

export const CATEGORY_LABELS: Record<string, string> = {
  MATCH_RESULT: 'Match results',
  GOALS: 'Goals',
  HALF_TIME: 'Half time',
  HANDICAP: 'Handicaps',
  CORNERS: 'Corners',
  CARDS: 'Cards',
  SPECIALS: 'Specials',
  STATISTICS: 'Statistics',
  PLAYER: 'Player markets',
};

const REGION_LABELS: Record<CompetitionRegion | 'OTHER', string> = {
  [CompetitionRegion.NIGERIA]: 'Nigeria',
  [CompetitionRegion.AFRICA]: 'Africa',
  [CompetitionRegion.EUROPE]: 'Europe',
  [CompetitionRegion.SOUTH_AMERICA]: 'South America',
  [CompetitionRegion.NORTH_AMERICA]: 'North America',
  [CompetitionRegion.ASIA]: 'Asia',
  [CompetitionRegion.OCEANIA]: 'Oceania',
  [CompetitionRegion.WORLD]: 'World',
  OTHER: 'Other competitions',
};

const COUNTRY_NAMES_BY_REGION: Record<Exclude<CompetitionRegion, CompetitionRegion.WORLD | CompetitionRegion.NIGERIA>, string[]> = {
  [CompetitionRegion.AFRICA]: [
    'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cameroon', 'Cabo Verde',
    'Central African Republic', 'Chad', 'Comoros', 'Democratic Republic of the Congo', 'Republic of the Congo',
    'Côte d’Ivoire', 'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea', 'Eswatini', 'Ethiopia', 'Gabon',
    'Gambia', 'Ghana', 'Guinea', 'Guinea-Bissau', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar',
    'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Rwanda',
    'São Tomé and Príncipe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia', 'South Africa',
    'South Sudan', 'Sudan', 'Tanzania', 'Togo', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe',
  ],
  [CompetitionRegion.EUROPE]: [
    'Albania', 'Andorra', 'Armenia', 'Austria', 'Azerbaijan', 'Belarus', 'Belgium',
    'Bosnia and Herzegovina', 'Bulgaria', 'Croatia', 'Cyprus', 'Czechia', 'Denmark', 'England',
    'Estonia', 'Faroe Islands', 'Finland', 'France', 'Georgia', 'Germany', 'Gibraltar', 'Greece',
    'Hungary', 'Iceland', 'Ireland', 'Israel', 'Italy', 'Kazakhstan', 'Kosovo', 'Latvia',
    'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malta', 'Moldova', 'Monaco', 'Montenegro',
    'Netherlands', 'North Macedonia', 'Northern Ireland', 'Norway', 'Poland', 'Portugal',
    'Romania', 'Russia', 'San Marino', 'Scotland', 'Serbia', 'Slovakia', 'Slovenia', 'Spain',
    'Sweden', 'Switzerland', 'Türkiye', 'Ukraine', 'Wales', 'United Kingdom',
  ],
  [CompetitionRegion.SOUTH_AMERICA]: [
    'Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'Guyana', 'Paraguay',
    'Peru', 'Suriname', 'Uruguay', 'Venezuela',
  ],
  [CompetitionRegion.NORTH_AMERICA]: [
    'Antigua and Barbuda', 'Aruba', 'Bahamas', 'Barbados', 'Belize', 'Bermuda', 'Canada',
    'Costa Rica', 'Cuba', 'Curaçao', 'Dominica', 'Dominican Republic', 'El Salvador', 'Grenada',
    'Guatemala', 'Haiti', 'Honduras', 'Jamaica', 'Mexico', 'Nicaragua', 'Panama', 'Puerto Rico',
    'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines',
    'Trinidad and Tobago', 'United States',
  ],
  [CompetitionRegion.ASIA]: [
    'Afghanistan', 'Bahrain', 'Bangladesh', 'Bhutan', 'Brunei', 'Cambodia', 'China', 'Chinese Taipei',
    'Hong Kong', 'India', 'Indonesia', 'Iran', 'Iraq', 'Japan', 'Jordan', 'Kuwait', 'Kyrgyzstan',
    'Laos', 'Lebanon', 'Macau', 'Malaysia', 'Maldives', 'Mongolia', 'Myanmar', 'Nepal', 'North Korea',
    'Oman', 'Pakistan', 'Palestine', 'Philippines', 'Qatar', 'Saudi Arabia', 'Singapore',
    'South Korea', 'Sri Lanka', 'Syria', 'Taiwan', 'Tajikistan', 'Thailand', 'Timor-Leste',
    'Turkmenistan', 'United Arab Emirates', 'Uzbekistan', 'Vietnam',
  ],
  [CompetitionRegion.OCEANIA]: [
    'Australia', 'Fiji', 'New Caledonia', 'New Zealand', 'Papua New Guinea', 'Samoa',
    'Solomon Islands', 'Tahiti', 'Tonga', 'Vanuatu',
  ],
};

function normalizeCountryKey(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

const COUNTRY_ALIASES: Record<string, string> = {
  'czech republic': 'Czechia',
  'ivory coast': 'Côte d’Ivoire',
  'cote divoire': 'Côte d’Ivoire',
  'cape verde': 'Cabo Verde',
  'dr congo': 'Democratic Republic of the Congo',
  'd r congo': 'Democratic Republic of the Congo',
  'congo dr': 'Democratic Republic of the Congo',
  'congo republic': 'Republic of the Congo',
  'republic of congo': 'Republic of the Congo',
  'congo brazzaville': 'Republic of the Congo',
  'congo kinshasa': 'Democratic Republic of the Congo',
  'swaziland': 'Eswatini',
  'turkey': 'Türkiye',
  'turkiye': 'Türkiye',
  'united states of america': 'United States',
  'usa': 'United States',
  'u s a': 'United States',
  'us': 'United States',
  'u s': 'United States',
  'eng': 'England',
  'sco': 'Scotland',
  'wal': 'Wales',
  'nir': 'Northern Ireland',
  'nga': 'Nigeria',
  'ng': 'Nigeria',
  'gbr': 'United Kingdom',
  'gb': 'United Kingdom',
  'uk': 'United Kingdom',
  'u k': 'United Kingdom',
  'uae': 'United Arab Emirates',
  'korea republic': 'South Korea',
  'republic of korea': 'South Korea',
  'korea south': 'South Korea',
  'korea dpr': 'North Korea',
  'korea north': 'North Korea',
  'south korea': 'South Korea',
  'north korea': 'North Korea',
  'republic of ireland': 'Ireland',
  'ireland republic': 'Ireland',
  'england': 'England',
  'scotland': 'Scotland',
  'wales': 'Wales',
  'northern ireland': 'Northern Ireland',
  'world': 'World',
  'international': 'World',
  'global': 'World',
};

const COUNTRY_REGION_LOOKUP = new Map<string, CompetitionRegion>();
for (const [region, countries] of Object.entries(COUNTRY_NAMES_BY_REGION)) {
  for (const country of countries) COUNTRY_REGION_LOOKUP.set(normalizeCountryKey(country), region as CompetitionRegion);
}
COUNTRY_REGION_LOOKUP.set('nigeria', CompetitionRegion.NIGERIA);

const COUNTRY_CANONICAL_LOOKUP = new Map<string, string>();
for (const countries of Object.values(COUNTRY_NAMES_BY_REGION)) {
  for (const country of countries) COUNTRY_CANONICAL_LOOKUP.set(normalizeCountryKey(country), country);
}
COUNTRY_CANONICAL_LOOKUP.set('nigeria', 'Nigeria');
for (const [alias, canonical] of Object.entries(COUNTRY_ALIASES)) {
  if (canonical !== 'World') COUNTRY_CANONICAL_LOOKUP.set(normalizeCountryKey(alias), canonical);
}

export const COMPETITION_REGION_ORDER: Array<CompetitionRegion | 'OTHER'> = [
  CompetitionRegion.NIGERIA,
  CompetitionRegion.AFRICA,
  CompetitionRegion.EUROPE,
  CompetitionRegion.SOUTH_AMERICA,
  CompetitionRegion.NORTH_AMERICA,
  CompetitionRegion.ASIA,
  CompetitionRegion.OCEANIA,
  CompetitionRegion.WORLD,
  'OTHER',
];

export function arrayFrom(data: unknown, keys: string[] = ['items', 'results', 'data']): ApiRecord[] {
  return rowsFrom(data, keys)
    .map((item) => asRecord(item))
    .filter((item): item is ApiRecord => Boolean(item));
}

export function eventIdOf(item: ApiRecord): string {
  return text(firstValue(item, ['eventId', 'fixtureId', 'event_id', 'id', '_id', 'uid']));
}

export function fixtureDateOf(item: ApiRecord): string {
  return text(firstValue(item, ['fixtureDate', 'matchDate', 'date', 'kickoff', 'startDate']));
}

export function fixtureLeagueIdOf(item: ApiRecord, presentation?: MatchPresentation): string {
  return text(firstValue(item, ['leagueId', 'competitionId']), text(presentation?.leagueId));
}


/** Resolve every usable provider logo URL. ESPN and several other providers
 * return logos as arrays or deeply nested image objects; retaining alternatives
 * lets the renderer try the next URL when a provider image is broken. */
export function logoUrlsOf(value: unknown, depth = 0, seen = new Set<unknown>()): string[] {
  if (depth > 8 || value === null || value === undefined || seen.has(value)) return [];
  if (typeof value === 'string') {
    const raw = value.trim();
    if (!raw) return [];
    const url = raw.startsWith('//')
      ? `https:${raw}`
      : raw.replace(/^http:\/\//i, 'https://');
    return [url];
  }

  if (typeof value !== 'object') return [];
  seen.add(value);

  if (Array.isArray(value)) {
    return [...new Set(value.flatMap((item) => logoUrlsOf(item, depth + 1, seen)))];
  }

  const item = asRecord(value);
  if (!item) return [];

  const urls: string[] = [];
  const directKeys = [
    'href', 'url', 'src', 'imageUrl', 'imageURL', 'logoUrl', 'logoURL',
    'default', 'original', 'light', 'dark',
  ];
  const nestedKeys = [
    'logo', 'logos', 'images', 'crest', 'emblem', 'badge', 'image',
    'teamLogo', 'teamLogos', 'displayLogo',
  ];

  for (const key of directKeys) {
    if (item[key] !== undefined && item[key] !== value) {
      urls.push(...logoUrlsOf(item[key], depth + 1, seen));
    }
  }
  for (const key of nestedKeys) {
    if (item[key] !== undefined && item[key] !== value) {
      urls.push(...logoUrlsOf(item[key], depth + 1, seen));
    }
  }

  return [...new Set(urls)];
}

export function logoUrlOf(value: unknown, depth = 0): string | null {
  return logoUrlsOf(value, depth)[0] ?? null;
}

/** Return all likely sources in priority order, not just the first provider field. */
export function fixtureTeamLogoSources(
  fixture: ApiRecord,
  side: 'home' | 'away',
  presentation?: MatchPresentation,
): string[] {
  const presented = side === 'home' ? presentation?.homeTeamLogo : presentation?.awayTeamLogo;
  const nested = firstValue(fixture, side === 'home'
    ? ['homeTeam', 'home', 'homeCompetitor', 'homeParticipant']
    : ['awayTeam', 'away', 'awayCompetitor', 'awayParticipant']);
  const direct = firstValue(fixture, side === 'home'
    ? ['homeTeamLogo', 'homeLogo', 'homeTeamLogos', 'homeBadge', 'homeImage']
    : ['awayTeamLogo', 'awayLogo', 'awayTeamLogos', 'awayBadge', 'awayImage']);

  // ESPN fixture payloads commonly nest team crests at
  // competitions[].competitors[].team.logos[].href.
  const competitions = rowsFrom(firstValue(fixture, ['competitions']), ['items', 'competitions']);
  const competitors = competitions.flatMap((competition) =>
    rowsFrom(firstValue(competition, ['competitors']), ['items', 'competitors']),
  );
  const expectedSide = side.toLowerCase();
  const sideCompetitors = competitors.filter((competitor) => {
    const homeAway = text(firstValue(competitor, ['homeAway', 'side', 'teamSide', 'designation']), '').toLowerCase();
    const sideFlag = side === 'home'
      ? competitor.isHome === true || competitor.home === true
      : competitor.isAway === true || competitor.away === true;
    return sideFlag || homeAway === expectedSide || homeAway === (side === 'home' ? 'h' : 'a');
  });
  const sideCompetitor = sideCompetitors[0]
    ?? (competitors.length >= 2 ? competitors[side === 'home' ? 0 : 1] : undefined);
  const competitorTeam = asRecord(firstValue(sideCompetitor ?? {}, ['team', 'competitor', 'participant'])) ?? sideCompetitor;

  return [...new Set([
    ...logoUrlsOf(presented),
    ...logoUrlsOf(nested),
    ...logoUrlsOf(firstValue(asRecord(nested) ?? {}, ['logo', 'logos', 'crest', 'badge', 'emblem', 'image', 'teamLogo'])),
    ...logoUrlsOf(direct),
    ...logoUrlsOf(firstValue(sideCompetitor ?? {}, ['logo', 'logos', 'crest', 'badge', 'emblem', 'image'])),
    ...logoUrlsOf(firstValue(competitorTeam ?? {}, ['logo', 'logos', 'crest', 'badge', 'emblem', 'image', 'teamLogo'])),
  ])];
}

export function fixtureLeagueLogoSources(
  fixture: ApiRecord,
  presentation?: MatchPresentation,
): string[] {
  const league = asRecord(firstValue(fixture, ['league', 'competition', 'competitionInfo', 'leagueInfo'])) ?? {};
  const competitions = rowsFrom(firstValue(fixture, ['competitions']), ['items', 'competitions']);
  const nestedLeague = competitions.map((competition) =>
    asRecord(firstValue(competition, ['league', 'competition'])) ?? competition,
  );

  return [...new Set(logoUrlsOf([
    presentation?.leagueLogo,
    firstValue(league, ['leagueLogo', 'logo', 'logos', 'crest', 'emblem', 'badge', 'image']),
    firstValue(fixture, ['leagueLogo', 'competitionLogo', 'leagueBadge']),
    nestedLeague.map((item) => firstValue(item, ['leagueLogo', 'logo', 'logos', 'crest', 'emblem', 'badge', 'image'])),
  ]))];
}

export function fixtureTeamLogo(
  fixture: ApiRecord,
  side: 'home' | 'away',
  presentation?: MatchPresentation,
): string | null {
  return fixtureTeamLogoSources(fixture, side, presentation)[0] ?? null;
}

export function fixtureTeamName(item: ApiRecord, side: 'home' | 'away'): string {
  const nested = asRecord(firstValue(item, side === 'home'
    ? ['homeTeam', 'home', 'homeCompetitor']
    : ['awayTeam', 'away', 'awayCompetitor']));
  const directKeys = side === 'home'
    ? ['homeTeamName', 'homeName', 'home_team_name']
    : ['awayTeamName', 'awayName', 'away_team_name'];
  const competitions = rowsFrom(firstValue(item, ['competitions']), ['items', 'competitions']);
  const competitors = competitions.flatMap((competition) =>
    rowsFrom(firstValue(competition, ['competitors']), ['items', 'competitors']),
  );
  const competitor = competitors.find((candidate) => {
    const homeAway = text(firstValue(candidate, ['homeAway', 'side', 'teamSide', 'designation']), '').toLowerCase();
    const flag = side === 'home'
      ? candidate.isHome === true || candidate.home === true
      : candidate.isAway === true || candidate.away === true;
    return flag || homeAway === side || homeAway === (side === 'home' ? 'h' : 'a');
  }) ?? (competitors.length >= 2 ? competitors[side === 'home' ? 0 : 1] : undefined);
  const competitorTeam = asRecord(firstValue(competitor ?? {}, ['team', 'competitor', 'participant'])) ?? competitor;

  return text(
    firstValue(item, directKeys),
    text(firstValue(nested ?? {}, ['name', 'displayName', 'shortName']),
      text(firstValue(competitorTeam ?? {}, ['displayName', 'shortDisplayName', 'name', 'fullName', 'shortName']),
        side === 'home' ? 'Home' : 'Away')),
  );
}

export function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function localDayRange(dateKey: string): { from: string; to: string } {
  const [year, month, day] = dateKey.split('-').map(Number);
  const start = new Date(year, month - 1, day, 0, 0, 0, 0);
  const end = new Date(year, month - 1, day + 1, 0, 0, 0, 0);
  return { from: start.toISOString(), to: end.toISOString() };
}

export function shiftDate(dateKey: string, amount: number): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  return localDateKey(new Date(year, month - 1, day + amount, 12));
}

export function dateStepLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12);
  const today = localDateKey(new Date());
  const tomorrow = shiftDate(today, 1);
  if (dateKey === today) return 'Today';
  if (dateKey === tomorrow) return 'Tomorrow';
  const weekday = new Intl.DateTimeFormat('en-NG', { weekday: 'short' }).format(date);
  const suffix = day % 100 >= 11 && day % 100 <= 13
    ? 'th'
    : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[day % 10] ?? 'th';
  return `${day}${suffix} ${weekday}`;
}

export function fullDateLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Intl.DateTimeFormat('en-NG', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(year, month - 1, day, 12));
}

export function timeLabel(value: unknown): string {
  const date = new Date(String(value ?? ''));
  if (Number.isNaN(date.getTime())) return 'Time unavailable';
  return new Intl.DateTimeFormat('en-NG', { hour: '2-digit', minute: '2-digit' }).format(date);
}

export function regionLabel(value: unknown): string {
  const region = String(value ?? '').trim().toUpperCase();
  return REGION_LABELS[region as CompetitionRegion | 'OTHER'] ?? 'Other competitions';
}

function metadataName(value: unknown, keys: string[]): unknown {
  const record = asRecord(value);
  return record ? firstValue(record, keys) : value;
}

const NON_COUNTRY_METADATA = new Set([
  'world', 'international', 'global', 'other', 'other competitions', 'unknown',
  'europe', 'africa', 'asia', 'oceania', 'north america', 'south america',
  'uefa', 'caf', 'conmebol', 'concacaf', 'afc', 'ofc', 'fifa',
]);

const COUNTRY_CODE_ALIASES: Record<string, string> = {
  eng: 'England', sco: 'Scotland', wal: 'Wales', nir: 'Northern Ireland',
  nga: 'Nigeria', esp: 'Spain', fra: 'France', deu: 'Germany', ger: 'Germany',
  ita: 'Italy', nld: 'Netherlands', ned: 'Netherlands', prt: 'Portugal', por: 'Portugal',
  usa: 'United States', can: 'Canada', mex: 'Mexico', bra: 'Brazil', arg: 'Argentina',
  sau: 'Saudi Arabia', jpn: 'Japan', kor: 'South Korea', aus: 'Australia',
  nzl: 'New Zealand', gha: 'Ghana', egy: 'Egypt', zaf: 'South Africa',
  civ: 'Côte d’Ivoire', cmr: 'Cameroon', sen: 'Senegal', mar: 'Morocco',
};

export function countryNameOf(value: unknown): string | null {
  const rawCountry = metadataName(value, [
    'name', 'displayName', 'countryName', 'officialName', 'country',
    'isoName', 'isoCode', 'countryCode', 'country_code', 'iso', 'alpha2', 'alpha3', 'code', 'value',
  ]);
  const rawText = String(rawCountry ?? '').trim();
  const key = normalizeCountryKey(rawText);
  if (!key || NON_COUNTRY_METADATA.has(key)) return null;

  const alias = COUNTRY_ALIASES[key] ?? COUNTRY_CODE_ALIASES[key];
  if (alias === 'World') return null;
  const canonical = COUNTRY_CANONICAL_LOOKUP.get(normalizeCountryKey(alias ?? key));
  if (canonical) return canonical;
  if (/^[a-z]{3}$/i.test(rawText)) return alias ?? null;
  if (/^[a-z]{2}$/i.test(rawText)) {
    try {
      const displayName = new Intl.DisplayNames(['en'], { type: 'region' }).of(rawText.toUpperCase());
      if (displayName && displayName.toUpperCase() !== rawText.toUpperCase()) return displayName;
    } catch {
      // Older runtimes may not implement Intl.DisplayNames; preserve the payload label below.
    }
  }

  // Preserve a real country name supplied by the API even when it is not in
  // the legacy country lookup table. The payload, not a region enum, is the
  // source of the country label.
  return rawText;
}

export function resolveCompetitionRegion(regionValue: unknown, countryValue?: unknown): CompetitionRegion | 'OTHER' {
  // A real country always takes precedence over a broad region label.
  const countryName = countryNameOf(countryValue);
  if (countryName) return COUNTRY_REGION_LOOKUP.get(normalizeCountryKey(countryName)) ?? 'OTHER';

  const rawRegionValue = metadataName(regionValue, ['code', 'region', 'name', 'value']);
  const rawRegion = String(rawRegionValue ?? '').trim().toUpperCase().replace(/[\s-]+/g, '_');
  if (['WORLD', 'GLOBAL', 'INTERNATIONAL'].includes(rawRegion)) return CompetitionRegion.WORLD;
  if (rawRegion && rawRegion !== 'OTHER' && Object.prototype.hasOwnProperty.call(REGION_LABELS, rawRegion)) {
    return rawRegion as CompetitionRegion;
  }
  return 'OTHER';
}

export function countryOf(competition?: ApiRecord): string {
  if (!competition) return '';
  return countryNameOf(firstValue(competition, [
    'country', 'countryName', 'nation', 'nationName', 'area', 'areaName', 'countryInfo',
  ])) ?? '';
}

export function competitionKeys(competition: ApiRecord): string[] {
  return ['competitionId', 'espnLeagueSlug', 'leagueId', 'slug', 'id', 'uid', 'espnId', 'externalId', 'code']
    .map((key) => text(competition[key]).toLowerCase())
    .filter(Boolean);
}

export function resolveStatus(item: ApiRecord, presentation?: MatchPresentation): string {
  // Presentation status is already normalized from the fixture-feed read model.
  // Never infer lifecycle from kickoff time or from an embedded Summary.
  const presented = String(presentation?.status ?? item.presentationStatus ?? '').toUpperCase();
  if (presented && presented !== 'UNKNOWN') return presented;

  const raw = text(firstValue(item, [
    'presentationStatus', 'status', 'state', 'statusDetail', 'statusShortDetail',
  ])).toUpperCase();
  if (/POSTPON|\bPST\b|DELAYED/.test(raw)) return 'POSTPONED';
  if (/CANCEL|ABANDON|WALKOVER|NO_CONTEST/.test(raw)) return 'CANCELLED';
  if (/SUSPEND|INTERRUPT/.test(raw)) return 'SUSPENDED';
  if (item.completed === true || /FINISHED|FULL[_ ]?TIME|\bFT\b|\bFINAL\b|COMPLETED|AFTER[_ ]?EXTRA[_ ]?TIME/.test(raw)) return 'FINISHED';
  if (item.live === true || /LIVE|IN[_ ]?PROGRESS|IN[_ ]?PLAY|HALF[_ ]?TIME|FIRST[_ ]?HALF|SECOND[_ ]?HALF|EXTRA[_ ]?TIME/.test(raw)) return 'LIVE';
  if (/UPCOMING|SCHEDULED|NOT[_ ]?STARTED|PENDING|\bPRE(?:GAME)?\b/.test(raw)) return 'UPCOMING';
  return 'UNKNOWN';
}

export function isVisibleFixture(item: ApiRecord, presentation?: MatchPresentation): boolean {
  return ['UPCOMING', 'LIVE', 'IN_PLAY'].includes(resolveStatus(item, presentation));
}

export function statusLabel(status: string, presentation?: MatchPresentation): string {
  if (presentation?.statusLabel) return presentation.statusLabel;
  if (status === 'IN_PLAY') return 'In play';
  if (status === 'LIVE') return 'Live';
  if (status === 'UPCOMING') return 'Upcoming';
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function isCompetitionOpen(priority: string, plan: string): boolean {
  if (plan !== 'free') return true;
  return priority === 'REGIONAL' || priority === 'SELECTIVE';
}

export function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] ?? '').join('').toUpperCase() || 'FC';
}

export function marketCodeOf(market: ApiRecord): string {
  return text(firstValue(market, ['code', 'marketCode']));
}

export function marketNameOf(market: ApiRecord): string {
  return text(firstValue(market, ['fullName', 'marketName', 'name']), marketCodeOf(market) || 'Market');
}

export function marketShortLabel(market: ApiRecord): string {
  return text(firstValue(market, ['abbreviation', 'shortName', 'shortLabel']), marketNameOf(market));
}

function marketIdentity(market: ApiRecord): string {
  return `${marketCodeOf(market)} ${marketNameOf(market)} ${text(market.category)}`
    .toLowerCase()
    .replace(/[_-]/g, ' ');
}

export function isOverUnderMarket(market: ApiRecord): boolean {
  const identity = marketIdentity(market);
  if (/over.?under|total\s+(?:goals?|corners?|cards?|shots?|fouls?|offsides?|points?|runs?|sets?|games?)|goals?\s+over|goals?\s+under|goal total|total score|\btotals\b|\bou\b/.test(identity)) {
    return true;
  }

  // Some provider catalogues use generic market names (for example, "Team Total")
  // but expose the Over/Under sides in the selection catalogue itself.
  const sides = new Set(
    arrayFrom(market, ['selections'])
      .map((selection) => marketSelectionSide(selection))
      .filter((side): side is 'OVER' | 'UNDER' => Boolean(side)),
  );
  return sides.has('OVER') && sides.has('UNDER');
}

export function isAsianHandicapMarket(market: ApiRecord): boolean {
  return /asian\s*handicap|asian\s*spread|(^|\s)ah($|\s)/.test(marketIdentity(market));
}

export function isDoubleChanceMarket(market: ApiRecord): boolean {
  return /double chance|(^|\s)dc(\s|$)/.test(marketIdentity(market));
}

export function isBothTeamsToScoreMarket(market: ApiRecord): boolean {
  return /btts|both teams to score|both teams score/.test(marketIdentity(market));
}

export function isDrawNoBetMarket(market: ApiRecord): boolean {
  return /draw no bet|(^|\s)dnb($|\s)/.test(marketIdentity(market));
}

export function isThreeWayResultMarket(market: ApiRecord): boolean {
  return /1x2|match result|full time result|first half result|half time result|ht 1x2|first half 1x2|half time 1x2|three way|3 way|match winner|winner 90|moneyline|match outcome/.test(marketIdentity(market));
}

export function marketSelectionCode(selection: ApiRecord): string {
  return text(firstValue(selection, [
    'code', 'selectionCode', 'selectionKey', 'key', 'outcomeCode', 'id',
  ]));
}

export function marketSelectionName(selection: ApiRecord): string {
  return text(firstValue(selection, [
    'fullName', 'selectionName', 'name', 'outcomeName', 'abbreviation', 'shortName', 'label',
  ]), marketSelectionCode(selection) || 'Selection');
}


export function marketSelectionSide(selection: ApiRecord): 'OVER' | 'UNDER' | null {
  const identity = [
    marketSelectionCode(selection),
    marketSelectionName(selection),
    text(firstValue(selection, ['jsonVariable', 'side', 'outcome', 'type'])),
  ].join(' ').toLowerCase();
  if (/(^|\b)over(\b|_)/.test(identity)) return 'OVER';
  if (/(^|\b)under(\b|_)/.test(identity)) return 'UNDER';
  return null;
}

export function marketSelectionLine(selection: ApiRecord): string {
  const explicitLine = firstValue(selection, ['line', 'handicap', 'total', 'points', 'value']);
  if (explicitLine !== undefined && explicitLine !== null && String(explicitLine).trim()) {
    return String(explicitLine).trim();
  }

  const name = marketSelectionName(selection);
  const code = marketSelectionCode(selection);
  const match = name.match(/(?:over|under)\s*[:@-]?\s*(-?\d+(?:\.\d+)?)/i)
    ?? code.match(/(?:over|under)[_ -]?(-?\d+(?:[._]\d+)?)/i)
    ?? name.match(/(?:home|away|team\s*[12]|^[12])\s*[:@]?\s*([+-]\d+(?:\.\d+)?)/i)
    ?? name.match(/([+-]\d+(?:\.\d+)?)/);
  return match ? match[1].replace('_', '.') : name;
}

export function marketSelectionHandicapSide(selection: ApiRecord): '1' | '2' | null {
  if (selection.isHome === true || selection.home === true) return '1';
  if (selection.isAway === true || selection.away === true) return '2';

  const explicitSide = text(firstValue(selection, [
    'side', 'outcome', 'teamSide', 'selectionSide', 'participant', 'team', 'jsonVariable', 'type',
  ])).toLowerCase().replace(/[_-]+/g, ' ');

  if (/\b(home|home team|team 1)\b/.test(explicitSide)) return '1';
  if (/\b(away|away team|team 2)\b/.test(explicitSide)) return '2';
  if (/^(1|1st|home)$/.test(explicitSide.trim())) return '1';
  if (/^(2|2nd|away)$/.test(explicitSide.trim())) return '2';

  const code = marketSelectionCode(selection);
  const name = marketSelectionName(selection);
  const alternateLabels = text(firstValue(selection, [
    'abbreviation', 'shortName', 'shortLabel', 'label', 'selectionLabel', 'outcomeName', 'participantName', 'teamName',
  ]));
  const identity = `${code} ${name} ${alternateLabels}`.toLowerCase().replace(/[_-]+/g, ' ');

  if (/\b(home|home team|team 1)\b/.test(identity)) return '1';
  if (/\b(away|away team|team 2)\b/.test(identity)) return '2';

  // Common provider labels: "1", "1 (-0.5)", "2", and "2 (+0.5)".
  if (/(^|[\s:(])1(?=$|[\s:(+\-])/.test(identity)) return '1';
  if (/(^|[\s:(])2(?=$|[\s:(+\-])/.test(identity)) return '2';

  return null;
}

export function marketSelectionHeaderLabel(selection: ApiRecord, market: ApiRecord): string {
  if (isAsianHandicapMarket(market)) {
    return marketSelectionHandicapSide(selection) ?? '';
  }
  const code = marketSelectionCode(selection).toUpperCase().replace(/[_ -]/g, ' ');
  const name = marketSelectionName(selection).toLowerCase();

  if (isDoubleChanceMarket(market)) {
    const alternateLabels = text(firstValue(selection, [
      'abbreviation', 'shortName', 'shortLabel', 'label', 'selectionLabel',
      'outcomeName', 'participantName', 'teamName', 'selectionKey', 'key',
      'side', 'outcome', 'jsonVariable', 'type',
    ]));
    const identity = `${code} ${name} ${alternateLabels}`
      .toLowerCase()
      .replace(/[_/+-]+/g, ' ')
      .replace(/[()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const compact = identity.replace(/[^a-z0-9]/g, '');

    // Providers use several equivalent labels for Double Chance outcomes:
    // 1X / X1 / Home or Draw, 12 / Home or Away, and X2 / 2X / Draw or Away.
    if (compact.includes('1x') || compact.includes('x1') || /home.{0,24}draw|draw.{0,24}home/.test(identity)) return '1X';
    if (compact.includes('12') || /home.{0,24}away|away.{0,24}home|no draw/.test(identity)) return '12';
    if (compact.includes('x2') || compact.includes('2x') || /draw.{0,24}away|away.{0,24}draw/.test(identity)) return 'X2';

    // Do not create an extra column using an unrecognised provider label.
    // The row renderer omits selections that cannot be mapped unambiguously.
    return '';
  }

  if (isDrawNoBetMarket(market)) {
    return marketSelectionHandicapSide(selection) ?? '';
  }

  if (isThreeWayResultMarket(market)) {
    if (/^(HOME|HOME WIN|1)$/.test(code) || /home win|home team/.test(name)) return '1';
    if (/^(DRAW|TIE|X)$/.test(code) || /draw|tie/.test(name)) return 'X';
    if (/^(AWAY|AWAY WIN|2)$/.test(code) || /away win|away team/.test(name)) return '2';
  }

  if (isBothTeamsToScoreMarket(market)) {
    if (/^(YES|BTTS YES|GG)$/.test(code) || /\b(yes|gg)\b/.test(name)) return 'YES (GG)';
    if (/^(NO|BTTS NO|NG)$/.test(code) || /\b(no|ng)\b/.test(name)) return 'NO (NG)';
  }

  return text(firstValue(selection, ['abbreviation', 'shortName']), marketSelectionName(selection));
}

export function marketSelectionHeaders(market?: ApiRecord): string[] {
  if (!market) return [];
  if (isAsianHandicapMarket(market)) return ['1', '2'];
  if (isOverUnderMarket(market)) return ['Over', 'Under'];
  if (isDoubleChanceMarket(market)) return ['1X', '12', 'X2'];
  if (isDrawNoBetMarket(market)) return ['1', '2'];
  if (isThreeWayResultMarket(market)) return ['1', 'X', '2'];
  if (isBothTeamsToScoreMarket(market)) return ['YES (GG)', 'NO (NG)'];

  const selections = arrayFrom(market, ['selections']);
  const labels = selections.map((selection) => marketSelectionHeaderLabel(selection, market));
  return [...new Set(labels.filter(Boolean))];
}

export function marketOdds(selection: ApiRecord): number {
  return numeric(firstValue(selection, ['decimalOdds', 'odds', 'price']), 0);
}

export function ticketLegEventId(leg: ApiRecord): string {
  const fixture = asRecord(firstValue(leg, ['fixture', 'event', 'match']));
  return text(firstValue(leg, ['eventId', 'fixtureId', 'event_id']), text(firstValue(fixture ?? {}, ['eventId', 'id', '_id'])));
}

export function ticketLegFixtureDate(leg: ApiRecord): string {
  const fixture = asRecord(firstValue(leg, ['fixture', 'event', 'match']));
  return text(firstValue(leg, ['fixtureDate', 'matchDate', 'kickoff']), text(firstValue(fixture ?? {}, ['fixtureDate', 'date', 'kickoff'])));
}

export function transactionLabel(entry: ApiRecord): string {
  const existing = text(firstValue(entry, ['description', 'reason', 'title']));
  if (existing) return existing;

  const type = text(firstValue(entry, ['transactionType', 'type', 'bucket']), 'wallet').toLowerCase().replace(/_/g, ' ');
  const amount = Math.abs(numeric(firstValue(entry, ['delta', 'amount']), 0));
  const direction = numeric(firstValue(entry, ['delta', 'amount']), 0) >= 0 ? 'Received' : 'Used';
  if (/winn/.test(type)) return `${direction} ${amount.toLocaleString('en-NG')} points from winnings`;
  if (/bonus|welcome|monthly/.test(type)) return `${direction} ${amount.toLocaleString('en-NG')} points ${type}`;
  if (/stake|ticket/.test(type)) return `${direction} ${amount.toLocaleString('en-NG')} points for ticket activity`;
  return `${direction} ${amount.toLocaleString('en-NG')} points · ${type}`;
}

export function ticketStatusTone(status: string): string {
  const normalized = status.toUpperCase();
  if (['WON', 'PARTIALLY_WON'].includes(normalized)) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
  if (['LOST', 'PARTIALLY_LOST'].includes(normalized)) return 'bg-rose-500/10 text-rose-600 dark:text-rose-400';
  if (['VOID', 'PUSH', 'CANCELLED'].includes(normalized)) return 'bg-amber-500/10 text-amber-700 dark:text-amber-400';
  return 'bg-primary/10 text-primary';
}





