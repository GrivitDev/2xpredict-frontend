const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const frontendRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(__dirname, '../..');
const backendRoot = path.join(repoRoot, 'backend', 'src');
const changedFiles = [
  'app/admin/layout.tsx',
  'components/admin/analytics/AnalyticsDashboard.tsx',
  'components/admin/system-monitor/system-monitor.tsx',
  'components/admin/realtime/AdminRealtimeProvider.tsx',
  'components/admin/realtime/AdminRealtimeStatusBar.tsx',
  'components/admin/realtime/AdminRealtimeMonitor.tsx',
  'hooks/use-admin-realtime.ts',
  'types/admin-realtime.ts',
  'services/endpoint-inventory.ts',
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
  const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '.json'];
  const candidates = extensions.map((extension) => base + extension);
  for (const extension of ['.ts', '.tsx', '.js', '.jsx']) {
    candidates.push(path.join(base, `index${extension}`));
  }
  return candidates.some((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
}

const syntaxErrors = [];
const unresolvedLocalImports = [];
const missingFiles = [];
for (const relative of changedFiles) {
  const absolute = path.join(frontendRoot, relative);
  if (!fs.existsSync(absolute)) {
    missingFiles.push(relative);
    continue;
  }
  const source = fs.readFileSync(absolute, 'utf8');
  const isTsx = relative.endsWith('.tsx');
  const sourceFile = ts.createSourceFile(
    absolute,
    source,
    ts.ScriptTarget.Latest,
    true,
    isTsx ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const transpiled = ts.transpileModule(source, {
    fileName: absolute,
    reportDiagnostics: true,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.Preserve,
    },
  });
  for (const diagnostic of transpiled.diagnostics || []) {
    if (diagnostic.category === ts.DiagnosticCategory.Error) {
      syntaxErrors.push({
        file: relative,
        message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
      });
    }
  }
  sourceFile.forEachChild((node) => {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      const specifier = node.moduleSpecifier.text;
      if ((specifier.startsWith('.') || specifier.startsWith('@/')) && !resolveLocalImport(absolute, specifier)) {
        unresolvedLocalImports.push({ file: relative, specifier });
      }
    }
  });
}

const read = (relative) => fs.readFileSync(path.join(frontendRoot, relative), 'utf8');
const hook = read('hooks/use-admin-realtime.ts');
const types = read('types/admin-realtime.ts');
const inventory = read('services/endpoint-inventory.ts');
const layout = read('app/admin/layout.tsx');
const sysmon = read('components/admin/system-monitor/system-monitor.tsx');
const analytics = read('components/admin/analytics/AnalyticsDashboard.tsx');
const provider = read('components/admin/realtime/AdminRealtimeProvider.tsx');
const monitor = read('components/admin/realtime/AdminRealtimeMonitor.tsx');

const backendFiles = walk(backendRoot).filter((file) => file.endsWith('.ts'));
const backendEvents = new Set();
const staticEventRegex = /publishModuleEvent\s*\(\s*(['"])(.*?)\1\s*,\s*(['"])(.*?)\3/g;
for (const file of backendFiles) {
  const source = fs.readFileSync(file, 'utf8');
  for (const match of source.matchAll(staticEventRegex)) backendEvents.add(match[4]);
}
// The Settlement worker selects these event names through a conditional expression.
for (const event of ['settlement:job-requeued', 'settlement:job-skipped', 'settlement:job-completed', 'system:activity']) backendEvents.add(event);
// The supplied flattened snapshot can be used for validation when the backend
// source folder is not included alongside the frontend patch. In the user's full
// repository, the live backend scan above takes precedence.
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
const frontendEvents = new Set([...types.matchAll(/'([a-z][a-z0-9:-]+)'/g)].map((match) => match[1]));
const inventoryEvents = new Set([...inventory.matchAll(/'([a-z][a-z0-9:-]+)'/g)].map((match) => match[1]));

const checks = [
  ['admin realtime connection includes every backend-published event', [...backendEvents].every((event) => frontendEvents.has(event))],
  ['root admin gateway handshake is JWT-authenticated', hook.includes('auth: { token }')],
  ['admin realtime ready snapshot is handled', hook.includes("socket.on('realtime:ready'")],
  ['module operational updates are handled', hook.includes("socket.on('realtime:module-status'")],
  ['event-driven invalidation includes payment and analytics', hook.includes("[['payments'], ['analytics']]") && hook.includes("[['analytics'], ['website-analytics']]")],
  ['event-driven invalidation includes prediction, odds and settlement', hook.includes("[['odds']]") && hook.includes("[['predictions', 'engine']]") && hook.includes("[['settlement']]")],
  ['invalidation is debounced', hook.includes('INVALIDATION_DEBOUNCE_MS')],
  ['provider mounted only in authenticated admin layout', layout.includes('<AdminRealtimeProvider>') && layout.includes("if (!user || user.role !== 'admin') return null;")],
  ['global admin realtime status indicator mounted', layout.includes('<AdminRealtimeStatusBar />')],
  ['System Monitor contains module readiness and event stream', sysmon.includes('<AdminRealtimeMonitor />') && monitor.includes('Module readiness') && monitor.includes('Live event stream')],
  ['Business analytics reads realtime state', analytics.includes('useAdminRealtimeState') && analytics.includes('Realtime refresh enabled')],
  ['websocket inventory includes root admin gateway', inventory.includes("namespace: '/'") && inventory.includes("gateway: 'backend/src/realtime/admin.gateway.ts'")],
  ['websocket inventory tracks every declared admin event', [...frontendEvents].filter((event) => event.includes(':')).every((event) => inventoryEvents.has(event))],
  ['admin realtime provider exposes shared context', provider.includes('AdminRealtimeContext.Provider') && provider.includes('useAdminRealtimeState')],
];

const report = {
  changedFiles: changedFiles.length,
  backendFilesScanned: backendFiles.length,
  backendContractSource: backendFiles.length > 0 ? 'repository backend/src scan' : 'supplied source snapshot fallback',
  syntaxErrors,
  unresolvedLocalImports,
  missingFiles,
  backendRealtimeEventsFound: [...backendEvents].sort(),
  frontendRealtimeEventsFound: [...frontendEvents].filter((item) => item.includes(':')).sort(),
  checks: checks.map(([name, pass]) => ({ name, pass })),
  passed:
    missingFiles.length === 0 &&
    syntaxErrors.length === 0 &&
    unresolvedLocalImports.length === 0 &&
    checks.every(([, pass]) => pass),
};
fs.writeFileSync(path.join(frontendRoot, 'scripts', 'STAGE-4B-VALIDATION.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (!report.passed) process.exitCode = 1;
