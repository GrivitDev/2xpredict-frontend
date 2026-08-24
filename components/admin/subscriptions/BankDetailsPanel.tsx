'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  CheckCircle2,
  AlertTriangle,
  Save,
  Landmark,
  Globe2,
  Loader2,
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

const emptyBankDetails: BankDetails = {
  bankName: '',
  accountName: '',
  accountNumber: '',
  instructions: '',
};

export default function BankDetailsPanel({
  token,
}: {
  token: string;
}) {
  const [config, setConfig] =
    useState<PlanConfig | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<
    'NGN' | 'USD' | null
  >(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getPlanConfig(token);

        setConfig(data);
      } catch {
        toast.error(
          'Unable to load bank configuration',
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const updateBankField = (
    currency: 'NGN' | 'USD',
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

  const save = async (
    currency: 'NGN' | 'USD',
  ) => {
    if (!config) return;

    try {
      setSaving(currency);

      if (currency === 'NGN') {
        await updatePlanConfig(token, {
          bankDetails: config.bankDetails,
        });
      } else {
        await updatePlanConfig(token, {
          bankDetailsUSD:
            config.bankDetailsUSD,
        });
      }

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
    return (
      <div
        className="
          rounded-3xl
          border
          bg-card/60
          p-6
          backdrop-blur
        "
      >
        <div
          className="
            h-6
            w-48
            animate-pulse
            rounded-lg
            bg-muted
          "
        />

        <div
          className="
            mt-6
            h-32
            animate-pulse
            rounded-xl
            bg-muted
          "
        />
      </div>
    );
  }

  if (!config) {
    return (
      <div
        className="
          rounded-3xl
          border
          bg-card/60
          p-6
          text-s
          text-muted-foreground
        "
      >
        Bank configuration could not be loaded.
      </div>
    );
  }

  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-3xl
        border
        bg-card/70
        p-6
        backdrop-blur-xl
      "
    >
      <div
        className="
          pointer-events-none
          absolute
          -right-20
          -top-20
          h-40
          w-40
          rounded-full
          bg-primary/10
          blur-3xl
        "
      />

      <div className="relative">
        <div className="flex items-center gap-4">
          <div
            className="
              rounded-2xl
              bg-primary/10
              p-4
            "
          >
            <Landmark
              className="
                h-6
                w-6
                text-primary
              "
            />
          </div>

          <div>
            <h3 className="text-xl font-semibold">
              Bank Transfer Configuration
            </h3>

            <p
              className="
                mt-1
                text-s
                text-muted-foreground
              "
            >
              Configure payment instructions for
              Nigerian and international subscribers.
            </p>
          </div>
        </div>

        <div
          className="
            mt-8
            grid
            gap-6
            xl:grid-cols-2
          "
        >
          <BankEditor
            currency="NGN"
            title="Nigeria Bank Details"
            description="Used for ₦ Nigerian subscription payments."
            icon={
              <span className="text-lg font-bold">
                ₦
              </span>
            }
            details={config.bankDetails}
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
            currency="USD"
            title="International Bank Details"
            description="Used for $ international subscription payments."
            icon={
              <Globe2 className="h-5 w-5" />
            }
            details={config.bankDetailsUSD}
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
      </div>
    </div>
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
  currency: 'NGN' | 'USD';
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
  const missingFields = useMemo(() => {
    return Object.values(details).filter(
      (value) => !value.trim(),
    ).length;
  }, [details]);

  const configured = missingFields === 0;

  return (
    <div
      className="
        rounded-2xl
        border
        bg-background/50
        p-5
      "
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-primary/10
              text-primary
            "
          >
            {icon}
          </div>

          <div>
            <h4 className="font-semibold">
              {title}
            </h4>

            <p
              className="
                mt-1
                text-xs
                text-muted-foreground
              "
            >
              {description}
            </p>
          </div>
        </div>

        <div
          className={`
            flex
            shrink-0
            items-center
            gap-1.5
            rounded-full
            border
            px-3
            py-1.5
            text-xs
            ${
              configured
                ? 'border-green-500/20 bg-green-500/10 text-green-600'
                : 'border-orange-500/20 bg-orange-500/10 text-orange-600'
            }
          `}
        >
          {configured ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5" />
          )}

          {configured
            ? 'Configured'
            : 'Action Required'}
        </div>
      </div>

      {!configured && (
        <div
          className="
            mt-5
            flex
            items-center
            gap-2
            rounded-xl
            border
            border-orange-500/20
            bg-orange-500/10
            p-3
            text-xs
          "
        >
          <AlertTriangle
            className="
              h-4
              w-4
              shrink-0
              text-orange-500
            "
          />

          {missingFields} field
          {missingFields !== 1 ? 's' : ''}{' '}
          still required.
        </div>
      )}

      <div className="mt-6 space-y-4">
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
          onChange={(value) =>
            onChange(
              'accountNumber',
              value,
            )
          }
        />

        <div className="space-y-2">
          <label
            className="
              text-s
              font-medium
            "
          >
            Payment Instructions
          </label>

          <textarea
            rows={4}
            value={details.instructions}
            onChange={(e) =>
              onChange(
                'instructions',
                e.target.value,
              )
            }
            placeholder="Explain payment steps for users..."
            className="
              w-full
              resize-none
              rounded-xl
              border
              bg-background
              px-4
              py-3
              text-s
              outline-none
              transition
              focus:border-primary
              focus:ring-4
              focus:ring-primary/10
            "
          />
        </div>
      </div>

      <button
        onClick={onSave}
        disabled={saving}
        className="
          mt-5
          inline-flex
          items-center
          gap-2
          rounded-xl
          bg-primary
          px-5
          py-2.5
          text-s
          font-semibold
          text-primary-foreground
          transition
          hover:opacity-90
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        {saving ? (
          <Loader2
            className="
              h-4
              w-4
              animate-spin
            "
          />
        ) : (
          <Save className="h-4 w-4" />
        )}

        {saving
          ? 'Saving...'
          : 'Save Bank Details'}
      </button>
    </div>
  );
}

function BankInput({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label
        className="
          text-s
          font-medium
        "
      >
        {label}
      </label>

      <input
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        className="
          w-full
          rounded-xl
          border
          bg-background
          px-4
          py-3
          text-s
          outline-none
          transition
          focus:border-primary
          focus:ring-4
          focus:ring-primary/10
        "
      />
    </div>
  );
}