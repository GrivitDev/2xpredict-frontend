'use client';

import { useEffect, useState } from 'react';

import {
  CreditCard,
  Settings,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

import PlanConfigPanel from '@/components/admin/subscriptions/PlanConfigPanel';
import PaymentsReviewPanel from '@/components/admin/subscriptions/PaymentsReviewPanel';
import BankDetailsPanel from '@/components/admin/subscriptions/BankDetailsPanel';


export default function AdminSubscriptionsPage() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const storedToken =
      localStorage.getItem('token') || '';

    setToken(storedToken);
    setLoading(false);

  }, []);



  if (loading) {
    return (
      <div className="space-y-6 p-6">

        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-24 animate-pulse rounded-2xl bg-muted"
          />
        ))}

      </div>
    );
  }



  if (!token) {
    return (
      <div className="
        flex min-h-[400px]
        items-center justify-center
      ">
        <div className="
          rounded-2xl
          border
          bg-card
          p-8
          text-center
        ">
          <AlertCircle className="
            mx-auto mb-4
            h-10 w-10
            text-destructive
          "/>

          <h2 className="
            text-xl
            font-semibold
          ">
            Admin Session Required
          </h2>

          <p className="
            mt-2
            text-sm
            text-muted-foreground
          ">
            Please login again to continue.
          </p>

        </div>
      </div>
    );
  }



  return (
    <div className="
      relative
      space-y-10
      overflow-hidden
      p-6
    ">


      {/* Ambient Background */}
      <div className="
        pointer-events-none
        absolute
        inset-0
        -z-10
        bg-gradient-to-br
        from-primary/10
        via-transparent
        to-purple-500/10
      "/>



      {/* Header */}
      <div className="
        flex
        flex-col
        gap-4
        lg:flex-row
        lg:items-center
        lg:justify-between
      ">

        <div>

          <div className="
            mb-3
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            bg-primary/10
            px-4
            py-2
            text-sm
            text-primary
          ">
            <Sparkles className="h-4 w-4"/>

            Subscription Control Center
          </div>


          <h1 className="
            text-4xl
            font-bold
            tracking-tight
          ">
            Subscription Management
          </h1>


          <p className="
            mt-3
            max-w-2xl
            text-muted-foreground
          ">
            Control pricing, payments, banking information,
            and subscriber access from one unified workspace.
          </p>

        </div>



        {/* System Status */}
        <div className="
          flex
          items-center
          gap-3
          rounded-2xl
          border
          bg-card/70
          px-5
          py-4
          backdrop-blur
        ">

          <CheckCircle2 className="
            h-6
            w-6
            text-green-500
          "/>

          <div>
            <p className="text-sm text-muted-foreground">
              Subscription System
            </p>

            <p className="
              font-semibold
            ">
              Operational
            </p>
          </div>

        </div>

      </div>




      {/* Action Center */}
      <div className="
        rounded-3xl
        border
        bg-card/70
        p-6
        backdrop-blur
      ">

        <div className="
          flex
          items-center
          gap-3
        ">

          <div className="
            rounded-xl
            bg-destructive/10
            p-3
          ">
            <AlertCircle className="
              h-6
              w-6
              text-destructive
            "/>
          </div>


          <div>

            <h3 className="
              font-semibold
            ">
              Admin Attention Required
            </h3>

            <p className="
              text-sm
              text-muted-foreground
            ">
              Pending payment approvals and configuration
              updates will appear here.
            </p>

          </div>

        </div>

      </div>





      {/* Metrics */}
      <div className="
        grid
        gap-5
        md:grid-cols-3
      ">


        {[
          {
            title:'Subscription Plans',
            value:'Regular + VIP',
            icon:CreditCard,
          },
          {
            title:'Payment Review',
            value:'Needs Attention',
            icon:Wallet,
          },
          {
            title:'Configuration',
            value:'Managed',
            icon:Settings,
          },

        ].map((item)=>{

          const Icon=item.icon;

          return (
            <div
              key={item.title}
              className="
                group
                rounded-3xl
                border
                bg-card/70
                p-6
                backdrop-blur
                transition
                hover:-translate-y-1
                hover:shadow-xl
              "
            >

              <Icon className="
                mb-5
                h-7
                w-7
                text-primary
              "/>


              <p className="
                text-sm
                text-muted-foreground
              ">
                {item.title}
              </p>


              <h3 className="
                mt-2
                text-xl
                font-bold
              ">
                {item.value}
              </h3>

            </div>
          );

        })}

      </div>





      {/* Panels */}

      <section className="space-y-4">

        <SectionTitle
          title="Plan Configuration"
          description="Manage pricing and subscription duration."
        />

        <PlanConfigPanel token={token}/>

      </section>



      <section className="space-y-4">

        <SectionTitle
          title="Bank Configuration"
          description="Manage payment instructions visible to users."
        />

        <BankDetailsPanel token={token}/>

      </section>



      <section className="space-y-4">

        <SectionTitle
          title="Payment Verification"
          description="Review incoming subscription payments."
        />

        <PaymentsReviewPanel token={token}/>

      </section>


    </div>
  );
}




function SectionTitle({
  title,
  description,
}:{
  title:string;
  description:string;
}) {

  return (
    <div>

      <h2 className="
        text-2xl
        font-semibold
      ">
        {title}
      </h2>

      <p className="
        text-sm
        text-muted-foreground
      ">
        {description}
      </p>

    </div>
  );
}