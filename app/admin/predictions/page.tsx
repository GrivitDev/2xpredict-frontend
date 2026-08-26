'use client';

import {
  useState,
} from 'react';

import {
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import toast from 'react-hot-toast';

import {
  getPredictions,
  deletePrediction,
  updatePrediction,
  settlePrediction,
} from '@/services/prediction.service';

import PredictionDetailsModal from '@/components/admin/predictions/PredictionDetailsModal';
import PredictionsFilters from '@/components/admin/predictions/PredictionsFilters';
import PredictionsTable from '@/components/admin/predictions/PredictionsTable';

import {
  getMatchStatus,
} from '@/utils/prediction.utils';

import type {
  AdminPrediction,
} from '@/types/prediction.types';

type SettlementResult =
  | 'HOME'
  | 'DRAW'
  | 'AWAY'
  | 'VOID'
  | '';

export default function AdminPredictionsPage() {
  const queryClient = useQueryClient();

  const {
    data = [],
    isLoading,
  } = useQuery({
    queryKey: ['predictions'],
    queryFn: getPredictions,
  });

  const predictions = data as AdminPrediction[];

  const [
    selectedPrediction,
    setSelectedPrediction,
  ] = useState<AdminPrediction | null>(null);

  const [
    settlementResult,
    setSettlementResult,
  ] = useState<SettlementResult>('');

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [access, setAccess] = useState('all');
  const [league, setLeague] = useState('all');

  const leagueOptions = Array.from(
    new Map(
      predictions.map((prediction) => [
        prediction.leagueCode,
        {
          code: prediction.leagueCode,
          name:
            prediction.league?.name ||
            prediction.leagueCode,
        },
      ]),
    ).values(),
  );

  const normalizedSearch = search.trim().toLowerCase();

  const filteredPredictions = predictions.filter(
    (prediction) => {
      const searchableText = [
        prediction.homeTeam,
        prediction.awayTeam,
        prediction.league?.name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        searchableText.includes(normalizedSearch);

      const matchesStatus =
        status === 'all' ||
        getMatchStatus(prediction) === status;

      const matchesAccess =
        access === 'all' ||
        prediction.accessType === access;

      const matchesLeague =
        league === 'all' ||
        prediction.leagueCode === league;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesAccess &&
        matchesLeague
      );
    },
  );

  const openPrediction = (
    prediction: AdminPrediction,
  ) => {
    setSelectedPrediction(prediction);
    setSettlementResult('');
  };

  const updateProbability = (
    field: 'home' | 'draw' | 'away',
    value: number,
  ) => {
    setSelectedPrediction((previous) => {
      if (!previous) {
        return previous;
      }

      return {
        ...previous,
        probabilities: {
          ...previous.probabilities,
          [field]: value,
        },
      };
    });
  };

  const updateMarketSelection = (
    index: number,
    value: string,
  ) => {
    setSelectedPrediction((previous) => {
      if (!previous) {
        return previous;
      }

      const markets = [...previous.markets];

      if (!markets[index]) {
        return previous;
      }

      markets[index] = {
        ...markets[index],
        selection: value,
      };

      return {
        ...previous,
        markets,
      };
    });
  };

  const probabilityTotal =
    Number(
      selectedPrediction?.probabilities.home || 0,
    ) +
    Number(
      selectedPrediction?.probabilities.draw || 0,
    ) +
    Number(
      selectedPrediction?.probabilities.away || 0,
    );

  const refreshPredictions = () => {
    queryClient.invalidateQueries({
      queryKey: ['predictions'],
    });
  };

  const saveEdit = async () => {
    if (!selectedPrediction) {
      return;
    }

    if (
      !settlementResult &&
      probabilityTotal !== 100
    ) {
      toast.error(
        'Probabilities must equal 100%',
      );

      return;
    }

    try {
      if (settlementResult) {
        await settlePrediction(
          selectedPrediction._id,
          settlementResult,
        );

        toast.success(
          'Prediction settled successfully',
        );
      } else {
        await updatePrediction(
          selectedPrediction._id,
          {
            probabilities:
              selectedPrediction.probabilities,

            markets:
              selectedPrediction.markets,
          },
        );

        toast.success(
          'Prediction updated successfully',
        );
      }

      setSelectedPrediction(null);
      refreshPredictions();
    } catch (error) {
      console.error(error);

      toast.error(
        'Failed to update prediction',
      );
    }
  };

  const deleteItem = async () => {
    if (!selectedPrediction) {
      return;
    }

    if (
      !window.confirm(
        'Delete this prediction?',
      )
    ) {
      return;
    }

    try {
      await deletePrediction(
        selectedPrediction._id,
      );

      toast.success(
        'Prediction deleted',
      );

      setSelectedPrediction(null);
      refreshPredictions();
    } catch (error) {
      console.error(error);

      toast.error(
        'Failed to delete prediction',
      );
    }
  };

  if (isLoading) {
    return <PredictionsLoading />;
  }

  return (
    <div
      className="
        space-y-6
        animate-in
        fade-in
        slide-in-from-bottom-4
        duration-500
      "
    >
      <header className="space-y-1">
        <h1
          className="
            text-2xl
            font-bold
            tracking-tight
            sm:text-3xl
          "
        >
          Predictions
        </h1>

        <p className="text-s text-muted-foreground sm:text-base">
          Manage, edit and settle football predictions.
        </p>
      </header>

      <PredictionsFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        access={access}
        setAccess={setAccess}
        league={league}
        setLeague={setLeague}
        leagues={leagueOptions}
      />

      <PredictionsTable
        predictions={filteredPredictions}
        onSelect={openPrediction}
      />

      {selectedPrediction && (
        <PredictionDetailsModal
          prediction={selectedPrediction}
          onClose={() =>
            setSelectedPrediction(null)
          }
          settlementResult={settlementResult}
          setSettlementResult={setSettlementResult}
          probabilityTotal={probabilityTotal}
          updateProbability={updateProbability}
          updateMarketSelection={
            updateMarketSelection
          }
          saveEdit={saveEdit}
          deleteItem={deleteItem}
        />
      )}
    </div>
  );
}

function PredictionsLoading() {
  return (
    <div
      className="
        space-y-6
        animate-pulse
      "
    >
      <div
        className="
          h-8
          w-40
          rounded-lg
          bg-muted
          sm:h-10
          sm:w-48
        "
      />

      <div
        className="
          h-20
          rounded-2xl
          bg-muted
        "
      />

      <div
        className="
          h-96
          rounded-2xl
          bg-muted
        "
      />
    </div>
  );
}