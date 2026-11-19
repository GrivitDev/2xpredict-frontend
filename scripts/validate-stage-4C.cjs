const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const frontendRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(frontendRoot, '../..');
const backendRoot = path.join(repoRoot, 'backend', 'src');
const changedFiles = [
  'components/admin/realtime/AdminRealtimeStatusBar.tsx',
  'components/admin/realtime/AdminRealtimeMonitor.tsx',
  'hooks/use-admin-realtime.ts',
  'types/admin-realtime.ts',
  'lib/admin-realtime.utils.ts',
  'scripts/validate-stage-4C.cjs',
];

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

function resolveLocalImport(importer, specifier) {
  const base = specifier.startsWith('@/')
    ? path.join(frontendRoot, specifier.slice(2))
    : path.resolve(path.dirname(importer), specifier);
  const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '.json', '.d.ts'];
  const candidates = extensions.map((extension) => base + extension);
  for (const extension of ['.ts', '.tsx', '.js', '.jsx', '.d.ts']) {
    candidates.push(path.join(base, `index${extension}`));
  }
  return candidates.some((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
}

const syntaxErrors = [];
const unresolvedLocalImports = [];
const missingFiles = [];
const allSourceFiles = walk(frontendRoot).filter((file) => /\.(ts|tsx)$/.test(file));
for (const absolute of allSourceFiles) {
  const source = fs.readFileSync(absolute, 'utf8');
  const isTsx = absolute.endsWith('.tsx');
  const parsed = ts.createSourceFile(
    absolute,
    source,
    ts.ScriptTarget.Latest,
    true,
    isTsx ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  for (const diagnostic of parsed.parseDiagnostics) {
    const position = parsed.getLineAndCharacterOfPosition(diagnostic.start || 0);
    syntaxErrors.push({
      file: path.relative(frontendRoot, absolute),
      line: position.line + 1,
      message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
    });
  }
  if (changedFiles.includes(path.relative(frontendRoot, absolute))) {
    parsed.forEachChild((node) => {
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        const specifier = node.moduleSpecifier.text;
        if ((specifier.startsWith('.') || specifier.startsWith('@/')) && !resolveLocalImport(absolute, specifier)) {
          unresolvedLocalImports.push({ file: path.relative(frontendRoot, absolute), specifier });
        }
      }
    });
  }
}
for (const relative of changedFiles.filter((file) => !fs.existsSync(path.join(frontendRoot, file)))) {
  missingFiles.push(relative);
}

const read = (relative) => fs.readFileSync(path.join(frontendRoot, relative), 'utf8');
const hook = read('hooks/use-admin-realtime.ts');
const types = read('types/admin-realtime.ts');
const utilsSource = read('lib/admin-realtime.utils.ts');
const statusBar = read('components/admin/realtime/AdminRealtimeStatusBar.tsx');
const monitor = read('components/admin/realtime/AdminRealtimeMonitor.tsx');
const inventory = read('services/endpoint-inventory.ts');
const layout = read('app/admin/layout.tsx');

const backendFiles = walk(backendRoot).filter((file) => file.endsWith('.ts'));
const backendEvents = new Set();
const staticEventRegex = /publishModuleEvent\s*\(\s*(['"])(.*?)\1\s*,\s*(['"])(.*?)\3/g;
for (const file of backendFiles) {
  const source = fs.readFileSync(file, 'utf8');
  for (const match of source.matchAll(staticEventRegex)) backendEvents.add(match[4]);
}
for (const event of ['settlement:job-requeued', 'settlement:job-skipped', 'settlement:job-completed', 'system:activity']) backendEvents.add(event);
if (backendFiles.length === 0) {
  for (const event of [
    'payment:new', 'payment:update', 'analytics:update', 'analytics:ingestion-update',
    'odds:cycle-completed', 'odds:worker-error', 'odds:retention-completed', 'odds:retention-error',
    'predictions:event', 'predictions:worker-status', 'settlement:worker-ready', 'settlement:worker-error',
    'settlement:drain-started', 'settlement:job-started', 'settlement:job-requeued',
    'settlement:job-skipped', 'settlement:job-completed', 'settlement:job-failed',
    'bet-lab:ticket-placed', 'system:module-health', 'system:error', 'system:activity',
  ]) backendEvents.add(event);
}
const declaredEvents = [...types.matchAll(/^\s*'([a-z][a-z0-9:-]+)'\s*,?\s*$/gm)].map((match) => match[1]);
const frontendEvents = new Set(declaredEvents);

// Execute the pure TypeScript helpers through the repository TypeScript compiler.
const compiledUtils = ts.transpileModule(utilsSource, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;
const utilityModule = { exports: {} };
vm.runInNewContext(compiledUtils, { module: utilityModule, exports: utilityModule.exports, Date, Math, Array, Number, String, Boolean, Object, JSON });
const utils = utilityModule.exports;
const unitChecks = [];
const check = (name, pass) => unitChecks.push({ name, pass: Boolean(pass) });

const samplePayload = { eventId: 'evt-123', occurredAt: '2026-11-12T12:00:00.000Z' };
const identity = utils.getAdminRealtimeEventIdentity('payment:new', samplePayload);
check('explicit event ID produces stable deduplication identity', identity === 'payment:new:evt-123');
check('events without an explicit ID are not incorrectly deduplicated', utils.getAdminRealtimeEventIdentity('payment:new', { id: 'payment-1' }) === null);
const eventRecord = { id: 'payment:new:evt-123', event: 'payment:new', module: 'payments', occurredAt: samplePayload.occurredAt, payload: samplePayload };
const firstAppend = utils.appendAdminRealtimeEvent([], eventRecord, 40);
const duplicateAppend = utils.appendAdminRealtimeEvent(firstAppend, eventRecord, 40);
check('duplicate event deliveries are ignored', duplicateAppend.length === 1);
let cappedEvents = [];
for (let index = 0; index < 45; index += 1) {
  cappedEvents = utils.appendAdminRealtimeEvent(cappedEvents, { ...eventRecord, id: `event-${index}` }, 40);
}
check('event buffer remains capped at 40 records', cappedEvents.length === 40);
check('payment updates invalidate payment, analytics and subscription queries', JSON.stringify(utils.getAdminRealtimeInvalidationPrefixes('payment:update')) === JSON.stringify([['payments'], ['analytics'], ['subscriptions']]));
check('Odds events also refresh System Monitor state', JSON.stringify(utils.getAdminRealtimeInvalidationPrefixes('odds:worker-error')) === JSON.stringify([['odds'], ['system-monitor']]));
check('settlement events refresh settlement and System Monitor state', JSON.stringify(utils.getAdminRealtimeInvalidationPrefixes('settlement:job-failed')) === JSON.stringify([['settlement'], ['system-monitor']]));
check('event family resolves to its owning module', utils.getAdminRealtimeModuleForEvent('predictions:event', {}) === 'predictions-engine');
const validModule = {
  module: 'predictions-engine', integrationStatus: 'READY', operationalStatus: 'READY',
  message: 'Ready', registeredAt: '2026-11-12T12:00:00.000Z', updatedAt: '2026-11-12T12:00:00.000Z', eventCount: 2,
};
check('valid backend module readiness record is accepted', utils.isAdminRealtimeModuleStatus(validModule));
check('invalid operational status is rejected', !utils.isAdminRealtimeModuleStatus({ ...validModule, operationalStatus: 'BROKEN' }));
check('ready snapshot must identify the admin audience', utils.parseAdminRealtimeReadyPayload({ connected: true, audience: 'user', modules: [] }) === null);
check('admin ready snapshot parses and filters malformed modules', utils.parseAdminRealtimeReadyPayload({ connected: true, audience: 'admin', modules: [validModule, { module: 'bad' }] })?.modules.length === 1);
check('server-disconnect retries are bounded and back off', JSON.stringify(utils.ADMIN_REALTIME_SERVER_RETRY_DELAYS_MS) === JSON.stringify([1000, 3000, 7000]));

const staticChecks = [
  ['server-initiated disconnect is explicitly retried', hook.includes("reason === 'io server disconnect'") && hook.includes('scheduleServerDisconnectRetry')],
  ['server disconnect retry attempts are capped', hook.includes('MAX_SERVER_DISCONNECT_RETRIES') && hook.includes('repeatedly closed the connection')],
  ['retry refreshes the active JWT cookie before reconnecting', hook.includes("const latestToken = Cookies.get('token')") && hook.includes('socket.auth = { token: activeToken }')],
  ['foreground visibility and network-online events trigger recovery', hook.includes("document.addEventListener('visibilitychange'") && hook.includes("window.addEventListener('online'")],
  ['foreground recovery invalidates active admin module queries', hook.includes("['system-monitor'], ['payments'], ['subscriptions']")],
  ['event handlers use deduplication and bounded buffering helpers', hook.includes('getAdminRealtimeEventIdentity') && hook.includes('appendAdminRealtimeEvent')],
  ['module status payloads are fully validated', hook.includes('isAdminRealtimeModuleStatus(rawPayload)')],
  ['debounced invalidation timers are cleared on unmount', hook.includes('invalidationTimers.values()') && hook.includes('clearTimeout(timer)')],
  ['socket listeners and browser listeners are removed on unmount', hook.includes("document.removeEventListener('visibilitychange'") && hook.includes("window.removeEventListener('online'") && hook.includes('socket.disconnect()')],
  ['React Query invalidation failures do not create unhandled rejections', hook.includes('.invalidateQueries(') && hook.includes('.catch(() => undefined)')],
  ['status bar exposes reconnection attempt count', statusBar.includes('reconnectAttempts') && statusBar.includes('Reconnecting')],
  ['System Monitor displays reconnect state and gateway errors', monitor.includes('reconnectAttempts') && monitor.includes('errorMessage')],
  ['realtime provider remains mounted only inside authenticated admin layout', layout.includes('<AdminRealtimeProvider>') && layout.includes("if (!user || user.role !== 'admin') return null;")],
  ['the frontend event catalogue contains every backend event', [...backendEvents].every((event) => frontendEvents.has(event))],
  ['WebSocket inventory still contains every declared backend event', [...backendEvents].every((event) => inventory.includes(`'${event}'`))],
];

const checks = [
  ...staticChecks.map(([name, pass]) => ({ name, pass })),
  ...unitChecks,
];
const report = {
  scannedTypeScriptFiles: allSourceFiles.length,
  changedFiles: changedFiles.length,
  backendFilesScanned: backendFiles.length,
  backendContractSource: backendFiles.length > 0 ? 'repository backend/src scan' : 'supplied backend snapshot fallback',
  backendRealtimeEventsFound: [...backendEvents].sort(),
  frontendRealtimeEventsFound: [...frontendEvents].sort(),
  syntaxErrors,
  unresolvedLocalImports,
  missingFiles,
  checks,
  passed:
    syntaxErrors.length === 0 && unresolvedLocalImports.length === 0 && missingFiles.length === 0 && checks.every((item) => item.pass),
};
fs.writeFileSync(path.join(__dirname, 'STAGE-4C-VALIDATION.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (!report.passed) process.exitCode = 1;
