'use client';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Search,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';

type SectionView =
  | 'all'
  | 'predictions'
  | 'live'
  | 'today'
  | 'results'
  | 'upcoming'
  | 'table';

type ResultFilter =
  | 'all'
  | 'home'
  | 'away'
  | 'draw';

interface Props {
  search: string;
  selectedDate: string;
  goalFilter: string;
  pointsFilter: string;
  resultFilter: ResultFilter;
  sectionView: SectionView;

  onSearchChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onGoalFilterChange: (value: string) => void;
  onPointsFilterChange: (value: string) => void;
  onResultFilterChange: (value: ResultFilter) => void;
  onSectionViewChange: (value: SectionView) => void;
  onReset: () => void;
}

const sectionOptions: [SectionView, string][] = [
  ['all', 'All'],
  ['predictions', 'Predictions'],
  ['live', 'Live'],
  ['today', 'Today'],
  ['results', 'Results'],
  ['upcoming', 'Upcoming'],
  ['table', 'Table'],
];

const goalOptions = [
  ['1', '1+'],
  ['2', '2+'],
  ['3', '3+'],
  ['4', '4+'],
  ['5', '5+'],
];

const pointsOptions = [
  ['10', '10+'],
  ['20', '20+'],
  ['30', '30+'],
  ['40', '40+'],
  ['50', '50+'],
  ['60', '60+'],
  ['70', '70+'],
];

const resultOptions: [ResultFilter, string][] = [
  ['all', 'Any'],
  ['home', 'Home Wins'],
  ['away', 'Away Wins'],
  ['draw', 'Draws'],
];

const glassClass = `
  border-border/70
  bg-background/60
  backdrop-blur-md
  backdrop-saturate-150
`;

const inputClass = `
  h-10
  w-full
  rounded-lg
  border
  border-border
  bg-background/70
  px-3
  text-xs
  outline-none
  focus:border-primary
`;

function SearchBar({
  search,
  onSearchChange,
  mobile = false,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  mobile?: boolean;
}) {
  return (
    <div
      className={`
        relative
        flex-1
        ${mobile ? 'min-w-0' : ''}
      `}
    >
      <Search
        size={18}
        className="
          pointer-events-none
          absolute
          left-3
          top-1/2
          -translate-y-1/2
          text-muted-foreground
        "
      />

      <input
        type="text"
        value={search}
        onChange={(e) =>
          onSearchChange(e.target.value)
        }
        placeholder={
          mobile
            ? 'Search...'
            : 'Search team, league or venue...'
        }
        className="
          h-11
          w-full
          rounded-xl
          border
          border-border
          bg-background/50
          pl-10
          pr-4
          text-xs
          outline-none
          backdrop-blur-md
          backdrop-saturate-150
          transition
          focus:border-primary
        "
      />
    </div>
  );
}

function FilterPanel({
  selectedDate,
  goalFilter,
  pointsFilter,
  resultFilter,
  onDateChange,
  onGoalFilterChange,
  onPointsFilterChange,
  onResultFilterChange,
  onReset,
}: Pick<
  Props,
  | 'selectedDate'
  | 'goalFilter'
  | 'pointsFilter'
  | 'resultFilter'
  | 'onDateChange'
  | 'onGoalFilterChange'
  | 'onPointsFilterChange'
  | 'onResultFilterChange'
  | 'onReset'
>) {
  return (
    <div className="space-y-4">
      {/* DATE */}

      <div>
        <label
          className="
            mb-1
            block
            text-xs
            font-medium
            text-muted-foreground
          "
        >
          Date
        </label>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) =>
            onDateChange(e.target.value)
          }
          className={inputClass}
        />
      </div>

      {/* GOALS */}

      <div>
        <label
          className="
            mb-1
            block
            text-xs
            font-medium
            text-muted-foreground
          "
        >
          Goals
        </label>

        <select
          value={goalFilter}
          onChange={(e) =>
            onGoalFilterChange(e.target.value)
          }
          className={`${inputClass} cursor-pointer`}
        >
          <option value="">Any</option>

          {goalOptions.map(
            ([value, label]) => (
              <option
                key={value}
                value={value}
              >
                {label}
              </option>
            ),
          )}
        </select>
      </div>

      {/* POINTS */}

      <div>
        <label
          className="
            mb-1
            block
            text-xs
            font-medium
            text-muted-foreground
          "
        >
          Points
        </label>

        <select
          value={pointsFilter}
          onChange={(e) =>
            onPointsFilterChange(
              e.target.value,
            )
          }
          className={`${inputClass} cursor-pointer`}
        >
          <option value="">Any</option>

          {pointsOptions.map(
            ([value, label]) => (
              <option
                key={value}
                value={value}
              >
                {label}
              </option>
            ),
          )}
        </select>
      </div>

      {/* RESULT */}

      <div>
        <label
          className="
            mb-1
            block
            text-xs
            font-medium
            text-muted-foreground
          "
        >
          Result
        </label>

        <select
          value={resultFilter}
          onChange={(e) =>
            onResultFilterChange(
              e.target.value as ResultFilter,
            )
          }
          className={`${inputClass} cursor-pointer`}
        >
          {resultOptions.map(
            ([value, label]) => (
              <option
                key={value}
                value={value}
              >
                {label}
              </option>
            ),
          )}
        </select>
      </div>

      {/* RESET */}

      <button
        type="button"
        onClick={onReset}
        className="
          flex
          w-full
          items-center
          justify-center
          gap-2
          rounded-lg
          border
          border-border
          px-3
          py-2
          text-xs
          font-medium
          transition
          hover:bg-muted
        "
      >
        <RotateCcw size={16} />

        Reset Filters
      </button>
    </div>
  );
}

export default function LivescoreFilters({
  search,
  selectedDate,
  goalFilter,
  pointsFilter,
  resultFilter,
  sectionView,
  onSearchChange,
  onDateChange,
  onGoalFilterChange,
  onPointsFilterChange,
  onResultFilterChange,
  onSectionViewChange,
  onReset,
}: Props) {
  const [
    showFilters,
    setShowFilters,
  ] = useState(false);

  const desktopFilterRef =
    useRef<HTMLDivElement>(null);

  const mobileFilterRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent,
    ) {
      const target =
        event.target as Node;

      const clickedInsideDesktop =
        desktopFilterRef.current?.contains(
          target,
        );

      const clickedInsideMobile =
        mobileFilterRef.current?.contains(
          target,
        );

      if (
        !clickedInsideDesktop &&
        !clickedInsideMobile
      ) {
        setShowFilters(false);
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside,
      );
    };
  }, []);

  const filterContent = (
    <FilterPanel
      selectedDate={selectedDate}
      goalFilter={goalFilter}
      pointsFilter={pointsFilter}
      resultFilter={resultFilter}
      onDateChange={onDateChange}
      onGoalFilterChange={
        onGoalFilterChange
      }
      onPointsFilterChange={
        onPointsFilterChange
      }
      onResultFilterChange={
        onResultFilterChange
      }
      onReset={() => {
        onReset();
        setShowFilters(false);
      }}
    />
  );

  return (
    <section className="space-y-4">
      {/* ====================================================
          DESKTOP
      ==================================================== */}

      <div
        className="
          hidden
          items-center
          gap-3
          md:flex
        "
      >
        {/* SEARCH */}

        <SearchBar
          search={search}
          onSearchChange={onSearchChange}
        />

        {/* FILTER */}

        <div
          ref={desktopFilterRef}
          className="relative"
        >
          <button
            type="button"
            onClick={() =>
              setShowFilters(
                (current) => !current,
              )
            }
            className={`
              inline-flex
              h-11
              items-center
              gap-2
              rounded-xl
              border
              px-4
              text-xs
              font-medium
              transition
              hover:bg-muted/50
              ${glassClass}
            `}
          >
            <SlidersHorizontal
              size={18}
            />

            Filters
          </button>

          {showFilters && (
            <div
              className={`
                absolute
                right-0
                top-14
                z-[100]
                w-72
                rounded-xl
                border
                p-4
                shadow-xl
                ${glassClass}
              `}
            >
              {filterContent}
            </div>
          )}
        </div>
      </div>

      {/* ====================================================
          MOBILE
      ==================================================== */}

      <div className="md:hidden">
        <div
          className="
            flex
            items-center
            gap-2
          "
        >
          {/* SEARCH BAR */}

          <SearchBar
            search={search}
            onSearchChange={onSearchChange}
            mobile
          />

          {/* FILTER BUTTON */}

          <div
            ref={mobileFilterRef}
            className="relative shrink-0"
          >
            <button
              type="button"
              aria-label="Open filters"
              onClick={() =>
                setShowFilters(
                  (current) => !current,
                )
              }
              className={`
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                border
                transition
                hover:bg-muted/50
                ${glassClass}
              `}
            >
              <SlidersHorizontal
                size={18}
              />
            </button>

            {showFilters && (
              <div
                className={`
                  absolute
                  right-0
                  top-12
                  z-[100]
                  w-72
                  max-w-[calc(100vw-2rem)]
                  rounded-xl
                  border
                  p-4
                  shadow-xl
                  ${glassClass}
                `}
              >
                {filterContent}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ====================================================
          SECTION SELECTOR
      ==================================================== */}

      <div
        className="
          flex
          w-full
          items-center
          justify-center
          rounded-xl
          border
          border-border/60
          bg-muted/30
          p-1
          shadow-sm
          md:ml-auto
          md:w-fit
          md:justify-end
        "
      >
        {sectionOptions.map(
          ([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                onSectionViewChange(value)
              }
              className={`
                min-w-0
                flex-1
                whitespace-nowrap
                rounded-lg
                px-1
                py-1.5
                text-[9px]
                font-semibold
                leading-none
                transition-all
                duration-200
                sm:px-2
                sm:text-[10px]
                md:flex-none
                md:px-3
                md:py-1.5
                md:text-xs
                ${
                  sectionView === value
                    ? `
                      bg-background
                      text-primary
                      shadow-sm
                      ring-1
                      ring-border/50
                    `
                    : `
                      text-muted-foreground
                      hover:bg-background/70
                      hover:text-foreground
                    `
                }
              `}
            >
              {label}
            </button>
          ),
        )}
      </div>
    </section>
  );
}