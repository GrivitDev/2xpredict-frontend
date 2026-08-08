'use client';

import { useEffect, useState } from 'react';

import { PageHero } from '@/components/dashboard/shared/PageHero';
import { DashboardSection } from '@/components/dashboard/shared/DashboardSection';
import { SectionTitle } from '@/components/dashboard/shared/SectionTitle';

import SubscriptionOverview from '@/components/dashboard/purchases/SubscriptionOverview';
import UpgradeSection from '@/components/dashboard/purchases/UpgradeSection';

import { usePurchases } from '@/hooks/usePurchases';
import { usePlanConfig } from '@/hooks/usePlanConfig';

import GatewayModal from '@/components/pricing/GatewayModal';

import {
  getUpgradePrice,
  type UpgradePriceResponse,
} from '@/services/subscription.service';
import { InternalAds } from '@/components/ads/IntAds/InternalAds';
import { AdPage } from '@/constants/ads/ad-page';
import { AdPosition } from '@/constants/ads/ad-position';

export default function PurchasesPage() {
  const {
    loading,
    subscription,
    plan,
  } = usePurchases();

  const {
    config,
  } = usePlanConfig();

  // =====================================================
  // SUBSCRIPTION STATE
  // =====================================================

  const [selectedPlan, setSelectedPlan] = useState<
    'regular' | 'vip' | null
  >(null);

  // =====================================================
  // VIP UPGRADE STATE
  // =====================================================

  const [upgrade, setUpgrade] = useState<
    'vip' | null
  >(null);

  const [upgradePrice, setUpgradePrice] =
    useState<UpgradePriceResponse | null>(null);

  const [upgradeLoading, setUpgradeLoading] =
    useState(false);

  // =====================================================
  // LOAD VIP UPGRADE ANALYSIS
  // =====================================================

  useEffect(() => {
    if (plan !== 'regular') {
      setUpgradePrice(null);
      return;
    }

    let cancelled = false;

    async function loadUpgradePrice() {
      try {
        setUpgradeLoading(true);

        const data = await getUpgradePrice();

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

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden">

      {/* =====================================================
          PAGE HERO
      ===================================================== */}

      <PageHero
        title="Subscription"
        description="Manage your subscriptions."
      />

      {/* =====================================================
          CURRENT SUBSCRIPTION
      ===================================================== */}

      <DashboardSection>

        <SectionTitle
          title=""
          description=""
        />

        <SubscriptionOverview
          loading={loading}
          subscription={subscription}
          plan={plan}
        />

      </DashboardSection>

      {/* =====================================================
          AVAILABLE PLANS / UPGRADES
      ===================================================== */}

      {config && (
        <DashboardSection>

          <SectionTitle
            title=""
            description=""
          />

          <UpgradeSection
            plan={plan}
            config={config}
            upgradePrice={upgradePrice}
            upgradeLoading={upgradeLoading}
            onUpgrade={async (target) => {

              // =================================================
              // FREE → REGULAR
              // NEW SUBSCRIPTION
              // =================================================

              if (
                plan === 'free' &&
                target === 'regular'
              ) {
                setUpgradePrice(null);
                setSelectedPlan('regular');
                return;
              }

              // =================================================
              // FREE → VIP
              // NEW SUBSCRIPTION
              // =================================================

              if (
                plan === 'free' &&
                target === 'vip'
              ) {
                setUpgradePrice(null);
                setSelectedPlan('vip');
                return;
              }

              // =================================================
              // REGULAR → VIP
              // EXISTING UPGRADE
              // =================================================

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

        </DashboardSection>
      )}

      {/* =====================================================
          SUBSCRIPTION PAYMENT
      ===================================================== */}

      {selectedPlan && config && (
        <GatewayModal
          type="subscription"
          target={selectedPlan}
          amount={
            selectedPlan === 'regular'
              ? config.regularPrice
              : config.vipPrice
          }
          config={config}
          title={`Complete ${selectedPlan.toUpperCase()} Subscription`}
          description="Choose your preferred payment gateway to securely complete your subscription."
          onClose={() => {
            setSelectedPlan(null);
          }}
        />
      )}

      {/* =====================================================
          VIP UPGRADE PAYMENT
      ===================================================== */}

      {upgrade && config && upgradePrice && (
        <GatewayModal
          type="vip_upgrade"
          target="vip"
          amount={upgradePrice.amount}
          config={config}
          title="Upgrade to VIP"
          description="Complete payment to upgrade your membership."
          onClose={() => {
            setUpgrade(null);
          }}
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