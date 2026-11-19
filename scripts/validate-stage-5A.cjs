const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const frontendRoot = path.resolve(__dirname, '..');
const changedFiles = [
  'services/subscriptions.service.ts',
  'services/payments.service.ts',
  'services/payment-gateways.service.ts',
  'services/plan-config.service.ts',
  'services/endpoint-inventory.ts',
  'hooks/use-subscriptions.ts',
  'hooks/use-payments.ts',
  'hooks/use-payment-gateways.ts',
  'hooks/use-plan-config.ts',
  'types/subscriptions.ts',
  'types/payments.ts',
  'types/payment-gateways.ts',
  'types/plan-config.ts',
  'types/billing.ts',
  'types/endpoint-args/payments.ts',
  'types/endpoint-args/payment-gateways.ts',
  'types/endpoint-args/plan-config.ts',
  'components/pricing/PricingSection.tsx',
  'components/pricing/GatewayModal.tsx',
  'components/pricing/PaymentModal.tsx',
  'components/pricing/HomePricingPreview.tsx',
  'components/admin/subscriptions/PaymentsReviewPanel.tsx',
  'components/admin/subscriptions/PlanConfigPanel.tsx',
  'components/admin/subscriptions/BankDetailsPanel.tsx',
  'app/admin/subscriptions/page.tsx',
  'app/(public)/pricing/callback/page.tsx',
  'lib/plan-config.ts',
  'scripts/validate-stage-5A.cjs',
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
  const candidates = ['', '.ts', '.tsx', '.js', '.jsx', '.json', '.d.ts']
    .map((extension) => base + extension);
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
  const parsed = ts.createSourceFile(
    absolute,
    source,
    ts.ScriptTarget.Latest,
    true,
    absolute.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
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
const paymentTypes = read('types/payments.ts');
const paymentGatewayTypes = read('types/payment-gateways.ts');
const planConfigTypes = read('types/plan-config.ts');
const paymentService = read('services/payments.service.ts');
const gatewayService = read('services/payment-gateways.service.ts');
const subscriptionService = read('services/subscriptions.service.ts');
const planConfigService = read('services/plan-config.service.ts');
const gatewayModal = read('components/pricing/GatewayModal.tsx');
const manualPaymentModal = read('components/pricing/PaymentModal.tsx');
const callbackPage = read('app/(public)/pricing/callback/page.tsx');
const paymentHooks = read('hooks/use-payments.ts');
const gatewayHooks = read('hooks/use-payment-gateways.ts');
const subscriptionHooks = read('hooks/use-subscriptions.ts');
const planHooks = read('hooks/use-plan-config.ts');
const adminPaymentPanel = read('components/admin/subscriptions/PaymentsReviewPanel.tsx');
const planPanel = read('components/admin/subscriptions/PlanConfigPanel.tsx');
const bankPanel = read('components/admin/subscriptions/BankDetailsPanel.tsx');
const pricingSection = read('components/pricing/PricingSection.tsx');
const homePricing = read('components/pricing/HomePricingPreview.tsx');
const inventory = read('services/endpoint-inventory.ts');

const checks = [];
const check = (name, pass) => checks.push({ name, pass: Boolean(pass) });

check('Payment services use fixed response types rather than caller-selected generics',
  !/\b(?:create|getMyPayments|approve|reject|pending|all|quotePayment|initializePayment|verifyPayment|getMySubscription|getStatus|getUpgradePrice|get|update):\s*<TResponse/.test(
    paymentService + gatewayService + subscriptionService + planConfigService,
  ));
check('POST /payments body matches backend fields and omits client-supplied currency',
  paymentTypes.includes('export interface CreateManualPaymentPayload') &&
  !/^\s*currency\s*\??\s*:/m.test((paymentTypes.match(/export interface CreateManualPaymentPayload\s*\{([\s\S]*?)\n\}/)?.[1]) || '') &&
  manualPaymentModal.includes('transferReference: transferReference.trim()') &&
  (() => {
    const start = manualPaymentModal.indexOf('await paymentMutation.mutateAsync({');
    const end = manualPaymentModal.indexOf('});', start);
    const requestBlock = start >= 0 && end > start ? manualPaymentModal.slice(start, end + 3) : '';
    return Boolean(requestBlock) && !/\bcurrency\s*:/.test(requestBlock);
  })());
check('Payment quote contract uses backend amount field rather than finalAmount',
  paymentGatewayTypes.includes('amount: number') &&
  !paymentGatewayTypes.includes('finalAmount') &&
  gatewayModal.includes('quote.amount'));
check('Payment status and gateway-initialization enums match backend schema values',
  paymentTypes.includes("'pending' | 'processing' | 'approved' | 'rejected'") &&
  ['not_applicable', 'initializing', 'initialized', 'unknown', 'failed'].every((value) => paymentTypes.includes(`'${value}'`)));
check('Gateway verification models approved, processing, pending and failed outcomes',
  paymentGatewayTypes.includes("'approved' | 'failed' | 'processing' | 'pending'") &&
  callbackPage.includes("result.status === 'pending' || result.status === 'processing'"));
check('Plan configuration update type exposes only backend-editable fields',
  planConfigTypes.includes('export type PlanConfigUpdate') &&
  planConfigTypes.includes('bankDetailsUSD?: Partial<BankDetails>') &&
  !planPanel.includes('as any') && !bankPanel.includes('as any'));
check('Subscription upgrade quote includes actual backend credit and upgrade fields',
  ['daysRemaining', 'credit', 'upgradeCost', 'amount', 'canUpgrade', 'vipUpgrade', 'premiumUpgrade'].every((field) => read('types/subscriptions.ts').includes(field)));
check('Public pricing reads shared React Query plan and subscription hooks',
  pricingSection.includes('usePlanConfigQuery') && pricingSection.includes('useGetStatusQuery') &&
  pricingSection.includes('useGetUpgradePriceQuery') && homePricing.includes('usePlanConfigQuery') &&
  !pricingSection.includes('subscriptionsService') && !homePricing.includes('getPlanConfig'));
check('Payment checkout uses gateway and manual-payment hooks instead of raw service calls',
  gatewayModal.includes('useQuotePaymentMutation') && gatewayModal.includes('useInitializePaymentMutation') &&
  manualPaymentModal.includes('useCreatePaymentMutation') && !manualPaymentModal.includes("api.post('/payments'"));
check('Admin payment review uses separate typed list, approve and reject hooks',
  adminPaymentPanel.includes('usePendingPaymentsQuery') && adminPaymentPanel.includes('useAllPaymentsQuery') &&
  adminPaymentPanel.includes('useApprovePaymentMutation') && adminPaymentPanel.includes('useRejectPaymentMutation') &&
  !adminPaymentPanel.includes('paymentsService'));
check('Admin plan and bank configuration share the same typed plan-config query and mutation',
  planPanel.includes('usePlanConfigQuery') && planPanel.includes('useUpdatePlanConfigMutation') &&
  bankPanel.includes('usePlanConfigQuery') && bankPanel.includes('useUpdatePlanConfigMutation'));
check('Successful payment verification invalidates payment and subscription caches',
  gatewayHooks.includes("client.invalidateQueries({ queryKey: paymentsQueryKeys.all })") &&
  gatewayHooks.includes("client.invalidateQueries({ queryKey: ['subscriptions'] })"));
check('Payment decisions invalidate payment records, with approvals also refreshing entitlements',
  paymentHooks.includes('await invalidate(true)') && paymentHooks.includes('await invalidate();'));
check('Subscription, payment and plan-config query keys are centralized',
  subscriptionHooks.includes("all: ['subscriptions'] as const") &&
  paymentHooks.includes("all: ['payments'] as const") &&
  planHooks.includes("['plan-config'] as const"));
check('Endpoint inventory maps all payment and subscription routes to existing hooks',
  inventory.includes('useVerifyPaymentMutation') && inventory.includes('useGetEntitlementsQuery') &&
  inventory.includes('usePendingPaymentsQuery') && inventory.includes('useUpdatePlanConfigMutation'));
check('Email verification requirements are reflected in payment endpoint metadata',
  inventory.includes('"handler":"initializePayment"') &&
  inventory.includes('"auth":"jwt+email-verified"'));

const report = {
  scannedTypeScriptFiles: allSourceFiles.length,
  changedFiles: changedFiles.length,
  syntaxErrors,
  unresolvedLocalImports,
  missingFiles,
  checks,
  passed: syntaxErrors.length === 0 && unresolvedLocalImports.length === 0 && missingFiles.length === 0 && checks.every((item) => item.pass),
};
fs.writeFileSync(path.join(__dirname, 'STAGE-5A-VALIDATION.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (!report.passed) process.exitCode = 1;
