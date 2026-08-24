'use client';

import { useState } from 'react';

import TransactionSummary from '@/components/dashboard/purchases/TransactionSummary';
import TransactionTable from '@/components/dashboard/purchases/TransactionTable';

import PaymentModal from '@/components/pricing/PaymentModal';

import { usePurchases } from '@/hooks/usePurchases';
import { usePlanConfig } from '@/hooks/usePlanConfig';

import type { PaymentCurrency } from '@/services/payment-gateway.service';
import { InternalAds } from '@/components/ads/IntAds/InternalAds';
import { AdPage, AdPosition } from '@/types/ad';


// ============================================================
// COMPONENT
// ============================================================

export default function PurchasesPage() {

  const {
    loading,
    payments,
  } = usePurchases();


  const {
    config,
  } = usePlanConfig();


  const [upgrade, setUpgrade] =
    useState<
      'regular' | 'vip' | null
    >(null);


  const currency: PaymentCurrency =
    'NGN';


  return (

    <div
      className="
        w-full
        min-w-0
        max-w-full
        space-y-3
        overflow-x-hidden
      "
    >

        <InternalAds
          page={AdPage.HOME}
          position={AdPosition.HERO}
        />
      {/* Transaction Summary */}

      <TransactionSummary
        payments={payments} 
        currency={'NGN'}      />


      {/* Transactions */}

      <TransactionTable
        loading={loading}
        payments={payments}
      />


      {/* Upgrade Modal */}

      {upgrade && config && (

        <PaymentModal

          type="vip_upgrade"

          target={upgrade}

          amount={
            upgrade === 'regular'
              ? config.regularPrice
              : config.vipPrice
          }

          config={config}

          currency={currency}

          title={
            `Upgrade to ${upgrade.toUpperCase()}`
          }

          description="
            Complete payment to upgrade your membership.
          "

          onClose={() =>
            setUpgrade(null)
          }

        />

      )}

            <InternalAds
        page={AdPage.HOME}
        position={AdPosition.BOTTOM}
      />

      <InternalAds
        page={AdPage.HOME}
        position={AdPosition.POPUP}
      />

    </div>

  );

}