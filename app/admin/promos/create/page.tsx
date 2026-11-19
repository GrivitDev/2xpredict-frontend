import PromoForm from '@/components/admin/promos/PromoForm';
export default function CreatePromoPage() {
  return <main className="mx-auto w-full max-w-[1400px] space-y-3 p-2 sm:p-3"><header><h1 className="text-lg font-semibold tracking-tight">Create promotion</h1><p className="mt-0.5 text-xs text-muted-foreground">Configure a discount, reward campaign or discount-plus-points bundle.</p></header><PromoForm /></main>;
}
