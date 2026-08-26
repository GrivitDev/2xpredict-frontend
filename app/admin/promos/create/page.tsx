import PromoForm from '@/components/admin/promos/PromoForm';

export default function CreatePromoPage() {
  return (
    <div
      className="
        space-y-6
        animate-in
        fade-in
        slide-in-from-bottom-4
        duration-500
        sm:space-y-8
      "
    >
      <header>
        <h1
          className="
            text-2xl
            font-bold
            tracking-tight
            sm:text-3xl
          "
        >
          Create Promo
        </h1>

        <p
          className="
            mt-1
            text-s
            text-muted-foreground
            sm:text-base
          "
        >
          Create a new promotional campaign for users.
        </p>
      </header>

      <PromoForm />
    </div>
  );
}