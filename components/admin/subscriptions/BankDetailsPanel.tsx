'use client';

import { useEffect, useState } from 'react';

import {
  AlertTriangle,
  CheckCircle2,
  Globe2,
  Landmark,
  Loader2,
  Save,
} from 'lucide-react';

import toast from 'react-hot-toast';

import {
  getPlanConfig,
  updatePlanConfig,
} from '@/services/admin-plan-config.service';

import type {
  BankDetails,
  PlanConfig,
} from '@/types/plan-config';

const EMPTY_BANK_DETAILS: BankDetails = {
  bankName: '',
  accountName: '',
  accountNumber: '',
  instructions: '',
};

type Currency = 'NGN' | 'USD';

export default function BankDetailsPanel({
  token,
}: {
  token: string;
}) {
  const [config, setConfig] =
    useState<PlanConfig | null>(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] =
    useState<Currency | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadConfig = async () => {
      try {
        const data = await getPlanConfig(token);

        if (mounted) {
          setConfig(data);
        }
      } catch {
        if (mounted) {
          toast.error(
            'Unable to load bank configuration',
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadConfig();

    return () => {
      mounted = false;
    };
  }, [token]);

  const updateBankField = (
    currency: Currency,
    key: keyof BankDetails,
    value: string,
  ) => {
    setConfig((prev) => {
      if (!prev) return prev;

      const field =
        currency === 'NGN'
          ? 'bankDetails'
          : 'bankDetailsUSD';

      return {
        ...prev,
        [field]: {
          ...prev[field],
          [key]: value,
        },
      };
    });
  };

  const save = async (currency: Currency) => {
    if (!config) return;

    try {
      setSaving(currency);

      await updatePlanConfig(token, {
        ...(currency === 'NGN'
          ? {
              bankDetails:
                config.bankDetails,
            }
          : {
              bankDetailsUSD:
                config.bankDetailsUSD,
            }),
      });

      toast.success(
        currency === 'NGN'
          ? 'Nigerian bank details updated'
          : 'USD bank details updated',
      );
    } catch {
      toast.error(
        'Failed to update bank details',
      );
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return <BankDetailsSkeleton />;
  }

  if (!config) {
    return (
      <div
        role="alert"
        className="
          rounded-lg
          border
          border-border/60
          bg-card
          px-4
          py-4
          text-xs
          text-muted-foreground
        "
      >
        Bank configuration could not be loaded.
      </div>
    );
  }

  return (
    <section
      aria-labelledby="bank-details-title"
      className="
        overflow-hidden
        rounded-lg
        border
        border-border/60
        bg-card
      "
    >
      <header
        className="
          flex
          items-center
          gap-3
          border-b
          border-border/60
          px-4
          py-3.5
        "
      >
        <div
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-md
            bg-primary/10
            text-primary
          "
        >
          <Landmark
            aria-hidden="true"
            className="h-4 w-4"
          />
        </div>

        <div className="min-w-0">
          <h3
            id="bank-details-title"
            className="
              text-sm
              font-semibold
              tracking-tight
            "
          >
            Bank Transfer Configuration
          </h3>

          <p
            className="
              mt-0.5
              text-[11px]
              text-muted-foreground
            "
          >
            Configure payment details for
            Nigerian and international subscribers.
          </p>
        </div>
      </header>

      <div
        className="
          grid
          gap-3
          p-3
          lg:grid-cols-2
        "
      >
        <BankEditor
          title="Nigeria Bank Details"
          description="Used for ₦ subscription payments."
          icon={
            <span
              aria-hidden="true"
              className="text-sm font-semibold"
            >
              ₦
            </span>
          }
          details={
            config.bankDetails ??
            EMPTY_BANK_DETAILS
          }
          saving={saving === 'NGN'}
          onChange={(key, value) =>
            updateBankField(
              'NGN',
              key,
              value,
            )
          }
          onSave={() => save('NGN')}
        />

        <BankEditor
          title="International Bank Details"
          description="Used for $ subscription payments."
          icon={
            <Globe2
              aria-hidden="true"
              className="h-4 w-4"
            />
          }
          details={
            config.bankDetailsUSD ??
            EMPTY_BANK_DETAILS
          }
          saving={saving === 'USD'}
          onChange={(key, value) =>
            updateBankField(
              'USD',
              key,
              value,
            )
          }
          onSave={() => save('USD')}
        />
      </div>
    </section>
  );
}

function BankEditor({
  title,
  description,
  icon,
  details,
  saving,
  onChange,
  onSave,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  details: BankDetails;
  saving: boolean;
  onChange: (
    key: keyof BankDetails,
    value: string,
  ) => void;
  onSave: () => void;
}) {
  const missingFields = [
    details.bankName,
    details.accountName,
    details.accountNumber,
    details.instructions,
  ].filter((value) => !value.trim()).length;

  const configured = missingFields === 0;

  return (
    <div
      className="
        rounded-lg
        border
        border-border/60
        bg-background/40
        p-3.5
      "
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-3
        "
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-md
              bg-primary/10
              text-primary
            "
          >
            {icon}
          </div>

          <div className="min-w-0">
            <h4
              className="
                truncate
                text-xs
                font-semibold
              "
            >
              {title}
            </h4>

            <p
              className="
                mt-0.5
                truncate
                text-[10px]
                text-muted-foreground
              "
            >
              {description}
            </p>
          </div>
        </div>

        <Status
          configured={configured}
        />
      </div>

      {!configured && (
        <div
          role="alert"
          className="
            mt-3
            flex
            items-center
            gap-1.5
            rounded-md
            border
            border-orange-500/20
            bg-orange-500/5
            px-2.5
            py-2
            text-[11px]
            text-orange-600
          "
        >
          <AlertTriangle
            aria-hidden="true"
            className="h-3.5 w-3.5 shrink-0"
          />

          {missingFields} field
          {missingFields !== 1 ? 's' : ''}{' '}
          required.
        </div>
      )}

      <div className="mt-4 space-y-3">
        <BankInput
          label="Bank Name"
          value={details.bankName}
          placeholder="Example: First Bank"
          onChange={(value) =>
            onChange('bankName', value)
          }
        />

        <BankInput
          label="Account Name"
          value={details.accountName}
          placeholder="Account holder name"
          onChange={(value) =>
            onChange('accountName', value)
          }
        />

        <BankInput
          label="Account Number"
          value={details.accountNumber}
          placeholder="Account number"
          inputMode="numeric"
          onChange={(value) =>
            onChange(
              'accountNumber',
              value,
            )
          }
        />

        <div className="space-y-1.5">
          <label
            htmlFor={`${title}-instructions`}
            className="
              text-[11px]
              font-medium
              text-foreground
            "
          >
            Payment Instructions
          </label>

          <textarea
            id={`${title}-instructions`}
            rows={3}
            value={details.instructions}
            onChange={(event) =>
              onChange(
                'instructions',
                event.target.value,
              )
            }
            placeholder="Explain payment steps for users..."
            className="
              w-full
              resize-y
              rounded-md
              border
              border-border/70
              bg-background
              px-3
              py-2
              text-xs
              outline-none
              placeholder:text-muted-foreground/60
              focus:border-primary
              focus:ring-2
              focus:ring-primary/10
            "
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="
          mt-3
          inline-flex
          h-8
          items-center
          gap-1.5
          rounded-md
          bg-primary
          px-3
          text-xs
          font-medium
          text-primary-foreground
          transition-opacity
          hover:opacity-90
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-primary
          focus-visible:ring-offset-2
          disabled:pointer-events-none
          disabled:opacity-50
        "
      >
        {saving ? (
          <Loader2
            aria-hidden="true"
            className="h-3.5 w-3.5 animate-spin"
          />
        ) : (
          <Save
            aria-hidden="true"
            className="h-3.5 w-3.5"
          />
        )}

        {saving
          ? 'Saving...'
          : 'Save Details'}
      </button>
    </div>
  );
}

function Status({
  configured,
}: {
  configured: boolean;
}) {
  return (
    <span
      role="status"
      className={`
        inline-flex
        shrink-0
        items-center
        gap-1
        rounded-md
        border
        px-1.5
        py-0.5
        text-[10px]
        font-medium
        ${
          configured
            ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600'
            : 'border-orange-500/20 bg-orange-500/5 text-orange-600'
        }
      `}
    >
      {configured ? (
        <CheckCircle2
          aria-hidden="true"
          className="h-3 w-3"
        />
      ) : (
        <AlertTriangle
          aria-hidden="true"
          className="h-3 w-3"
        />
      )}

      {configured
        ? 'Configured'
        : 'Action Required'}
    </span>
  );
}

function BankInput({
  label,
  value,
  placeholder,
  inputMode,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  onChange: (value: string) => void;
}) {
  const id = label
    .toLowerCase()
    .replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="
          text-[11px]
          font-medium
          text-foreground
        "
      >
        {label}
      </label>

      <input
        id={id}
        value={value}
        inputMode={inputMode}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="
          h-8
          w-full
          rounded-md
          border
          border-border/70
          bg-background
          px-3
          text-xs
          outline-none
          placeholder:text-muted-foreground/60
          focus:border-primary
          focus:ring-2
          focus:ring-primary/10
        "
      />
    </div>
  );
}

function BankDetailsSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading bank configuration"
      className="
        rounded-lg
        border
        border-border/60
        bg-card
        p-3
      "
    >
      <div className="h-4 w-48 animate-pulse rounded bg-muted" />

      <div
        className="
          mt-3
          grid
          gap-3
          lg:grid-cols-2
        "
      >
        <div className="h-64 animate-pulse rounded-lg bg-muted/70" />
        <div className="h-64 animate-pulse rounded-lg bg-muted/70" />
      </div>
    </div>
  );
}