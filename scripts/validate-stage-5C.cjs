const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const frontendRoot = path.resolve(__dirname, '..');
const changedFiles = [
  'app/(public)/pricing/callback/page.tsx',
  'components/pricing/GatewayModal.tsx',
  'hooks/use-payment-gateways.ts',
];
const supportFiles = [
  'hooks/use-payments.ts',
  'hooks/use-subscriptions.ts',
  'providers/auth-provider.tsx',
  'services/payment-gateways.service.ts',
  'types/payment-gateways.ts',
  'types/payments.ts',
  'types/subscriptions.ts',
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
  const candidates = ['', '.ts', '.tsx', '.js', '.jsx', '.json', '.d.ts'].map((extension) => base + extension);
  for (const extension of ['.ts', '.tsx', '.js', '.jsx', '.d.ts']) candidates.push(path.join(base, `index${extension}`));
  return candidates.some((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
}
const sourceFiles = walk(frontendRoot).filter((file) => /\.(ts|tsx)$/.test(file));
const syntaxErrors = [];
const unresolvedLocalImports = [];
for (const absolute of sourceFiles) {
  const parsed = ts.createSourceFile(absolute, fs.readFileSync(absolute, 'utf8'), ts.ScriptTarget.Latest, true, absolute.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  for (const diagnostic of parsed.parseDiagnostics) {
    const position = parsed.getLineAndCharacterOfPosition(diagnostic.start || 0);
    syntaxErrors.push({ file: path.relative(frontendRoot, absolute), line: position.line + 1, message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n') });
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
const read = (file) => fs.readFileSync(path.join(frontendRoot, file), 'utf8');
const callback = read(changedFiles[0]);
const gatewayModal = read(changedFiles[1]);
const gatewayHooks = read(changedFiles[2]);
const checks = [];
const check = (name, pass) => checks.push({ name, pass: Boolean(pass) });
check('Paystack callback parses reference and trxref and validates gateway', callback.includes("params.get('reference') ?? params.get('trxref')") && callback.includes("gatewayParam.toLowerCase() !== 'paystack'") && callback.includes('paymentReference.length > 120'));
check('callback waits for authentication hydration before verification', callback.includes('authLoading') && callback.includes('authenticated') && callback.includes('autoVerifiedReferenceRef'));
check('callback distinguishes approved, processing, pending and failed results', callback.includes("result.status === 'approved'") && callback.includes("result.status === 'processing'") && callback.includes("result.status === 'pending'") && callback.includes("setStatus('failed')"));
check('temporary verification errors are not treated as declined payments', callback.includes('// A network or server error is not proof') && callback.includes("setStatus('pending')"));
check('401/403 verification errors require sign-in rather than starting a second payment', callback.includes('httpStatus === 401 || httpStatus === 403') && callback.includes('Sign in to verify payment'));
check('processing state refreshes payment and subscription status', callback.includes('useGetMyPaymentsQuery') && callback.includes('useGetStatusQuery') && callback.includes('refetchInterval: status === \'processing\'') && callback.includes('refreshAccountState'));
check('confirmed payment refreshes caches through the verification mutation', gatewayHooks.includes('client.invalidateQueries({ queryKey: paymentsQueryKeys.all })') && gatewayHooks.includes('client.invalidateQueries({ queryKey: subscriptionsQueryKeys.all })'));
check('payment gateway query keys are account scoped', gatewayHooks.includes("initialization: (reference: string, principal: string)") && gatewayHooks.includes("verification: (reference: string, principal: string)") && gatewayHooks.includes('!loading && authenticated'));
check('new payment initialization invalidates payment history', gatewayHooks.includes('useInitializePaymentMutation') && gatewayHooks.indexOf('client.invalidateQueries({ queryKey: paymentsQueryKeys.all })') < gatewayHooks.indexOf('export function usePaymentInitializationQuery'));
check('Paystack checkout URL is HTTPS and restricted to Paystack hosts', gatewayModal.includes("url.protocol === 'https:'") && gatewayModal.includes("url.hostname.endsWith('.paystack.com')"));
check('existing active payment reference is exposed without starting another payment', gatewayModal.includes('existingReference') && gatewayModal.includes('An existing payment is already open') && gatewayModal.includes('disabled={paymentUnavailable}') && gatewayModal.includes('Open account billing'));
check('new checkout redirect requires both a valid reference and trusted authorization URL', gatewayModal.includes('!data.reference') && gatewayModal.includes('!isSafePaystackUrl(data.authorizationUrl)') && gatewayModal.includes('window.location.assign(data.authorizationUrl)'));

const missingFiles = [...changedFiles, ...supportFiles].filter((file) => !fs.existsSync(path.join(frontendRoot, file)));
const report = {
  scannedTypeScriptFiles: sourceFiles.length,
  changedFiles: changedFiles.length,
  requiredSupportFiles: supportFiles.length,
  syntaxErrors,
  unresolvedLocalImports,
  missingFiles,
  checks,
  passed: syntaxErrors.length === 0 && unresolvedLocalImports.length === 0 && missingFiles.length === 0 && checks.every((item) => item.pass),
};
fs.mkdirSync(path.join(frontendRoot, 'scripts'), { recursive: true });
fs.writeFileSync(path.join(frontendRoot, 'scripts', 'STAGE-5C-VALIDATION.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (!report.passed) process.exitCode = 1;
