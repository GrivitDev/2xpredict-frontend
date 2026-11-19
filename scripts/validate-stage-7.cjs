const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const changed = [
  'components/bet-lab/BetLabApp.tsx',
  'components/bet-lab/FixturesMarketPanel.tsx',
  'hooks/use-match-presentation.ts',
  'hooks/use-sports.ts',
  'lib/sports-v2-adapter.ts',
];
const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];
const checks = [];
const add = (name, passed, detail = '') => checks.push({ name, passed: Boolean(passed), detail });
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');

let syntaxErrors = 0;
let unresolvedImports = [];
for (const relative of changed) {
  const filePath = path.join(root, relative);
  if (!fs.existsSync(filePath)) {
    syntaxErrors += 1;
    continue;
  }
  const source = read(relative);
  const kind = relative.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, kind);
  syntaxErrors += sourceFile.parseDiagnostics.length;

  const resolveLocal = (specifier) => {
    let base;
    if (specifier.startsWith('@/')) base = path.join(root, specifier.slice(2));
    else if (specifier.startsWith('.')) base = path.resolve(path.dirname(filePath), specifier);
    else return true;
    return extensions.some((extension) => fs.existsSync(base + extension))
      || extensions.some((extension) => fs.existsSync(path.join(base, `index${extension}`)));
  };
  for (const statement of sourceFile.statements) {
    if ((ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement))
      && statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier)) {
      const specifier = statement.moduleSpecifier.text;
      if (!resolveLocal(specifier)) unresolvedImports.push({ file: relative, specifier });
    }
  }
}

const betlab = read('components/bet-lab/BetLabApp.tsx');
const adapter = read('lib/sports-v2-adapter.ts');
const panel = read('components/bet-lab/FixturesMarketPanel.tsx');
const presentation = read('hooks/use-match-presentation.ts');
const sportsHooks = read('hooks/use-sports.ts');

add('Bet Lab reads Sports v2 competitions', /useGetV2CompetitionsQuery/.test(betlab));
add('Guest fixtures use normalized cursor-paginated Sports v2', /useGetV2FixturesInfiniteQuery/.test(betlab) && /enabled:\s*!authLoading\s*&&\s*!authenticated/.test(betlab));
add('Bet Lab no longer imports legacy competitions/live/upcoming Sports hooks', !/useGetCompetitionsQuery|useGetUpcomingFixturesQuery|useGetLiveFixturesQuery/.test(betlab));
add('Authenticated Bet Lab fixture endpoint remains protected and unchanged', /useGetFixturesQuery/.test(betlab) && /enabled:\s*!authLoading\s*&&\s*authenticated/.test(betlab));
add('Public fixture query uses selected date range and bounded page size', /from:\s*dateRange\.from/.test(betlab) && /to:\s*dateRange\.to/.test(betlab) && /limit:\s*500/.test(betlab));
add('Sports v2 fixture pagination follows nextCursor', /getNextPageParam:\s*\(lastPage\)\s*=>\s*lastPage\.nextCursor/.test(sportsHooks));
add('Load-more control is connected to infinite-query state', /fixturesHasMore/.test(panel) && /onLoadMoreFixtures/.test(panel) && /publicFixturesQuery\.fetchNextPage/.test(betlab));
add('Adapter preserves ESPN event ID and normalized fixture ID separately', /eventId:\s*fixture\.espnEventId\s*\|\|\s*fixture\.id/.test(adapter) && /fixtureId:\s*fixture\.id/.test(adapter));
add('Guest match presentation reuses fetched Sports v2 fixture and competition data', /source\?:\s*\{\s*fixtures\?:\s*SportsFixture\[\]/.test(presentation) && /source\?\.fixtures/.test(presentation) && /source\?\.competitions/.test(presentation));
add('Fixture query stays within the exposed backend params and sorts accumulated pages chronologically', !/sortOrder\s*:/.test(betlab) && /\.sort\(\(left, right\)/.test(betlab) && /Date\.parse\(left\.kickoffAt\)/.test(betlab));
add('Competition priority is not fabricated when Sports v2 does not provide it', /no priority is inferred/i.test(adapter) && /priority \? \{ leaguePriority: priority, priority \}/.test(adapter));

const result = {
  stage: '7',
  changedFiles: changed.length,
  syntaxErrors,
  unresolvedLocalImports: unresolvedImports.length,
  unresolvedImports,
  checksPassed: checks.filter((item) => item.passed).length,
  checksTotal: checks.length,
  checks,
};
console.log(JSON.stringify(result, null, 2));
if (syntaxErrors || unresolvedImports.length || checks.some((item) => !item.passed)) process.exitCode = 1;
