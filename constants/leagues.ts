export const LEAGUE_NAMES: Record<string, string> = {
  // England
  PL: 'Premier League',
  ELC: 'EFL Championship',
  EL1: 'EFL League One',
  EL2: 'EFL League Two',

  // Spain
  PD: 'La Liga',
  SD: 'La Liga 2',

  // Germany
  BL1: 'Bundesliga',
  BL2: '2. Bundesliga',

  // Italy
  SA: 'Serie A',
  SB: 'Serie B',

  // France
  FL1: 'Ligue 1',
  FL2: 'Ligue 2',

  // Netherlands
  DED: 'Eredivisie',

  // Portugal
  PPL: 'Primeira Liga',

  // Belgium
  BSA: 'Belgian Pro League',

  // Scotland
  SPL: 'Scottish Premiership',

  // Turkey
  TSL: 'Süper Lig',

  // Greece
  GSL: 'Greek Super League',

  // Austria
  BUN: 'Austrian Bundesliga',

  // Switzerland
  SUI: 'Swiss Super League',

  // Denmark
  DSL: 'Danish Superliga',

  // Norway
  ENS: 'Eliteserien',

  // Sweden
  ALL: 'Allsvenskan',

  // Poland
  EKS: 'Ekstraklasa',

  // Czech Republic
  CFL: 'Czech First League',

  // Romania
  LIG1: 'Liga I',

  // Croatia
  HNL: 'Hrvatska Nogometna Liga',

  // Serbia
  SLS: 'Serbian SuperLiga',

  // Ukraine
  UPL: 'Ukrainian Premier League',

  // Saudi Arabia
  SPLSA: 'Saudi Pro League',

  // United Arab Emirates
  UAEPL: 'UAE Pro League',

  // Qatar
  QSL: 'Qatar Stars League',

  // Egypt
  EPLEG: 'Egyptian Premier League',

  // South Africa
  PSL: 'Premier Soccer League',

  // Morocco
  BOTOLA: 'Botola Pro',

  // Algeria
  ALG1: 'Algerian Ligue Professionnelle 1',

  // Tunisia
  TUN1: 'Tunisian Ligue Professionnelle 1',

  // Nigeria
  NPFL: 'Nigeria Premier Football League',

  // USA
  MLS: 'Major League Soccer',

  // Mexico
  LMX: 'Liga MX',

  // Argentina
  LPF: 'Liga Profesional Argentina',

  // Brazil
  BSAA: 'Campeonato Brasileiro Série A',
  BSB: 'Campeonato Brasileiro Série B',

  // Colombia
  COLA: 'Categoría Primera A',

  // Chile
  CHI1: 'Chilean Primera División',

  // Uruguay
  UYPD: 'Uruguayan Primera División',

  // Peru
  PER1: 'Peruvian Primera División',

  // Japan
  J1: 'J1 League',

  // South Korea
  KL1: 'K League 1',

  // China
  CSL: 'Chinese Super League',

  // Australia
  AL: 'A-League',

  // International
  CL: 'UEFA Champions League',
  EL: 'UEFA Europa League',
  ECL: 'UEFA Europa Conference League',
  SC: 'UEFA Super Cup',

  // National Teams
  WC: 'FIFA World Cup',
  EC: 'UEFA European Championship',
  UNL: 'UEFA Nations League',

  // Africa
  AFCON: 'Africa Cup of Nations',
  CAFCL: 'CAF Champions League',
  CAFCC: 'CAF Confederation Cup',

  // South America
  LIB: 'Copa Libertadores',
  SUD: 'Copa Sudamericana',

  // North America
  CCL: 'CONCACAF Champions Cup',

  // Clubs
  CWC: 'FIFA Club World Cup',
};

export type LeagueCatalogItem = {
  code: string;
  name: string;
  country: string;
  emblem?: string;
};

export const LEAGUE_COUNTRIES: Record<string, string> = {
  PL: 'England',
  ELC: 'England',
  EL1: 'England',
  EL2: 'England',

  PD: 'Spain',
  SD: 'Spain',

  BL1: 'Germany',
  BL2: 'Germany',

  SA: 'Italy',
  SB: 'Italy',

  FL1: 'France',
  FL2: 'France',

  DED: 'Netherlands',
  PPL: 'Portugal',
  BSA: 'Belgium',
  SPL: 'Scotland',
  TSL: 'Turkey',
  GSL: 'Greece',
  BUN: 'Austria',
  SUI: 'Switzerland',
  DSL: 'Denmark',
  ENS: 'Norway',
  ALL: 'Sweden',
  EKS: 'Poland',
  CFL: 'Czech Republic',
  LIG1: 'Romania',
  HNL: 'Croatia',
  SLS: 'Serbia',
  UPL: 'Ukraine',

  SPLSA: 'Saudi Arabia',
  UAEPL: 'United Arab Emirates',
  QSL: 'Qatar',
  EPLEG: 'Egypt',
  PSL: 'South Africa',
  BOTOLA: 'Morocco',
  ALG1: 'Algeria',
  TUN1: 'Tunisia',
  NPFL: 'Nigeria',

  MLS: 'United States',
  LMX: 'Mexico',
  LPF: 'Argentina',
  BSAA: 'Brazil',
  BSB: 'Brazil',
  COLA: 'Colombia',
  CHI1: 'Chile',
  UYPD: 'Uruguay',
  PER1: 'Peru',

  J1: 'Japan',
  KL1: 'South Korea',
  CSL: 'China',
  AL: 'Australia',

  CL: 'Europe',
  EL: 'Europe',
  ECL: 'Europe',
  SC: 'Europe',

  WC: 'International',
  EC: 'Europe',
  UNL: 'Europe',

  AFCON: 'Africa',
  CAFCL: 'Africa',
  CAFCC: 'Africa',

  LIB: 'South America',
  SUD: 'South America',
  CCL: 'North America',
  CWC: 'International',
};

export const LEAGUE_CATALOG: LeagueCatalogItem[] =
  Object.entries(LEAGUE_NAMES).map(
    ([code, name]) => ({
      code,
      name,
      country:
        LEAGUE_COUNTRIES[code] || 'International',
    }),
  );

export const getLeague = (
  code?: string,
): LeagueCatalogItem | undefined => {
  if (!code) {
    return undefined;
  }

  return LEAGUE_CATALOG.find(
    (league) => league.code === code,
  );
};

export const getLeagueName = (
  code?: string,
): string => {
  if (!code) return '-';

  return LEAGUE_NAMES[code] ?? code;
};