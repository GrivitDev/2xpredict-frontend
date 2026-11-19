const fs = require('fs');
const path = require('path');
const ts = require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');

const root = path.resolve(__dirname, '..');
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(ts|tsx)$/.test(entry.name)) files.push(full);
  }
}
walk(root);
const syntaxIssues = [];
const localImportIssues = [];
const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.d.ts'];
function localImportExists(fromFile, specifier) {
  const target = specifier.startsWith('@/')
    ? path.join(root, specifier.slice(2))
    : path.resolve(path.dirname(fromFile), specifier);
  const candidates = [target, ...extensions.map((ext) => target + ext), ...extensions.map((ext) => path.join(target, `index${ext}`))];
  return candidates.some((candidate) => fs.existsSync(candidate));
}
const required = [
  'components/notifications/NotificationBell.tsx',
  'components/notifications/NotificationsInbox.tsx',
  'components/admin/notifications/NotificationsMonitor.tsx',
  'hooks/use-user-notification-realtime.ts',
  'hooks/use-notifications.ts',
  'types/notifications.ts',
  'components/AppShell.tsx',
  'components/navbar/navbar.tsx',
  'components/navbar/UserMenu.tsx',
  'components/admin/admin-sidebar.tsx',
  'app/(public)/notifications/page.tsx',
  'app/admin/notifications/page.tsx',
  'services/endpoint-inventory.ts',
  'hooks/index.ts',
];
const importCheckFiles = new Set(required.map((file) => path.join(root, file)));
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const kind = file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, kind);
  for (const diagnostic of parsed.parseDiagnostics) {
    const pos = parsed.getLineAndCharacterOfPosition(diagnostic.start || 0);
    syntaxIssues.push({ file: path.relative(root, file), line: pos.line + 1, message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n') });
  }
  if (importCheckFiles.has(file)) {
    const importPattern = /(?:from\s*|import\s*\()(['\"])([^'\"]+)\1/g;
    let match;
    while ((match = importPattern.exec(source))) {
      const specifier = match[2];
      if ((specifier.startsWith('@/') || specifier.startsWith('.')) && !localImportExists(file, specifier)) {
        localImportIssues.push({ file: path.relative(root, file), specifier });
      }
    }
  }
}
const missing = required.filter((p) => !fs.existsSync(path.join(root, p)));
const checks = [];
const hookIndex = fs.readFileSync(path.join(root, 'hooks/index.ts'), 'utf8');
checks.push({ name: 'realtime hook exported', pass: hookIndex.includes("from './use-user-notification-realtime'") });
const appShell = fs.readFileSync(path.join(root, 'components/AppShell.tsx'), 'utf8');
checks.push({ name: 'realtime hook mounted globally', pass: appShell.includes('useUserNotificationRealtime();') });
const navbar = fs.readFileSync(path.join(root, 'components/navbar/navbar.tsx'), 'utf8');
checks.push({ name: 'notification bell mounted in navbar', pass: navbar.includes('<NotificationBell />') });
const inventory = fs.readFileSync(path.join(root, 'services/endpoint-inventory.ts'), 'utf8');
for (const name of ['useNotificationsMonitorQuery','useNotificationsQuery','useUnreadNotificationCountQuery','useMarkAllNotificationsReadMutation','useMarkNotificationReadMutation','useNotificationPreferencesQuery','useUpdateNotificationPreferencesMutation']) {
  checks.push({ name: `endpoint inventory maps ${name}`, pass: inventory.includes(`"hook":"${name}"`) });
}
const readHook = fs.readFileSync(path.join(root, 'hooks/use-notifications.ts'), 'utf8');
checks.push({ name: 'notification query key supports prefix invalidation', pass: readHook.includes("['notifications', 'list'] as const") });
const realtime = fs.readFileSync(path.join(root, 'hooks/use-user-notification-realtime.ts'), 'utf8');
const socketInventory = fs.readFileSync(path.join(root, 'services/endpoint-inventory.ts'), 'utf8');
checks.push({ name: 'websocket namespace tracked separately from HTTP endpoints', pass: socketInventory.includes("namespace: '/user-notifications'") && socketInventory.includes("'notification:read-all'") });
for (const event of ['notification:ready','notification:new','notification:read','notification:read-all']) {
  checks.push({ name: `realtime handles ${event}`, pass: realtime.includes(event) });
}
const report = {
  scannedFiles: files.length,
  requiredFiles: required.length,
  missingRequiredFiles: missing,
  syntaxErrors: syntaxIssues,
  unresolvedLocalImports: localImportIssues,
  checks,
  passed: syntaxIssues.length === 0 && localImportIssues.length === 0 && missing.length === 0 && checks.every((c) => c.pass),
};
fs.writeFileSync(path.join(__dirname, 'STAGE-4A-VALIDATION.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (!report.passed) process.exitCode = 1;
