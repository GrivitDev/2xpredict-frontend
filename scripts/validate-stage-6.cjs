const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const files = [
  'types/monitoring.ts',
  'hooks/use-monitoring.ts',
  'components/admin/system-monitor/system-monitor.tsx',
  'components/admin/system-monitor/system-monitor-coverage.tsx',
  'components/admin/system-monitor/prediction-engine/PredictionEngineAdmin.tsx',
  'components/admin/system-monitor/prediction-engine/PredictionMarketCoverage.tsx',
];
const required = [
  ['types/monitoring.ts', 'SystemMonitorCoverageResponse'],
  ['hooks/use-monitoring.ts', 'useSystemMonitorCoverage'],
  ['components/admin/system-monitor/system-monitor.tsx', "moduleId === 'notifications'"],
  ['components/admin/system-monitor/system-monitor.tsx', "systemTab === 'coverage'"],
  ['components/admin/system-monitor/system-monitor-coverage.tsx', '/admin/system-monitor/coverage'],
  ['components/admin/system-monitor/prediction-engine/PredictionEngineAdmin.tsx', "['coverage', 'Market coverage']"],
  ['components/admin/system-monitor/prediction-engine/PredictionMarketCoverage.tsx', 'useGetMarketCoverageInventoryQuery'],
  ['components/admin/system-monitor/prediction-engine/PredictionMarketCoverage.tsx', 'useGetMarketCoverageAuditQuery'],
  ['components/admin/system-monitor/prediction-engine/PredictionMarketCoverage.tsx', 'Read-only'],
];
const errors = [];
const unresolvedImports = [];
for (const relative of files) {
  const full = path.join(root, relative);
  if (!fs.existsSync(full)) {
    errors.push(`Missing required file: ${relative}`);
    continue;
  }
  const source = fs.readFileSync(full, 'utf8');
  const importPattern = /(?:import|export)\s+(?:type\s+)?(?:[^'";]*?\s+from\s+)?['"]([^'"]+)['"]/g;
  let match;
  while ((match = importPattern.exec(source))) {
    const specifier = match[1];
    if (!specifier.startsWith('@/') && !specifier.startsWith('.')) continue;
    const base = specifier.startsWith('@/')
      ? path.join(root, specifier.slice(2))
      : path.resolve(path.dirname(full), specifier);
    const candidates = [base, ...['.ts', '.tsx', '.js', '.jsx', '.json'].map((ext) => `${base}${ext}`), path.join(base, 'index.ts'), path.join(base, 'index.tsx')];
    if (!candidates.some((candidate) => fs.existsSync(candidate))) unresolvedImports.push(`${relative} -> ${specifier}`);
  }
}
for (const [relative, token] of required) {
  const full = path.join(root, relative);
  if (!fs.existsSync(full) || !fs.readFileSync(full, 'utf8').includes(token)) errors.push(`Missing integration contract: ${relative} contains ${token}`);
}
if (unresolvedImports.length) errors.push(...unresolvedImports.map((item) => `Unresolved import: ${item}`));
const result = {
  stage: '6',
  filesChecked: files.length,
  requiredContractsChecked: required.length,
  missingFilesOrContracts: errors,
  unresolvedLocalImports: unresolvedImports,
  passed: errors.length === 0,
};
console.log(JSON.stringify(result, null, 2));
if (!result.passed) process.exit(1);
