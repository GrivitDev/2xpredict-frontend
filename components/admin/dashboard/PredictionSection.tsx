import {
  Target,
  Crown,
  Users,
  CheckCircle,
  XCircle,
  ShieldAlert,
  Clock,
} from 'lucide-react';

import AnalyticsCard from './AnalyticsCard';

import {
  AnalyticsPredictions,
} from '@/types/analytics.types';

interface Props {
  predictions: AnalyticsPredictions;
}

export default function PredictionSection({
  predictions,
}: Props) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Prediction Performance
        </h2>

        <p className="mt-0.5 text-xs text-muted-foreground">
          Overview of prediction activity and results.
        </p>
      </div>

      <div
        className="
          grid
          grid-cols-2
          gap-2
          lg:grid-cols-4
        "
      >
        <AnalyticsCard
          title="Total Predictions"
          icon={Target}
          highlight
        >
          <p className="text-2xl font-semibold tracking-tight">
            {predictions.totalPredictions.toLocaleString()}
          </p>
        </AnalyticsCard>

        <AnalyticsCard
          title="VIP Predictions"
          icon={Crown}
        >
          <p className="text-2xl font-semibold tracking-tight">
            {predictions.vipPredictions.toLocaleString()}
          </p>
        </AnalyticsCard>

        <AnalyticsCard
          title="Regular Predictions"
          icon={Users}
        >
          <p className="text-2xl font-semibold tracking-tight">
            {predictions.regularPredictions.toLocaleString()}
          </p>
        </AnalyticsCard>

        <AnalyticsCard
          title="Free Predictions"
          icon={Target}
        >
          <p className="text-2xl font-semibold tracking-tight">
            {predictions.freePredictions.toLocaleString()}
          </p>
        </AnalyticsCard>

        <AnalyticsCard
          title="Won"
          icon={CheckCircle}
          highlight
        >
          <p className="text-2xl font-semibold tracking-tight">
            {predictions.wonPredictions.toLocaleString()}
          </p>
        </AnalyticsCard>

        <AnalyticsCard
          title="Lost"
          icon={XCircle}
        >
          <p className="text-2xl font-semibold tracking-tight">
            {predictions.lostPredictions.toLocaleString()}
          </p>
        </AnalyticsCard>

        <AnalyticsCard
          title="Void"
          icon={ShieldAlert}
        >
          <p className="text-2xl font-semibold tracking-tight">
            {predictions.voidPredictions.toLocaleString()}
          </p>
        </AnalyticsCard>

        <AnalyticsCard
          title="Pending"
          icon={Clock}
        >
          <p className="text-2xl font-semibold tracking-tight">
            {predictions.pendingPredictions.toLocaleString()}
          </p>
        </AnalyticsCard>
      </div>
    </section>
  );
}