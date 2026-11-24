export type HomeLeague = {
  id: string;
  name: string;
  logo?: string | null;
  country?: string | null;
};

type CompetitionRecord = Record<string, any>;

const KNOWN_LEAGUE_NAMES: Readonly<Record<string, string>> = {
  "eng.1": "Premier League",
  "eng.2": "Championship",
  "eng.3": "English League One",
  "eng.4": "English League Two",
  "eng.5": "English National League",
  "esp.1": "La Liga",
  "esp.2": "La Liga 2",
  "ita.1": "Serie A",
  "ita.2": "Serie B",
  "ger.1": "Bundesliga",
  "ger.2": "2. Bundesliga",
  "fra.1": "Ligue 1",
  "fra.2": "Ligue 2",
  "ned.1": "Eredivisie",
  "ned.2": "Eerste Divisie",
  "por.1": "Primeira Liga",
  "sco.1": "Scottish Premiership",
  "sco.2": "Scottish Championship",
  "bel.1": "Belgian Pro League",
  "tur.1": "Turkish Super Lig",
  "gre.1": "Greek Super League",
  "aut.1": "Austrian Bundesliga",
  "den.1": "Danish Superliga",
  "nor.1": "Norwegian Eliteserien",
  "swe.1": "Swedish Allsvenskan",
  "irl.1": "Irish Premier Division",
  "rus.1": "Russian Premier League",
  "nga.1": "Nigeria Premier Football League",
  "rsa.1": "South African Premiership",
  "rsa.2": "South African First Division",
  "gha.1": "Ghanaian Premier League",
  "ken.1": "Kenyan Premier League",
  "uga.1": "Ugandan Premier League",
  "bra.1": "Brazilian Serie A",
  "bra.2": "Brazilian Serie B",
  "bra.3": "Brazilian Serie C",
  "arg.1": "Argentine Liga Profesional",
  "chi.1": "Chilean Primera Divisi\u00f3n",
  "col.1": "Colombian Primera A",
  "ecu.1": "Ecuadorian LigaPro",
  "uru.1": "Uruguayan Primera Divisi\u00f3n",
  "par.1": "Paraguayan Primera Divisi\u00f3n",
  "per.1": "Peruvian Liga 1",
  "bol.1": "Bolivian Liga Profesional",
  "ven.1": "Venezuelan Primera Divisi\u00f3n",
  "mex.1": "Liga MX",
  "mex.2": "Liga de Expansi\u00f3n MX",
  "usa.1": "Major League Soccer",
  "usa.usl.1": "USL Championship",
  "usa.usl.l1": "USL League One",
  "gua.1": "Guatemalan Liga Nacional",
  "ksa.1": "Saudi Pro League",
  "jpn.1": "Japanese J.League",
  "chn.1": "Chinese Super League",
  "ind.1": "Indian Super League",
  "tha.1": "Thai League 1",
  "mys.1": "Malaysian Super League",
  "idn.1": "Indonesian Super League",
  "sgp.1": "Singaporean Premier League",
  "aus.1": "Australian A-League Men",
  "uefa.champions": "UEFA Champions League",
  "uefa.europa": "UEFA Europa League",
  "uefa.europa.conf": "UEFA Conference League",
  "uefa.super_cup": "UEFA Super Cup",
  "uefa.champions_qual": "UEFA Champions League Qualifying",
  "uefa.europa_qual": "UEFA Europa League Qualifying",
  "uefa.europa.conf_qual": "UEFA Conference League Qualifying",
  "caf.champions": "CAF Champions League",
  "caf.confed": "CAF Confederation Cup",
  "conmebol.libertadores": "Copa Libertadores",
  "conmebol.sudamericana": "Copa Sudamericana",
  "conmebol.recopa": "Recopa Sudamericana",
  "concacaf.champions": "CONCACAF Champions Cup",
  "concacaf.leagues.cup": "Leagues Cup",
  "afc.champions": "AFC Champions League Elite",
  "afc.cup": "AFC Champions League Two",
  "eng.fa": "FA Cup",
  "eng.league_cup": "EFL Cup",
  "esp.copa_del_rey": "Copa del Rey",
  "ita.coppa_italia": "Coppa Italia",
  "ger.dfb_pokal": "DFB-Pokal",
  "fra.coupe_de_france": "Coupe de France",
  "bra.copa_do_brazil": "Copa do Brasil",
  "arg.copa": "Copa Argentina",
  "fifa.cwc": "FIFA Club World Cup",
  "fifa.intercontinental_cup": "FIFA Intercontinental Cup",
  "fifa.world": "FIFA World Cup",
  "fifa.worldq": "FIFA World Cup Qualifiers",
  "fifa.worldq.uefa": "World Cup Qualifiers - UEFA",
  "fifa.worldq.caf": "World Cup Qualifiers - CAF",
  "fifa.worldq.afc": "World Cup Qualifiers - AFC",
  "fifa.worldq.concacaf": "World Cup Qualifiers - CONCACAF",
  "fifa.worldq.conmebol": "World Cup Qualifiers - CONMEBOL",
  "fifa.wwc": "FIFA Women's World Cup",
  "fifa.olympics": "Men's Olympic Soccer Tournament",
  "caf.nations": "Africa Cup of Nations",
  "caf.nations_qual": "Africa Cup of Nations Qualifiers",
  "uefa.euro": "UEFA European Championship",
  "uefa.euroq": "UEFA European Championship Qualifiers",
  "uefa.nations": "UEFA Nations League",
  "uefa.weuro": "UEFA Women's European Championship",
  "conmebol.america": "Copa America",
  "concacaf.gold": "CONCACAF Gold Cup",
  "concacaf.nations.league": "CONCACAF Nations League",
  "concacaf.w.gold": "CONCACAF W Gold Cup",
  "afc.asian.cup": "AFC Asian Cup",
  "usa.nwsl": "National Women's Soccer League",
  "eng.w.1": "Women's Super League",
  "uefa.wchampions": "UEFA Women's Champions League",
};

const SHORT_NAME_ALIASES: Readonly<Record<string, string>> = {
  EPL: 'Premier League',
  PL: 'Premier League',
  UCL: 'UEFA Champions League',
  CL: 'UEFA Champions League',
  UEL: 'UEFA Europa League',
  UECL: 'UEFA Conference League',
  MLS: 'Major League Soccer',
  AFCON: 'Africa Cup of Nations',
  NPFL: 'Nigeria Premier Football League',
  NWSL: "National Women's Soccer League",
  WSL: "Women's Super League",
  UWCL: "UEFA Women's Champions League",
  ACL: 'AFC Champions League Elite',
  EFL: 'English Football League',
};

export const normalizeLeagueId = (value: unknown): string =>
  String(value ?? '').trim().toLowerCase();

export function createCompetitionLookup(
  competitions: CompetitionRecord[],
): Map<string, CompetitionRecord> {
  const lookup = new Map<string, CompetitionRecord>();

  for (const competition of competitions) {
    const identifiers = [
      competition?.espnLeagueSlug,
      competition?.leagueId,
      competition?.competitionId,
      competition?.slug,
      competition?.id,
      competition?.espnId,
    ];

    for (const identifier of identifiers) {
      const key = normalizeLeagueId(identifier);
      if (key && !lookup.has(key)) lookup.set(key, competition);
    }
  }

  return lookup;
}

export function findCompetition(
  lookup: Map<string, CompetitionRecord>,
  ...identifiers: unknown[]
): CompetitionRecord | undefined {
  for (const identifier of identifiers) {
    const key = normalizeLeagueId(identifier);
    const match = key ? lookup.get(key) : undefined;
    if (match) return match;
  }

  return undefined;
}

export function leagueFilterId(
  sourceId: unknown,
  competition?: CompetitionRecord | null,
): string {
  return normalizeLeagueId(
    competition?.espnLeagueSlug ??
    competition?.leagueId ??
    competition?.competitionId ??
    competition?.id ??
    sourceId,
  );
}

function cleanName(value: unknown): string {
  if (typeof value !== 'string' && typeof value !== 'number') return '';

  return String(value)
    .replace(/\b(?:19|20)\d{2}(?:\s*[-/–—]\s*(?:(?:19|20)?\d{2}))?\b/gi, ' ')
    .replace(/\bseason\b/gi, ' ')
    .replace(/^[\s|,:;–—-]+|[\s|,:;–—-]+$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function isIdentifierOrAbbreviation(value: string): boolean {
  return (
    /^[a-z0-9]+(?:[._][a-z0-9]+)+$/i.test(value) ||
    /^[A-Z0-9][A-Z0-9 .&_-]{1,14}$/.test(value)
  );
}

export function resolveLeagueName(
  leagueId: unknown,
  candidates: unknown[],
): string {
  const canonicalId = normalizeLeagueId(leagueId);
  const knownName = KNOWN_LEAGUE_NAMES[canonicalId];

  for (const candidate of candidates) {
    const value = cleanName(candidate);
    if (!value) continue;

    const alias = SHORT_NAME_ALIASES[value.toUpperCase()];
    if (alias) return alias;

    if (isIdentifierOrAbbreviation(value)) continue;
    if (canonicalId && normalizeLeagueId(value) === canonicalId) continue;

    return value;
  }

  return knownName ?? 'League';
}

function logoFrom(value: any, depth = 0, visited = new Set<object>()): string | null {
  if (depth > 7 || value === null || value === undefined) return null;

  if (typeof value === 'string') {
    const candidate = value.trim().replace(/^http:\/\//i, 'https://');
    if (candidate.startsWith('//')) return `https:${candidate}`;
    return /^(https?:\/\/|\/|data:image\/)/i.test(candidate) ? candidate : null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = logoFrom(item, depth + 1, visited);
      if (found) return found;
    }
    return null;
  }

  if (typeof value !== 'object' || visited.has(value)) return null;
  visited.add(value);

  const record = value as Record<string, any>;
  for (const key of [
    'href',
    'url',
    'src',
    'imageUrl',
    'logoUrl',
    'default',
    'transparent',
    'light',
    'dark',
  ]) {
    const found = logoFrom(record[key], depth + 1, visited);
    if (found) return found;
  }

  for (const key of [
    'logo',
    'logos',
    'crest',
    'badge',
    'emblem',
    'image',
    'images',
    'icon',
    'league',
    'competition',
    'payload',
    'data',
  ]) {
    const found = logoFrom(record[key], depth + 1, visited);
    if (found) return found;
  }

  return null;
}

export function resolveLeagueLogo(...candidates: unknown[]): string | null {
  for (const candidate of candidates) {
    const logo = logoFrom(candidate);
    if (logo) return logo;
  }
  return null;
}

