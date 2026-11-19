const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const appRoot = path.join(root, 'app');
const changedFiles = [
  'app/(public)/matches/page.tsx',
  'app/(public)/dashboard/page.tsx',
  'app/(public)/subscriptions/page.tsx',
  'app/(public)/purchases/page.tsx',
  'app/(public)/bonuses/page.tsx',
  'components/account/AccountBillingPanel.tsx',
  'components/home-sections/fixtures/FixturesSection.tsx',
  'components/navbar/UniversalSearch.tsx',
  'hooks/use-bonuses.ts',
  'hooks/index.ts',
];

const checks = [];
function check(name, pass, detail = '') {
  checks.push({ name, pass: Boolean(pass), detail });
}
function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}
function collectFiles(dir, output = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === 'dist') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectFiles(full, output);
    else if (/\.(ts|tsx)$/.test(entry.name)) output.push(full);
  }
  return output;
}
function resolveLocalImport(fromFile, specifier) {
  let base;
  if (specifier.startsWith('@/')) base = path.join(root, specifier.slice(2));
  else if (specifier.startsWith('.')) base = path.resolve(path.dirname(fromFile), specifier);
  else return true;

  const candidates = [
    base,
    `${base}.ts`, `${base}.tsx`, `${base}.d.ts`, `${base}.js`, `${base}.jsx`,
    path.join(base, 'index.ts'), path.join(base, 'index.tsx'), path.join(base, 'index.d.ts'),
    path.join(base, 'index.js'), path.join(base, 'index.jsx'),
  ];
  return candidates.some((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
}

const files = collectFiles(root);
let syntaxErrors = [];
let unresolved = [];
let changedUnresolved = [];
const changedAbsolutePaths = new Set(changedFiles.map((file) => path.join(root, file)));
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const scriptKind = file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, scriptKind);
  for (const diagnostic of ast.parseDiagnostics) {
    const pos = ast.getLineAndCharacterOfPosition(diagnostic.start || 0);
    syntaxErrors.push(`${path.relative(root, file)}:${pos.line + 1}:${pos.character + 1} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ')}`);
  }

  function visit(node) {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      const specifier = node.moduleSpecifier.text;
      if ((specifier.startsWith('./') || specifier.startsWith('../') || specifier.startsWith('@/')) && !resolveLocalImport(file, specifier)) {
        const detail = `${path.relative(root, file)} -> ${specifier}`;
        unresolved.push(detail);
        if (changedAbsolutePaths.has(file)) changedUnresolved.push(detail);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
}

check('Full TypeScript/TSX source parses without syntax errors', syntaxErrors.length === 0, `${files.length} files scanned; ${syntaxErrors.length} syntax errors`);
check('All relative and @/ imports in changed files resolve', changedUnresolved.length === 0, `${changedUnresolved.length} unresolved imports in changed files`);
check('All Stage 9 source files exist', changedFiles.every((file) => fs.existsSync(path.join(root, file))), `${changedFiles.length} expected files`);

const hookIndex = read('hooks/index.ts');
check('Hooks barrel exports existing settlement and system monitor modules', hookIndex.includes("settlementHooks from './use-settlement-admin'") && hookIndex.includes("systemMonitorHooks from './use-monitoring'"));

const matchesPage = read('app/(public)/matches/page.tsx');
const fixturesSection = read('components/home-sections/fixtures/FixturesSection.tsx');
check('Public Matches route reuses normalized Sports v2 fixture section', matchesPage.includes('FixturesSection') && fixturesSection.includes('useGetV2FixturesQuery'));
check('Universal Search query is passed into the Matches fixture filter', matchesPage.includes('initialSearchQuery={query}') && fixturesSection.includes('normalizedSearch'));
check('Fixture rows link to normalized match detail routes', fixturesSection.includes('href={`/matches/${encodeURIComponent(fixture.id)}`}') && fs.existsSync(path.join(root, 'app/(public)/matches/[fixtureId]/page.tsx')));

const bonusPage = read('app/(public)/bonuses/page.tsx');
const bonusHook = read('hooks/use-bonuses.ts');
const bonusService = read('services/bonuses.service.ts');
check('Public Bonuses route uses the authenticated GET /bonuses/my hook', bonusPage.includes('useGetMyBonusesQuery') && bonusService.includes("path: '/bonuses/my'"));
check('Bonus query cache is scoped to the authenticated principal', bonusHook.includes("['bonuses', 'mine', principal") && bonusHook.includes('!loading && Boolean(user || token)'));
check('Bonus history displays paginated points and subscription grants', bonusPage.includes('BonusGrantPage') && bonusPage.includes('query.data?.pages') && bonusPage.includes('BET_LAB_POINTS'));
check('Bonus page handles guest, loading, empty and error states', ['Checking your account', 'Sign in to view your bonuses', 'No bonuses yet', 'could not be loaded'].every((text) => bonusPage.includes(text)));

const billing = read('components/account/AccountBillingPanel.tsx');
check('Billing section exposes an account-billing deep-link anchor', billing.includes('id="account-billing"') && billing.includes("window.location.hash !== '#account-billing'"));
check('Legacy dashboard, subscription and purchase destinations redirect to existing profile sections',
  read('app/(public)/dashboard/page.tsx').includes("redirect('/profile')") &&
  read('app/(public)/subscriptions/page.tsx').includes("redirect('/profile#account-billing')") &&
  read('app/(public)/purchases/page.tsx').includes("redirect('/profile#account-billing')"));

const search = read('components/navbar/UniversalSearch.tsx');
check('Universal Search uses the existing Terms of Use route', search.includes("'/terms-of-use'") && !search.includes("'/terms-and-conditions'"));
check('Universal Search no longer advertises known missing public pages',
  !['/about', '/ownership', '/security', '/advertising-policy', '/privacy-policy', '/cookie-policy', '/disclaimer', '/refund-policy', '/responsible-gambling'].some((route) => search.includes(`'${route}'`)));

const routeChecks = [
  ['matches', 'app/(public)/matches/page.tsx'],
  ['dashboard', 'app/(public)/dashboard/page.tsx'],
  ['subscriptions', 'app/(public)/subscriptions/page.tsx'],
  ['purchases', 'app/(public)/purchases/page.tsx'],
  ['bonuses', 'app/(public)/bonuses/page.tsx'],
];
check('All five audited public destinations resolve to App Router pages', routeChecks.every(([, file]) => fs.existsSync(path.join(root, file))));

const report = {
  stage: '9',
  scannedTypeScriptFiles: files.length,
  changedSourceFiles: changedFiles.length,
  syntaxErrorCount: syntaxErrors.length,
  unresolvedLocalImportCount: changedUnresolved.length,
  preExistingUnresolvedImportCountInSuppliedSnapshot: unresolved.length,
  checksPassed: checks.filter((item) => item.pass).length,
  checksTotal: checks.length,
  checks,
  diagnostics: { syntaxErrors, changedFilesUnresolvedLocalImports: changedUnresolved, allSnapshotUnresolvedLocalImports: unresolved },
  buildStatus: 'Not run: the supplied snapshot does not include package.json, tsconfig.json or installed frontend dependencies.',
  runtimeStatus: 'Not run: no deployed API credentials or live backend URL were supplied for authenticated smoke tests.',
};

const reportPath = path.join(__dirname, 'STAGE-9-VALIDATION.json');
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (report.syntaxErrorCount || report.unresolvedLocalImportCount || report.checksPassed !== report.checksTotal) process.exit(1);
