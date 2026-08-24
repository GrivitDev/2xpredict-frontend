'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  BadgeDollarSign,
  CheckCircle2,
  AlertTriangle,
  Save,
  Settings2,
  Loader2,
  Globe2,
  Tag,
  Clock3,
} from 'lucide-react';

import toast from 'react-hot-toast';

import {
  getPlanConfig,
  updatePlanConfig,
} from '@/services/admin-plan-config.service';

import type { PlanConfig } from '@/types/plan-config';

export default function PlanConfigPanel({
  token,
}: {
  token: string;
}) {
  const [config, setConfig] = useState<PlanConfig | null>(null);
  const [originalConfig, setOriginalConfig] =
    useState<PlanConfig | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getPlanConfig(token);

        setConfig(data);
        setOriginalConfig(data);
      } catch {
        toast.error(
          'Unable to load subscription configuration',
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const updateField = (
    key: keyof PlanConfig,
    value: number,
  ) => {
    setConfig((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        [key]: value,
      };
    });
  };

  const updateLabel = (
    key: keyof PlanConfig['planLabels'],
    value: string,
  ) => {
    setConfig((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        planLabels: {
          ...prev.planLabels,
          [key]: value,
        },
      };
    });
  };

  const hasChanges = useMemo(() => {
    return (
      JSON.stringify(config) !==
      JSON.stringify(originalConfig)
    );
  }, [config, originalConfig]);

  const incomplete = useMemo(() => {
    if (!config) return true;

    return (
      config.regularPrice <= 0 ||
      config.vipPrice <= 0 ||
      config.regularPriceUSD <= 0 ||
      config.vipPriceUSD <= 0 ||
      config.subscriptionDurationDays < 1 ||
      !config.planLabels.free.trim() ||
      !config.planLabels.regular.trim() ||
      !config.planLabels.vip.trim()
    );
  }, [config]);

  const save = async () => {
    if (!config) return;

    if (incomplete) {
      toast.error(
        'Please complete all configuration fields',
      );

      return;
    }

    try {
      setSaving(true);

      await updatePlanConfig(token, config);

      setOriginalConfig({
        ...config,
        planLabels: {
          ...config.planLabels,
        },
      });

      toast.success(
        'Subscription configuration updated',
      );
    } catch {
      toast.error(
        'Failed to update configuration',
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        className="
          rounded-3xl
          border
          bg-card/70
          p-6
          backdrop-blur-xl
        "
      >
        <div
          className="
            h-6
            w-56
            animate-pulse
            rounded-lg
            bg-muted
          "
        />

        <div
          className="
            mt-6
            h-40
            animate-pulse
            rounded-2xl
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
          bg-card/70
          p-6
          text-s
          text-muted-foreground
        "
      >
        Subscription configuration could not be loaded.
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
          h-48
          w-48
          rounded-full
          bg-primary/10
          blur-3xl
        "
      />

      {/* Header */}

      <div
        className="
          relative
          flex
          flex-col
          gap-4
          md:flex-row
          md:items-center
          md:justify-between
        "
      >
        <div
          className="
            flex
            items-center
            gap-4
          "
        >
          <div
            className="
              rounded-2xl
              bg-primary/10
              p-4
            "
          >
            <Settings2
              className="
                h-6
                w-6
                text-primary
              "
            />
          </div>

          <div>
            <h3
              className="
                text-xl
                font-semibold
              "
            >
              Subscription Pricing Engine
            </h3>

            <p
              className="
                text-s
                text-muted-foreground
              "
            >
              Control Nigerian and international
              subscription pricing.
            </p>
          </div>
        </div>

        {hasChanges ? (
          <div
            className="
              flex
              items-center
              gap-2
              rounded-full
              border
              border-orange-500/20
              bg-orange-500/10
              px-4
              py-2
              text-xs
              text-orange-600
            "
          >
            <AlertTriangle className="h-4 w-4" />
            Unsaved Changes
          </div>
        ) : (
          <div
            className="
              flex
              items-center
              gap-2
              rounded-full
              border
              border-green-500/20
              bg-green-500/10
              px-4
              py-2
              text-xs
              text-green-600
            "
          >
            <CheckCircle2 className="h-4 w-4" />
            Synced
          </div>
        )}
      </div>

      {/* Nigeria Pricing */}

      <div className="mt-8">
        <SectionHeading
          icon={<span className="text-lg">₦</span>}
          title="Nigeria Pricing"
          description="Prices used for Nigerian subscribers."
        />

        <div
          className="
            mt-4
            grid
            gap-5
            md:grid-cols-2
          "
        >
          <PriceInput
            label="Regular Subscription"
            value={config.regularPrice}
            onChange={(value) =>
              updateField('regularPrice', value)
            }
          />

          <PriceInput
            label="VIP Subscription"
            value={config.vipPrice}
            onChange={(value) =>
              updateField('vipPrice', value)
            }
          />
        </div>
      </div>

      {/* International Pricing */}

      <div className="mt-10">
        <SectionHeading
          icon={<Globe2 className="h-5 w-5" />}
          title="International Pricing"
          description="USD prices used for international subscribers."
        />

        <div
          className="
            mt-4
            grid
            gap-5
            md:grid-cols-2
          "
        >
          <PriceInput
            label="Regular Subscription (USD)"
            value={config.regularPriceUSD}
            onChange={(value) =>
              updateField(
                'regularPriceUSD',
                value,
              )
            }
          />

          <PriceInput
            label="VIP Subscription (USD)"
            value={config.vipPriceUSD}
            onChange={(value) =>
              updateField(
                'vipPriceUSD',
                value,
              )
            }
          />
        </div>
      </div>

      {/* Common Configuration */}

      <div className="mt-10">
        <SectionHeading
          icon={<Clock3 className="h-5 w-5" />}
          title="Subscription Settings"
          description="Settings shared across all subscription currencies."
        />

        <div className="mt-4 max-w-md">
          <PriceInput
            label="Subscription Duration (Days)"
            value={config.subscriptionDurationDays}
            onChange={(value) =>
              updateField(
                'subscriptionDurationDays',
                value,
              )
            }
          />
        </div>
      </div>

      {/* Plan Labels */}

      <div className="mt-10">
        <SectionHeading
          icon={<Tag className="h-5 w-5" />}
          title="Plan Labels"
          description="Names displayed to subscribers throughout the platform."
        />

        <div
          className="
            mt-4
            grid
            gap-5
            md:grid-cols-3
          "
        >
          <TextInput
            label="Free Plan"
            value={config.planLabels.free}
            onChange={(value) =>
              updateLabel('free', value)
            }
          />

          <TextInput
            label="Regular Plan"
            value={config.planLabels.regular}
            onChange={(value) =>
              updateLabel('regular', value)
            }
          />

          <TextInput
            label="VIP Plan"
            value={config.planLabels.vip}
            onChange={(value) =>
              updateLabel('vip', value)
            }
          />
        </div>
      </div>

      {/* Save */}

      <button
        onClick={save}
        disabled={saving || !hasChanges}
        className="
          mt-8
          inline-flex
          items-center
          gap-2
          rounded-xl
          bg-primary
          px-6
          py-3
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
          : 'Save Configuration'}
      </button>
    </div>
  );
}

function SectionHeading({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="
          flex
          h-9
          w-9
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

        <p className="text-s text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

function PriceInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        bg-background/50
        p-5
      "
    >
      <label
        className="
          mb-3
          flex
          items-center
          gap-2
          text-s
          font-medium
        "
      >
        <BadgeDollarSign
          className="
            h-4
            w-4
            text-primary
          "
        />

        {label}
      </label>

      <input
        type="number"
        min="0"
        value={value ?? ''}
        onChange={(e) =>
          onChange(Number(e.target.value))
        }
        className="
          w-full
          rounded-xl
          border
          bg-card
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

function TextInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        bg-background/50
        p-5
      "
    >
      <label
        className="
          mb-3
          block
          text-s
          font-medium
        "
      >
        {label}
      </label>

      <input
        type="text"
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="
          w-full
          rounded-xl
          border
          bg-card
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