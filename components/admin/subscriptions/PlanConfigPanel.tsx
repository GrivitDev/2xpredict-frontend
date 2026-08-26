'use client';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  AlertTriangle,
  BadgeDollarSign,
  CheckCircle2,
  Clock3,
  Globe2,
  Loader2,
  Save,
  Settings2,
  Tag,
} from 'lucide-react';

import toast from 'react-hot-toast';

import {
  getPlanConfig,
  updatePlanConfig,
} from '@/services/admin-plan-config.service';

import type { PlanConfig } from '@/types/plan-config';

interface PlanConfigPanelProps {
  token: string;
}

export default function PlanConfigPanel({
  token,
}: PlanConfigPanelProps) {
  const [config, setConfig] =
    useState<PlanConfig | null>(null);

  const [originalConfig, setOriginalConfig] =
    useState<PlanConfig | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadConfig = useCallback(async () => {
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
  }, [token]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const updateField = (
    key: keyof PlanConfig,
    value: number,
  ) => {
    setConfig((prev) =>
      prev
        ? {
            ...prev,
            [key]: value,
          }
        : prev,
    );
  };

  const updateLabel = (
    key: keyof PlanConfig['planLabels'],
    value: string,
  ) => {
    setConfig((prev) =>
      prev
        ? {
            ...prev,
            planLabels: {
              ...prev.planLabels,
              [key]: value,
            },
          }
        : prev,
    );
  };

  const hasChanges =
    config !== null &&
    originalConfig !== null &&
    JSON.stringify(config) !==
      JSON.stringify(originalConfig);

  const incomplete =
    !config ||
    config.regularPrice <= 0 ||
    config.vipPrice <= 0 ||
    config.regularPriceUSD <= 0 ||
    config.vipPriceUSD <= 0 ||
    config.subscriptionDurationDays < 1 ||
    !config.planLabels.free.trim() ||
    !config.planLabels.regular.trim() ||
    !config.planLabels.vip.trim();

  const save = async () => {
    if (!config || !hasChanges) return;

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
    return <PlanConfigSkeleton />;
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
        Subscription configuration could not be loaded.
      </div>
    );
  }

  return (
    <section
      aria-labelledby="plan-config-title"
      className="
        overflow-hidden
        rounded-lg
        border
        border-border/60
        bg-card
      "
    >
      {/* Header */}

      <header
        className="
          flex
          flex-col
          gap-3
          border-b
          border-border/60
          px-4
          py-3.5
          sm:flex-row
          sm:items-center
          sm:justify-between
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
            <Settings2
              aria-hidden="true"
              className="h-4 w-4"
            />
          </div>

          <div className="min-w-0">
            <h3
              id="plan-config-title"
              className="
                text-sm
                font-semibold
                tracking-tight
              "
            >
              Subscription Pricing
            </h3>

            <p
              className="
                mt-0.5
                text-[11px]
                text-muted-foreground
              "
            >
              Manage Nigerian and international
              subscription pricing.
            </p>
          </div>
        </div>

        <ConfigStatus
          hasChanges={hasChanges}
        />
      </header>

      <div className="p-3">
        {/* Nigeria */}

        <ConfigSection
          icon={
            <span
              aria-hidden="true"
              className="text-sm font-semibold"
            >
              ₦
            </span>
          }
          title="Nigeria Pricing"
          description="Prices for Nigerian subscribers."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <PriceInput
              label="Regular Subscription"
              value={config.regularPrice}
              onChange={(value) =>
                updateField(
                  'regularPrice',
                  value,
                )
              }
            />

            <PriceInput
              label="VIP Subscription"
              value={config.vipPrice}
              onChange={(value) =>
                updateField(
                  'vipPrice',
                  value,
                )
              }
            />
          </div>
        </ConfigSection>

        {/* International */}

        <ConfigSection
          icon={
            <Globe2
              aria-hidden="true"
              className="h-4 w-4"
            />
          }
          title="International Pricing"
          description="USD prices for international subscribers."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <PriceInput
              label="Regular Subscription"
              value={config.regularPriceUSD}
              onChange={(value) =>
                updateField(
                  'regularPriceUSD',
                  value,
                )
              }
            />

            <PriceInput
              label="VIP Subscription"
              value={config.vipPriceUSD}
              onChange={(value) =>
                updateField(
                  'vipPriceUSD',
                  value,
                )
              }
            />
          </div>
        </ConfigSection>

        {/* Duration */}

        <ConfigSection
          icon={
            <Clock3
              aria-hidden="true"
              className="h-4 w-4"
            />
          }
          title="Subscription Settings"
          description="Settings shared across subscription currencies."
        >
          <div className="max-w-sm">
            <PriceInput
              label="Subscription Duration"
              suffix="days"
              value={config.subscriptionDurationDays}
              onChange={(value) =>
                updateField(
                  'subscriptionDurationDays',
                  value,
                )
              }
            />
          </div>
        </ConfigSection>

        {/* Labels */}

        <ConfigSection
          icon={
            <Tag
              aria-hidden="true"
              className="h-4 w-4"
            />
          }
          title="Plan Labels"
          description="Names displayed throughout the platform."
        >
          <div className="grid gap-3 sm:grid-cols-3">
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
        </ConfigSection>

        {/* Save */}

        <div
          className="
            mt-4
            flex
            items-center
            justify-between
            gap-3
            border-t
            border-border/50
            pt-3
          "
        >
          {incomplete && hasChanges ? (
            <p
              className="
                flex
                items-center
                gap-1.5
                text-[11px]
                text-orange-600
              "
            >
              <AlertTriangle
                aria-hidden="true"
                className="h-3.5 w-3.5"
              />

              Complete all fields before saving.
            </p>
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={save}
            disabled={
              saving ||
              !hasChanges ||
              incomplete
            }
            className="
              inline-flex
              h-8
              shrink-0
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
                className="
                  h-3.5
                  w-3.5
                  animate-spin
                "
              />
            ) : (
              <Save
                aria-hidden="true"
                className="h-3.5 w-3.5"
              />
            )}

            {saving
              ? 'Saving...'
              : 'Save Configuration'}
          </button>
        </div>
      </div>
    </section>
  );
}

function ConfigStatus({
  hasChanges,
}: {
  hasChanges: boolean;
}) {
  return (
    <span
      role="status"
      className={`
        inline-flex
        shrink-0
        items-center
        gap-1
        self-start
        rounded-md
        border
        px-1.5
        py-0.5
        text-[10px]
        font-medium
        sm:self-auto
        ${
          hasChanges
            ? 'border-orange-500/20 bg-orange-500/5 text-orange-600'
            : 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600'
        }
      `}
    >
      {hasChanges ? (
        <AlertTriangle
          aria-hidden="true"
          className="h-3 w-3"
        />
      ) : (
        <CheckCircle2
          aria-hidden="true"
          className="h-3 w-3"
        />
      )}

      {hasChanges
        ? 'Unsaved Changes'
        : 'Synced'}
    </span>
  );
}

function ConfigSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-border/50 py-3.5 first:pt-0 last:border-0">
      <div className="mb-3 flex items-center gap-2.5">
        <div
          className="
            flex
            h-7
            w-7
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
              text-xs
              font-semibold
              tracking-tight
            "
          >
            {title}
          </h4>

          <p
            className="
              mt-0.5
              text-[10px]
              text-muted-foreground
            "
          >
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

function PriceInput({
  label,
  value,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label
        htmlFor={label}
        className="
          mb-1.5
          flex
          items-center
          gap-1.5
          text-[11px]
          font-medium
        "
      >
        <BadgeDollarSign
          aria-hidden="true"
          className="
            h-3.5
            w-3.5
            text-muted-foreground
          "
        />

        {label}
      </label>

      <div className="relative">
        <input
          id={label}
          type="number"
          min={0}
          step="any"
          value={value ?? ''}
          onChange={(event) =>
            onChange(
              Number(event.target.value),
            )
          }
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

        {suffix && (
          <span
            className="
              pointer-events-none
              absolute
              right-2.5
              top-1/2
              -translate-y-1/2
              text-[10px]
              text-muted-foreground
            "
          >
            {suffix}
          </span>
        )}
      </div>
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
  const id = label
    .toLowerCase()
    .replace(/\s+/g, '-');

  return (
    <div>
      <label
        htmlFor={id}
        className="
          mb-1.5
          block
          text-[11px]
          font-medium
        "
      >
        {label}
      </label>

      <input
        id={id}
        type="text"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
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

function PlanConfigSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading subscription configuration"
      className="
        overflow-hidden
        rounded-lg
        border
        border-border/60
        bg-card
      "
    >
      <div
        className="
          flex
          items-center
          gap-2.5
          border-b
          border-border/60
          px-4
          py-3.5
        "
      >
        <div
          className="
            h-8
            w-8
            animate-pulse
            rounded-md
            bg-muted
          "
        />

        <div className="space-y-1.5">
          <div
            className="
              h-3.5
              w-44
              animate-pulse
              rounded
              bg-muted
            "
          />

          <div
            className="
              h-2.5
              w-60
              animate-pulse
              rounded
              bg-muted
            "
          />
        </div>
      </div>

      <div className="space-y-5 p-3.5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="h-12 animate-pulse rounded-md bg-muted/60" />
          <div className="h-12 animate-pulse rounded-md bg-muted/60" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="h-12 animate-pulse rounded-md bg-muted/60" />
          <div className="h-12 animate-pulse rounded-md bg-muted/60" />
        </div>

        <div className="h-12 max-w-sm animate-pulse rounded-md bg-muted/60" />
      </div>
    </section>
  );
}