#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const args = process.argv.slice(2);
let projectRoot = process.cwd();
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === '--project-root' || args[i] === '-ProjectRoot') {
    projectRoot = path.resolve(args[i + 1] || '.');
    i += 1;
  }
}

const frontendRoot = path.join(projectRoot, 'frontend');
const checks = [];
const check = (name, pass, detail = '') => checks.push({ name, pass: Boolean(pass), detail });
const read = (relative) => fs.readFileSync(path.join(frontendRoot, relative), 'utf8');
const exists = (relative) => fs.existsSync(path.join(frontendRoot, relative));

const removedFiles = [
  'hooks/use-predictions-read.ts',
  'hooks/use-predictions.ts',
  'hooks/use-odds-center.ts',
  'services/predictions-read.service.ts',
  'services/predictions.service.ts',
  'services/odds-center.service.ts',
  'types/endpoint-args/predictions-read.ts',
  'hooks/use-telegram.ts',
  'services/telegram.service.ts',
  'types/endpoint-args/telegram.ts',
  'hooks/use-billing.ts',
  'services/billing.service.ts',
  'types/billing.ts',
  'hooks/use-sessions.ts',
  'services/sessions.service.ts',
  'services/admin-ads.service.ts',
  'services/bonuses-admin.service.ts',
  'services/customer-care-admin.service.ts',
  'services/settlement-admin.service.ts',
  'services/bet-lab-admin.service.ts',
  'services/bet-lab-wallet.service.ts',
  'types/endpoint-args/admin-ads.ts',
  'types/endpoint-args/bonuses-admin.ts',
  'types/endpoint-args/customer-care-admin.ts',
  'types/endpoint-args/settlement-admin.ts',
  'types/endpoint-args/bet-lab-admin.ts',
  'types/endpoint-args/bet-lab-wallet.ts',
  'types/endpoint-args/system-monitor.ts',
  'types/endpoint-args/user-session.ts',
];

try {
  check('All explicitly quarantined legacy files are absent from the frontend tree',
    removedFiles.every((file) => !exists(file)),
    removedFiles.filter(exists).join(', '));

  const serviceBarrel = read('services/index.ts');
  const hookBarrel = read('hooks/index.ts');
  check('Canonical service barrel does not export the unsupported Telegram webhook client',
    !serviceBarrel.includes('telegramService'));
  check('Canonical hook barrel does not export the unsupported Telegram webhook hook',
    !hookBarrel.includes('telegramHooks'));

  const adminAds = read('hooks/use-admin-ads.ts');
  check('Admin Ads hooks call the canonical adsService module',
    adminAds.includes("from '../services/ads.service'") && adminAds.includes('adsService.') && !adminAds.includes('admin-ads.service'));

  const bonusesAdmin = read('hooks/use-bonuses-admin.ts');
  check('Admin Bonuses hooks call bonusesService and canonical request types',
    bonusesAdmin.includes("from '../services/bonuses.service'") &&
    bonusesAdmin.includes('bonusesService.') &&
    bonusesAdmin.includes("../types/endpoint-args/bonuses'") &&
    !bonusesAdmin.includes('../services/bonuses-admin.service') &&
    !bonusesAdmin.includes('../types/endpoint-args/bonuses-admin'));

  const customerCareAdmin = read('hooks/use-customer-care-admin.ts');
  check('Customer Care admin hooks import from the canonical customer-care service module',
    customerCareAdmin.includes("from '../services/customer-care.service'") && !customerCareAdmin.includes('customer-care-admin.service'));

  const settlementAdmin = read('hooks/use-settlement-admin.ts');
  check('Settlement admin hooks call settlementService and canonical request types',
    settlementAdmin.includes("from '../services/settlement.service'") &&
    settlementAdmin.includes('settlementService.') &&
    settlementAdmin.includes("../types/endpoint-args/settlement'") &&
    !settlementAdmin.includes('../services/settlement-admin.service') &&
    !settlementAdmin.includes('../types/endpoint-args/settlement-admin'));

  const betLabAdmin = read('hooks/use-bet-lab-admin.ts');
  check('Bet Lab admin hooks import request types from the canonical Bet Lab contract',
    betLabAdmin.includes("../types/endpoint-args/bet-lab'") && !betLabAdmin.includes('bet-lab-admin'));

  const walletHook = read('hooks/use-bet-lab-wallet.ts');
  check('Bet Lab wallet hooks use betLabService with the existing wallet endpoints',
    walletHook.includes("from '../services/bet-lab.service'") &&
    walletHook.includes('betLabService.getWallet()') &&
    walletHook.includes('betLabService.getLedger(args)') &&
    !walletHook.includes('bet-lab-wallet.service'));

  const betLabService = read('services/bet-lab.service.ts');
  check('Temporary Bet Lab wallet/admin service aliases are removed',
    !betLabService.includes('betLabAdminService') && !betLabService.includes('betLabWalletService'));

  const userSession = read('services/user-session.service.ts');
  check('Canonical user-session service no longer exposes the unused getMine alias',
    !/\bgetMine\s*:/.test(userSession));

  const homePricing = read('components/pricing/HomePricingPreview.tsx');
  const pricingCard = read('components/pricing/PricingCard.tsx');
  check('Pricing components consume Currency from the payment domain types',
    homePricing.includes("@/types/payments") && pricingCard.includes("@/types/payments") &&
    !homePricing.includes('@/types/billing') && !pricingCard.includes('@/types/billing'));

  const staleSpecifiers = [
    'predictions-read.service', 'predictions.service', 'odds-center.service',
    'use-predictions-read', 'use-predictions', 'use-odds-center',
    'telegram.service', 'use-telegram', 'billing.service', 'use-billing',
    'sessions.service', 'use-sessions', 'admin-ads.service', 'bonuses-admin.service',
    'customer-care-admin.service', 'settlement-admin.service', 'bet-lab-admin.service',
    'bet-lab-wallet.service', 'types/billing', 'endpoint-args/telegram',
  ];
  const sourceFiles = [];
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (['node_modules', '.next', 'dist', 'out', 'legacy-quarantine'].includes(entry.name)) continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(absolute);
      else if (/\.(?:ts|tsx)$/.test(entry.name)) sourceFiles.push(absolute);
    }
  }
  walk(frontendRoot);
  const legacyReferences = [];
  for (const file of sourceFiles) {
    const relative = path.relative(frontendRoot, file).replace(/\\/g, '/');
    const contents = fs.readFileSync(file, 'utf8');
    for (const stale of staleSpecifiers) {
      if (contents.includes(stale)) legacyReferences.push(`${relative} -> ${stale}`);
    }
  }
  check('No TypeScript/TSX files retain imports or references to removed legacy modules',
    legacyReferences.length === 0, legacyReferences.join('; '));

  const changedFiles = [
    'hooks/index.ts', 'services/index.ts',
    'hooks/use-admin-ads.ts', 'hooks/use-bonuses-admin.ts',
    'hooks/use-customer-care-admin.ts', 'hooks/use-settlement-admin.ts',
    'hooks/use-bet-lab-admin.ts', 'hooks/use-bet-lab-wallet.ts',
    'components/pricing/HomePricingPreview.tsx', 'components/pricing/PricingCard.tsx',
    'services/user-session.service.ts', 'services/bet-lab.service.ts',
    'scripts/validate-stage-5.cjs',
  ];
  const missingChanged = changedFiles.filter((file) => !fs.existsSync(path.join(frontendRoot, file)));
  check('All Stage 5 updated files are installed', missingChanged.length === 0, missingChanged.join(', '));

  // Check relative and @/ imports in changed TS/TSX files without requiring a project build.
  const changedTs = changedFiles.filter((file) => /\.(?:ts|tsx)$/.test(file) && exists(file));
  const missingImports = [];
  function importExists(fromFile, specifier) {
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
  for (const relative of changedTs) {
    const absolute = path.join(frontendRoot, relative);
    const contents = fs.readFileSync(absolute, 'utf8');
    const pattern = /(?:from\s*|import\s*\()(['"])([^'"]+)\1/g;
    for (const match of contents.matchAll(pattern)) {
      const specifier = match[2];
      if ((specifier.startsWith('@/') || specifier.startsWith('.')) && !importExists(absolute, specifier)) {
        missingImports.push(`${relative} -> ${specifier}`);
      }
    }
  }
  check('All local imports in changed TypeScript/TSX files resolve', missingImports.length === 0, missingImports.join('; '));

  const failed = checks.filter((item) => !item.pass);
  console.log(JSON.stringify({
    stage: 5,
    sourceFilesScanned: sourceFiles.length,
    removedFilesChecked: removedFiles.length,
    checksPassed: checks.length - failed.length,
    checksTotal: checks.length,
    checks,
  }, null, 2));
  if (failed.length) process.exitCode = 1;
} catch (error) {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
}
