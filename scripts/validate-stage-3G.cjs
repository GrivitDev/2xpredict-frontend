#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

let ts;
try {
  ts = require('typescript');
} catch {
  console.error('TypeScript is required. Install the project dependencies before running this check.');
  process.exit(2);
}

const frontendRoot = path.resolve(__dirname, '..');
const projectRoot = path.resolve(frontendRoot, '..');
const allowSnapshotOmissions = process.env.ALLOW_INCOMPLETE_SOURCE_SNAPSHOT === '1';
const knownSnapshotOmissions = new Set(['@/providers/auth-provider']);

const sourceFiles = [];
function collectSourceFiles(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === 'dist' || entry.name === 'out') continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) collectSourceFiles(absolute);
    else if (/\.(?:ts|tsx|mts|cts)$/.test(entry.name)) sourceFiles.push(absolute);
  }
}
collectSourceFiles(frontendRoot);

const parseErrors = [];
for (const file of sourceFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const kind = file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, kind);
  for (const diagnostic of parsed.parseDiagnostics ?? []) {
    parseErrors.push({
      file: path.relative(frontendRoot, file),
      line: parsed.getLineAndCharacterOfPosition(diagnostic.start ?? 0).line + 1,
      message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
    });
  }
}

const contractFiles = [
  'types/predictions.ts',
  'types/prediction-engine-monitor.ts',
  'types/odds-center.ts',
  'types/endpoint-args/prediction-engine.ts',
  'types/endpoint-args/odds.ts',
  'services/prediction-engine.service.ts',
  'services/odds.service.ts',
  'services/endpoint-inventory.ts',
  'services/prediction-access.service.ts',
  'hooks/use-prediction-engine.ts',
  'hooks/use-odds.ts',
  'hooks/use-prediction-access.ts',
  'components/admin/pick-center/PickCenter.tsx',
  'components/admin/predictions-center/PredictionsCenter.tsx',
  'components/admin/slip-center/SlipCenter.tsx',
  'components/admin/odds-center/OddsCenter.tsx',
  'components/admin/system-monitor/prediction-engine/PredictionEngineAdmin.tsx',
  'components/admin/system-monitor/module-monitor.tsx',
  'components/predictions/PredictionMatchCard.tsx',
  'components/predictions/PredictionMarketDetailsPanel.tsx',
  'components/predictions/PredictionsHub.tsx',
  'components/home-sections/settled-wins/SettledWinsSection.tsx',
  'components/home-sections/won-slips/WonSlipsSection.tsx',
  'lib/prediction-display.ts',
];

const missingContractFiles = contractFiles.filter((relative) => !fs.existsSync(path.join(frontendRoot, relative)));
const missingImports = [];
const snapshotWarnings = [];
function resolvesLocalImport(fromFile, specifier) {
  let target;
  if (specifier.startsWith('@/')) target = path.join(frontendRoot, specifier.slice(2));
  else if (specifier.startsWith('.')) target = path.resolve(path.dirname(fromFile), specifier);
  else return true;
  const candidates = [
    target, `${target}.ts`, `${target}.tsx`, `${target}.mts`, `${target}.cts`, `${target}.d.ts`,
    path.join(target, 'index.ts'), path.join(target, 'index.tsx'), path.join(target, 'index.d.ts'),
  ];
  return candidates.some((candidate) => fs.existsSync(candidate));
}
for (const relative of contractFiles.filter((item) => fs.existsSync(path.join(frontendRoot, item)))) {
  const absolute = path.join(frontendRoot, relative);
  const source = fs.readFileSync(absolute, 'utf8');
  const parsed = ts.createSourceFile(absolute, source, ts.ScriptTarget.Latest, true, relative.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  function visit(node) {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      const specifier = node.moduleSpecifier.text;
      if ((specifier.startsWith('@/') || specifier.startsWith('.')) && !resolvesLocalImport(absolute, specifier)) {
        if (allowSnapshotOmissions && knownSnapshotOmissions.has(specifier)) {
          snapshotWarnings.push({ file: relative, specifier });
        } else {
          missingImports.push({ file: relative, specifier });
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(parsed);
}

function read(relative) {
  return fs.readFileSync(path.join(frontendRoot, relative), 'utf8');
}
const engineService = read('services/prediction-engine.service.ts');
const oddsService = read('services/odds.service.ts');
const engineHooks = read('hooks/use-prediction-engine.ts');
const oddsHooks = read('hooks/use-odds.ts');
const inventoryText = read('services/endpoint-inventory.ts');
const inventoryRows = inventoryText
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line.startsWith('{"method"'))
  .map((line) => JSON.parse(line.replace(/,$/, '')));
const predictionOddsRows = inventoryRows.filter((row) =>
  row.path.startsWith('/api/predictions/') ||
  row.path.startsWith('/api/predictions-engine/') ||
  row.path.startsWith('/api/odds/'),
);
const inventoryMismatches = [];
for (const row of predictionOddsRows) {
  const serviceSource = row.path.startsWith('/api/odds/') ? oddsService : engineService;
  const hooksSource = row.path.startsWith('/api/odds/') ? oddsHooks : engineHooks;
  if (!serviceSource.includes(row.path.replace('/api', ''))) {
    inventoryMismatches.push({ path: row.path, issue: 'service route not found' });
  }
  if (!new RegExp(`\\b${row.hook.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`).test(hooksSource)) {
    inventoryMismatches.push({ path: row.path, issue: `hook ${row.hook} not found` });
  }
}

const slipCenter = read('components/admin/slip-center/SlipCenter.tsx');
const oddsCenter = read('components/admin/odds-center/OddsCenter.tsx');
const predictionAdmin = read('components/admin/system-monitor/prediction-engine/PredictionEngineAdmin.tsx');
const moduleMonitor = read('components/admin/system-monitor/module-monitor.tsx');
const predictionsTypes = read('types/predictions.ts');
const predictionDisplay = read('lib/prediction-display.ts');
const oddsCenterNoDirectService = !/from\s+['"]@\/services\/odds\.service['"]/.test(oddsCenter);
const slipCenterNoDirectService = !/predictionEngineService/.test(slipCenter);
const predictionAdminNoDirectService = !/predictionEngineService/.test(predictionAdmin);
const fixedResponseHooks = !/function\s+use(?:GetSlip|ListAdminSlips|ListAdminPickCenter|ListAdminCuratedPredictions|BuildSlip|PublishSlip|PublishCuratedPrediction|UnpublishCuratedPrediction|UpdateSlipLegs|UpdateSportyBet|RefreshCuratedPredictions)\s*<TData/.test(engineHooks)
  && !engineHooks.includes('as Promise<TData>');
const activeSlipProducts = ['ODDS_10', 'ODDS_25', 'ODDS_50', 'SURE_ODDS'].every((value) => predictionsTypes.includes(`'${value}'`));
const legacyOnlyProductsRetained = ['STANDARD', 'MEDIUM_ODDS', 'HIGH_ODDS', 'EXTENDED_ODDS', 'UNLIMITED_ODDS'].every((value) => predictionsTypes.includes(`'${value}'`));
const oddsHookOwnership = oddsCenter.includes('useOddsCenter') && oddsCenter.includes('useOddsMonitor')
  && moduleMonitor.includes("from '@/hooks/use-odds'")
  && !oddsCenter.includes('oddsService.');
const grivitLabeling = predictionDisplay.includes('Grivit estimate') && oddsCenter.includes('GRIVIT_MODEL');
const staleAliases = [
  'services/predictions-read.service.ts',
  'services/predictions.service.ts',
  'services/odds-center.service.ts',
  'hooks/use-predictions-read.ts',
  'hooks/use-predictions.ts',
  'hooks/use-odds-center.ts',
].filter((relative) => fs.existsSync(path.join(frontendRoot, relative)));
const legacyReferences = [];
const legacySpecifiers = ['predictions-read.service', 'predictions.service', 'odds-center.service', 'use-predictions-read', 'use-predictions', 'use-odds-center'];
for (const file of sourceFiles) {
  const source = fs.readFileSync(file, 'utf8');
  for (const specifier of legacySpecifiers) {
    if (source.includes(specifier)) legacyReferences.push({ file: path.relative(frontendRoot, file), specifier });
  }
}

// Execute the pure display helpers through TypeScript transpilation for focused regressions.
const helperOutput = ts.transpileModule(predictionDisplay, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  reportDiagnostics: true,
}).outputText;
const helperModule = { exports: {} };
new Function('module', 'exports', helperOutput)(helperModule, helperModule.exports);
const {
  predictionProbabilityPercent,
  predictionConfidence,
  predictionPrice,
  formatPredictionPrice,
  predictionPriceLabel,
  predictionOutcome,
  isSettledPredictionOutcome,
} = helperModule.exports;
const displayAssertions = [
  predictionProbabilityPercent({ probability: 0.62 }) === 62,
  predictionProbabilityPercent({ probabilityPercent: 62 }) === 62,
  predictionConfidence({ confidence: 88 }) === 88,
  predictionConfidence({ confidence: 99 }) === null,
  predictionPrice({ fairOdds: 1.8 }).value === null,
  formatPredictionPrice(predictionPrice({ decimalOdds: 2.15, priceType: 'ESTIMATED' })) === '~2.15',
  predictionPriceLabel(predictionPrice({ decimalOdds: 2.15, priceType: 'ESTIMATED' })) === 'Grivit estimate',
  predictionPrice({ bookmakerOdds: 1.95, bookmaker: 'Example Bookmaker' }).source === 'PROVIDER',
  predictionOutcome({ settlementOutcome: 'HALF_WON' }) === 'HALF_WON',
  isSettledPredictionOutcome('WON') === true,
];

const checks = {
  allFrontendTypescriptFilesParse: parseErrors.length === 0,
  requiredContractFilesPresent: missingContractFiles.length === 0,
  updatedContractImportsResolve: missingImports.length === 0,
  predictionAndOddsInventoryRoutesChecked: predictionOddsRows.length === 34,
  predictionAndOddsInventoryMappingsMatch: inventoryMismatches.length === 0,
  slipCenterUsesDedicatedHooks: slipCenterNoDirectService && slipCenter.includes('useBuildSlipMutation') && slipCenter.includes('useUpdateSportyBetMutation'),
  oddsCenterUsesDedicatedHooks: oddsHookOwnership && oddsCenterNoDirectService,
  predictionAdminUsesDedicatedHooks: predictionAdminNoDirectService && predictionAdmin.includes('useGetDashboardQuery'),
  predictionHooksUseFixedBackendResponseTypes: fixedResponseHooks,
  activeSlipProductsPresent: activeSlipProducts,
  legacySlipProductsRetainedForHistory: legacyOnlyProductsRetained,
  GrivitPricingIsExplicitlyLabelled: grivitLabeling,
  obsoleteCompatibilityModulesRemoved: staleAliases.length === 0,
  obsoleteCompatibilityReferencesRemoved: legacyReferences.length === 0,
  predictionDisplayRegressions: displayAssertions.every(Boolean),
};

const report = {
  stage: '3G',
  sourceFilesParsed: sourceFiles.length,
  parseErrors,
  contractFilesChecked: contractFiles.length,
  missingContractFiles,
  missingImports,
  acceptedSnapshotWarnings: snapshotWarnings,
  predictionAndOddsEndpointsChecked: predictionOddsRows.length,
  inventoryMismatches,
  displayAssertions: displayAssertions.length,
  displayAssertionsPassed: displayAssertions.filter(Boolean).length,
  staleAliases,
  legacyReferences,
  checks,
  passedChecks: Object.values(checks).filter(Boolean).length,
  totalChecks: Object.keys(checks).length,
  fullTypecheck: 'not performed by this source-level script; run the project TypeScript and Next.js builds in the complete repository.',
};

console.log(JSON.stringify(report, null, 2));
if (Object.values(checks).some((passed) => !passed)) process.exitCode = 1;
