'use client';

import { useEffect, useState } from 'react';

import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Settings,
  Sparkles,
  Wallet,
} from 'lucide-react';

import PlanConfigPanel from '@/components/admin/subscriptions/PlanConfigPanel';
import PaymentsReviewPanel from '@/components/admin/subscriptions/PaymentsReviewPanel';
import BankDetailsPanel from '@/components/admin/subscriptions/BankDetailsPanel';

const metrics = [
  {
    title: 'Subscription Plans',
    value: 'Regular + VIP',
    icon: CreditCard,
  },
  {
    title: 'Payment Review',
    value: 'Needs Attention',
    icon: Wallet,
  },
  {
    title: 'Configuration',
    value: 'Managed',
    icon: Settings,
  },
];

export default function AdminSubscriptionsPage() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setToken(localStorage.getItem('token') || '');
    setLoading(false);
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  if (!token) {
    return <SessionRequired />;
  }

  return (
    <div className="relative space-y-8 overflow-hidden">
      {/* Ambient Background */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          -z-10
          bg-gradient-to-br
          from-primary/10
          via-transparent
          to-purple-500/10
        "
      />

      {/* Header */}

      <header
        className="
          flex
          flex-col
          gap-5
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >
        <div>
          <div
            className="
              mb-3
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              bg-primary/10
              px-3
              py-1.5
              text-xs
              font-medium
              text-primary
            "
          >
            <Sparkles className="h-3.5 w-3.5" />

            Subscription Control Center
          </div>

          <h1
            className="
              text-2xl
              font-bold
              tracking-tight
              sm:text-3xl
            "
          >
            Subscription Management
          </h1>

          <p
            className="
              mt-2
              max-w-2xl
              text-sm
              leading-6
              text-muted-foreground
            "
          >
            Control pricing, payments, banking information,
            and subscriber access from one unified workspace.
          </p>
        </div>

        <SystemStatus />
      </header>

      {/* Action Center */}

      <div
        className="
          rounded-3xl
          border
          bg-card/70
          p-5
          backdrop-blur
          sm:p-6
        "
      >
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-destructive/10 p-2.5">
            <AlertCircle className="h-5 w-5 text-destructive" />
          </div>

          <div>
            <h3 className="font-semibold">
              Admin Attention Required
            </h3>

            <p className="mt-0.5 text-sm text-muted-foreground">
              Pending payment approvals and configuration updates
              will appear here.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics */}

      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="
                group
                rounded-3xl
                border
                bg-card/70
                p-5
                backdrop-blur
                transition
                hover:-translate-y-0.5
                hover:shadow-lg
              "
            >
              <Icon className="mb-4 h-6 w-6 text-primary" />

              <p className="text-sm text-muted-foreground">
                {item.title}
              </p>

              <h3 className="mt-1 text-lg font-bold">
                {item.value}
              </h3>
            </div>
          );
        })}
      </div>

      {/* Plan Configuration */}

      <section className="space-y-4">
        <SectionTitle
          title="Plan Configuration"
          description="Manage pricing and subscription duration."
        />

        <PlanConfigPanel token={token} />
      </section>

      {/* Bank Configuration */}

      <section className="space-y-4">
        <SectionTitle
          title="Bank Configuration"
          description="Manage payment instructions visible to users."
        />

        <BankDetailsPanel token={token} />
      </section>

      {/* Payment Verification */}

      <section className="space-y-4">
        <SectionTitle
          title="Payment Verification"
          description="Review incoming subscription payments."
        />

        <PaymentsReviewPanel token={token} />
      </section>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="
            h-24
            animate-pulse
            rounded-2xl
            bg-muted
          "
        />
      ))}
    </div>
  );
}

function SessionRequired() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div
        className="
          w-full
          max-w-md
          rounded-2xl
          border
          bg-card
          p-8
          text-center
        "
      >
        <AlertCircle
          className="
            mx-auto
            mb-4
            h-10
            w-10
            text-destructive
          "
        />

        <h2 className="text-xl font-semibold">
          Admin Session Required
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Please login again to continue.
        </p>
      </div>
    </div>
  );
}

function SystemStatus() {
  return (
    <div
      className="
        flex
        w-fit
        items-center
        gap-3
        rounded-2xl
        border
        bg-card/70
        px-4
        py-3
        backdrop-blur
      "
    >
      <CheckCircle2 className="h-5 w-5 text-green-500" />

      <div>
        <p className="text-xs text-muted-foreground">
          Subscription System
        </p>

        <p className="text-sm font-semibold">
          Operational
        </p>
      </div>
    </div>
  );
}

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight">
        {title}
      </h2>

      <p className="mt-1 text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}