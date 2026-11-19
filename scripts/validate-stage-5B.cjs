const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const frontendRoot = path.resolve(__dirname, '..');
const changedFiles = [
  'app/(public)/profile/page.tsx',
  'components/dashboard/profile/ProfileHero.tsx',
  'app/admin/users/[id]/page.tsx',
  'components/account/AccountBillingPanel.tsx',
  'components/admin/subscriptions/PaymentsReviewPanel.tsx',
  'hooks/use-admin-users.ts',
  'hooks/use-payments.ts',
  'hooks/use-subscriptions.ts',
  'services/admin-users.service.ts',
];
const requiredSupport = [
  'services/payments.service.ts',
  'services/payment-gateways.service.ts',
  'services/subscriptions.service.ts',
  'hooks/use-payment-gateways.ts',
  'types/payments.ts',
  'types/payment-gateways.ts',
  'types/subscriptions.ts',
  'types/common.ts',
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

const allSourceFiles = walk(frontendRoot).filter((file) => /\.(ts|tsx)$/.test(file));
const syntaxErrors = [];
const unresolvedLocalImports = [];
for (const absolute of allSourceFiles) {
  const source = fs.readFileSync(absolute, 'utf8');
  const isTsx = absolute.endsWith('.tsx');
  const parsed = ts.createSourceFile(absolute, source, ts.ScriptTarget.Latest, true, isTsx ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
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
const missingFiles = [...changedFiles, ...requiredSupport].filter((file) => !fs.existsSync(path.join(frontendRoot, file)));
const read = (file) => fs.readFileSync(path.join(frontendRoot, file), 'utf8');
const paymentHook = read('hooks/use-payments.ts');
const subscriptionHook = read('hooks/use-subscriptions.ts');
const accountBilling = read('components/account/AccountBillingPanel.tsx');
const adminUserService = read('services/admin-users.service.ts');
const adminUserHooks = read('hooks/use-admin-users.ts');
const userDetail = read('app/admin/users/[id]/page.tsx');
const paymentReview = read('components/admin/subscriptions/PaymentsReviewPanel.tsx');
const paymentGatewayService = read('services/payment-gateways.service.ts');
const inventory = read('services/endpoint-inventory.ts');

const checks = [];
const check = (name, pass) => checks.push({ name, pass: Boolean(pass) });
check('profile page mounts the account billing and payment history panel', read('app/(public)/profile/page.tsx').includes('<AccountBillingPanel enabled={Boolean(user)} />'));
check('payment history uses the authenticated /payments/me query', accountBilling.includes('useGetMyPaymentsQuery') && paymentHook.includes('paymentsQueryKeys.mine(principal)'));
check('payment history cache is scoped to the current account', paymentHook.includes('Boolean(user || token)') && paymentHook.includes('mine: (principal: string)'));
check('subscription status cache is scoped and protected from anonymous requests', subscriptionHook.includes('authenticated && options?.enabled !== false'));
check('public subscription entitlements remain available to anonymous users', subscriptionHook.includes('enabled: !loading && options?.enabled !== false'));
check('profile shows current subscription dates, days remaining and backend entitlements', accountBilling.includes('expiryDate') && accountBilling.includes('daysRemaining') && accountBilling.includes('entitlements.advertising'));
check('Paystack initialization recovery calls the user-owned initialization endpoint', paymentGatewayService.includes('/payment-gateways/paystack/initialization/:reference') && accountBilling.includes('usePaymentInitializationQuery'));
check('Paystack continuation only uses a confirmed, trusted HTTPS Paystack URL', accountBilling.includes("initializationQuery.data?.initializationStatus === 'initialized'") && accountBilling.includes('isSafePaystackUrl(authorizationUrl)'));
check('payment verification handles approved, processing, pending and failed results', accountBilling.includes("result.status === 'approved'") && accountBilling.includes("result.status === 'processing'") && accountBilling.includes("result.status === 'pending'"));
check('admin payment history is fetched from the dedicated paginated endpoint', adminUserService.includes('/admin/users/:id/payments') && adminUserHooks.includes('useAdminUserPayments'));
check('admin subscription history is fetched from the dedicated paginated endpoint', adminUserService.includes('/admin/users/:id/subscriptions') && adminUserHooks.includes('useAdminUserSubscriptions'));
check('admin user detail renders paginated payment and subscription histories', userDetail.includes('useAdminUserPayments') && userDetail.includes('useAdminUserSubscriptions') && userDetail.includes('HistoryPagination'));
check('admin payment history tolerates optional pagination metadata', userDetail.includes('pagination?.pages') && userDetail.includes('pagination?.total'));
check('Paystack reconciliation uses the existing reference and does not create a new payment', paymentReview.includes('useReconcilePaymentMutation') && paymentReview.includes("reconcile.mutate({ path: { reference } })") && paymentReview.includes('will not initiate a new payment'));
check('manual approve/reject actions are separated from Paystack reconciliation', paymentReview.includes("gateway !== 'manual' || status !== 'pending'"));
check('reconciliation errors can be cleared and retried', paymentReview.includes('reconcile.reset()'));
check('history routes are represented in the endpoint inventory', inventory.includes('useAdminUserPayments') && inventory.includes('useAdminUserSubscriptions'));
check('admin history services and hooks contain no duplicate import declarations', (adminUserService.match(/import type \{ LimitPageResult \}/g) || []).length === 1 && (adminUserHooks.match(/import type \{ LimitPageResult \}/g) || []).length === 1);

const report = {
  scannedTypeScriptFiles: allSourceFiles.length,
  changedFiles: changedFiles.length,
  requiredSupportFiles: requiredSupport.length,
  syntaxErrors,
  unresolvedLocalImports,
  missingFiles,
  checks,
  passed: syntaxErrors.length === 0 && unresolvedLocalImports.length === 0 && missingFiles.length === 0 && checks.every((item) => item.pass),
};
fs.writeFileSync(path.join(__dirname, 'STAGE-5B-VALIDATION.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (!report.passed) process.exitCode = 1;
