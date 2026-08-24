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
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">
          Prediction Performance
        </h2>
      </div>

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-4
          gap-5
        "
      >
        <AnalyticsCard
          title="Total Predictions"
          icon={Target}
          highlight
        >
          <p className="text-3xl font-bold">
            {predictions.totalPredictions.toLocaleString()}
          </p>
        </AnalyticsCard>

        <AnalyticsCard
          title="VIP Predictions"
          icon={Crown}
        >
          <p className="text-3xl font-bold">
            {predictions.vipPredictions.toLocaleString()}
          </p>
        </AnalyticsCard>

        <AnalyticsCard
          title="Regular Predictions"
          icon={Users}
        >
          <p className="text-3xl font-bold">
            {predictions.regularPredictions.toLocaleString()}
          </p>
        </AnalyticsCard>

        <AnalyticsCard
          title="Free Predictions"
          icon={Target}
        >
          <p className="text-3xl font-bold">
            {predictions.freePredictions.toLocaleString()}
          </p>
        </AnalyticsCard>

        <AnalyticsCard
          title="Won"
          icon={CheckCircle}
          highlight
        >
          <p className="text-3xl font-bold">
            {predictions.wonPredictions.toLocaleString()}
          </p>
        </AnalyticsCard>

        <AnalyticsCard
          title="Lost"
          icon={XCircle}
        >
          <p className="text-3xl font-bold">
            {predictions.lostPredictions.toLocaleString()}
          </p>
        </AnalyticsCard>

        <AnalyticsCard
          title="Void"
          icon={ShieldAlert}
        >
          <p className="text-3xl font-bold">
            {predictions.voidPredictions.toLocaleString()}
          </p>
        </AnalyticsCard>

        <AnalyticsCard
          title="Pending"
          icon={Clock}
        >
          <p className="text-3xl font-bold">
            {predictions.pendingPredictions.toLocaleString()}
          </p>
        </AnalyticsCard>
      </div>
    </section>
  );
}