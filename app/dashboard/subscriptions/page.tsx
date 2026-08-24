'use client';

import { useEffect, useState } from 'react';

import GatewayModal from '@/components/pricing/GatewayModal';

import SubscriptionOverview from '@/components/dashboard/purchases/SubscriptionOverview';
import UpgradeSection from '@/components/dashboard/purchases/UpgradeSection';

import { usePurchases } from '@/hooks/usePurchases';
import { usePlanConfig } from '@/hooks/usePlanConfig';
import { useAuth } from '@/providers/auth-provider';

import {
  getUpgradePrice,
  type UpgradePriceResponse,
} from '@/services/subscription.service';

import type { PaymentCurrency } from '@/services/payment-gateway.service';

import { InternalAds } from '@/components/ads/IntAds/InternalAds';
import { AdPage } from '@/constants/ads/ad-page';
import { AdPosition } from '@/constants/ads/ad-position';


// ============================================================
// COMPONENT
// ============================================================

export default function PurchasesPage() {

  const {
    loading,
    subscription,
    plan,
  } = usePurchases();


  const {
    config,
  } = usePlanConfig();


  const {
    user,
  } = useAuth();


  // ============================================================
  // CURRENCY
  // ============================================================

  const currency: PaymentCurrency =
    user?.currency ?? 'USD';


  // ============================================================
  // SUBSCRIPTION STATE
  // ============================================================

  const [
    selectedPlan,
    setSelectedPlan,
  ] = useState<
    'regular' | 'vip' | null
  >(null);


  // ============================================================
  // VIP UPGRADE STATE
  // ============================================================

  const [
    upgrade,
    setUpgrade,
  ] = useState<'vip' | null>(null);


  const [
    upgradePrice,
    setUpgradePrice,
  ] = useState<
    UpgradePriceResponse | null
  >(null);


  const [
    upgradeLoading,
    setUpgradeLoading,
  ] = useState(false);


  // ============================================================
  // LOAD VIP UPGRADE PRICE
  // ============================================================

  useEffect(() => {

    if (plan !== 'regular') {
      return;
    }


    let cancelled = false;


    async function loadUpgradePrice() {

      try {

        setUpgradeLoading(true);


        const data =
          await getUpgradePrice();


        if (cancelled) {
          return;
        }


        if (data.canUpgrade) {

          setUpgradePrice(data);

        } else {

          setUpgradePrice(null);

        }

      } catch (error) {

        if (!cancelled) {

          console.error(
            'Failed to load VIP upgrade price:',
            error,
          );

          setUpgradePrice(null);

        }

      } finally {

        if (!cancelled) {
          setUpgradeLoading(false);
        }

      }

    }


    loadUpgradePrice();


    return () => {
      cancelled = true;
    };

  }, [plan]);


  // ============================================================
  // SUBSCRIPTION PRICE
  // ============================================================

  function getSubscriptionPrice(
    target: 'regular' | 'vip',
  ) {

    if (!config) {
      return 0;
    }


    if (target === 'regular') {

      return currency === 'USD'
        ? config.regularPriceUSD
        : config.regularPrice;

    }


    return currency === 'USD'
      ? config.vipPriceUSD
      : config.vipPrice;

  }


  // ============================================================
  // PAGE
  // ============================================================

  return (

    <div
      className="
        w-full
        min-w-0
        max-w-full
        space-y-5
        overflow-x-hidden
      "
    >

        <InternalAds
          page={AdPage.HOME}
          position={AdPosition.HERO}
        />

      {/* ======================================================
          CURRENT SUBSCRIPTION
      ====================================================== */}

      <section>

        <SubscriptionOverview
          loading={loading}
          subscription={subscription}
          plan={plan}
        />

      </section>


      {/* ======================================================
          AVAILABLE PLANS
      ====================================================== */}

      {config && (

        <section>





          <UpgradeSection
            plan={plan}
            config={config}
            currency={currency}
            upgradePrice={upgradePrice}
            upgradeLoading={upgradeLoading}
            onUpgrade={async (target) => {

              // FREE → REGULAR

              if (
                plan === 'free' &&
                target === 'regular'
              ) {

                setUpgradePrice(null);
                setSelectedPlan('regular');

                return;

              }


              // FREE → VIP

              if (
                plan === 'free' &&
                target === 'vip'
              ) {

                setUpgradePrice(null);
                setSelectedPlan('vip');

                return;

              }


              // REGULAR → VIP

              if (
                plan === 'regular' &&
                target === 'vip'
              ) {

                if (!upgradePrice?.canUpgrade) {
                  return;
                }

                setUpgrade('vip');

              }

            }}
          />

        </section>

      )}


      {/* ======================================================
          NEW SUBSCRIPTION PAYMENT
      ====================================================== */}

      {selectedPlan && config && (

        <GatewayModal
          type="subscription"
          target={selectedPlan}
          amount={getSubscriptionPrice(selectedPlan)}
          currency={currency}
          config={config}
          title={
            `Complete ${selectedPlan.toUpperCase()} Subscription`
          }
          description="
            Choose your preferred payment gateway to securely
            complete your subscription.
          "
          onClose={() => {
            setSelectedPlan(null);
          }}
        />

      )}


      {/* ======================================================
          VIP UPGRADE PAYMENT
      ====================================================== */}

      {upgrade && config && upgradePrice && (

        <GatewayModal
          type="vip_upgrade"
          target="vip"
          amount={upgradePrice.amount}
          currency={currency}
          config={config}
          title="Upgrade to VIP"
          description="
            Complete payment to upgrade your membership.
          "
          onClose={() => {
            setUpgrade(null);
          }}
        />

      )}


      {/* ======================================================
          ADS
      ====================================================== */}

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