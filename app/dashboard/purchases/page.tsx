'use client';

import { useState } from 'react';

import {PageHero} from '@/components/dashboard/shared/PageHero';
import {DashboardSection} from '@/components/dashboard/shared/DashboardSection';
import {SectionTitle } from '@/components/dashboard/shared/SectionTitle';

import TransactionSummary from '@/components/dashboard/purchases/TransactionSummary';
import TransactionTable from '@/components/dashboard/purchases/TransactionTable';

import PaymentModal from '@/components/pricing/PaymentModal';

import { usePurchases } from '@/hooks/usePurchases';
import { usePlanConfig } from '@/hooks/usePlanConfig';



export default function PurchasesPage(){


  const {
    loading,
    payments,
  } = usePurchases();



  const {
    config,
  } = usePlanConfig();




  const [upgrade,setUpgrade] =
    useState<
      'regular' | 'vip' | null
    >(null);





  return (

      <div className="w-full min-w-0 max-w-full overflow-x-hidden">

      <PageHero

        title="Purchases"

        description="
          Manage your subscriptions and view all your payment activities.
        "

      />


      <DashboardSection>

        <SectionTitle

          title=""

          description="
            Overview of your transaction history.
          "

        />


        <TransactionSummary

          payments={payments}

        />

      </DashboardSection>







      <DashboardSection>

        <SectionTitle

          title="Transaction History"

          description="
        
          "

        />


        <TransactionTable

          loading={loading}

          payments={payments}

        />

      </DashboardSection>








      {
        upgrade && config && (

          <PaymentModal

            type="vip_upgrade"

            target={upgrade}

            amount={
              upgrade === 'regular'
                ? config.regularPrice
                : config.vipPrice
            }

            config={config}

            title={
              `Upgrade to ${
                upgrade.toUpperCase()
              }`
            }

            description="
              Complete payment to upgrade your membership.
            "

            onClose={()=>
              setUpgrade(null)
            }

          />

        )
      }


   </div>

  );

}