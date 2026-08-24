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
  X,
} from 'lucide-react';

type SectionView =
  | 'all'
  | 'predictions'
  | 'live'
  | 'today'
  | 'results'
  | 'upcoming'
  | 'table';

interface Props {
  search: string;
  selectedDate: string;
  goalFilter: string;
  pointsFilter: string;
  resultFilter:
    | 'all'
    | 'home'
    | 'away'
    | 'draw';

  sectionView: SectionView;

  onSearchChange: (
    value: string,
  ) => void;

  onDateChange: (
    value: string,
  ) => void;

  onGoalFilterChange: (
    value: string,
  ) => void;

  onPointsFilterChange: (
    value: string,
  ) => void;

  onSectionViewChange: (
    value: SectionView,
  ) => void;

  onResultFilterChange: (
    value:
      | 'all'
      | 'home'
      | 'away'
      | 'draw',
  ) => void;

  onReset: () => void;
}

export default function LivescoreFilters({
  search,
  selectedDate,
  goalFilter,
  pointsFilter,
  resultFilter,
  onSearchChange,
  onDateChange,
  onGoalFilterChange,
  onPointsFilterChange,
  onResultFilterChange,
  sectionView,
  onSectionViewChange,
  onReset,
}: Props) {

  const [
    showSearch,
    setShowSearch,
  ] = useState(false);

  const [
    showFilters,
    setShowFilters,
  ] = useState(false);

  const filterRef =
    useRef<HTMLDivElement>(null);


  // ==========================================================
  // CLOSE FILTER WHEN CLICKING OUTSIDE
  // ==========================================================

  useEffect(() => {

    function handleClickOutside(
      event: MouseEvent,
    ) {

      const target =
        event.target as Node;

      if (
        filterRef.current &&
        !filterRef.current.contains(target)
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


  return (

    <section
      className="
        space-y-4
      "
    >

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

        <div
          className="
            relative
            flex-1
          "
        >

          <Search
            size={18}
            className="
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
              onSearchChange(
                e.target.value,
              )
            }
            placeholder="
              Search team, league or venue...
            "
            className="
              h-11
              w-full
              rounded-xl
              border
              border-border
              bg-transparent
              pl-10
              pr-4
              text-xs
              outline-none
              transition
              focus:border-primary
            "
          />

        </div>


        {/* ==================================================
            DESKTOP FILTER
        ================================================== */}

        <div
          ref={filterRef}
          className="
            relative
          "
        >

          <button
            type="button"
            onClick={() =>
              setShowFilters(
                current => !current,
              )
            }
            className="
              inline-flex
              h-11
              items-center
              gap-2
              rounded-xl
              border
              border-border
              bg-transparent
              px-4
              text-xs
              font-medium
              transition
              hover:bg-muted/50
            "
          >

            <SlidersHorizontal
              size={18}
            />

            Filters

          </button>


          {showFilters && (

            <div
              className="
                absolute
                right-0
                top-14
                z-50
                w-72
                rounded-xl
                border
                border-border
                bg-popover
                p-4
                shadow-lg
              "
            >

              <div
                className="
                  space-y-4
                "
              >

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
                      onDateChange(
                        e.target.value,
                      )
                    }
                    className="
                      h-10
                      w-full
                      rounded-lg
                      border
                      border-border
                      bg-background
                      px-3
                      text-xs
                    "
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
                      onGoalFilterChange(
                        e.target.value,
                      )
                    }
                    className="
                      h-10
                      w-full
                      rounded-lg
                      border
                      border-border
                      bg-background
                      px-3
                      text-xs
                    "
                  >

                    <option value="">
                      Any
                    </option>

                    <option value="1">
                      1+
                    </option>

                    <option value="2">
                      2+
                    </option>

                    <option value="3">
                      3+
                    </option>

                    <option value="4">
                      4+
                    </option>

                    <option value="5">
                      5+
                    </option>

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
                    className="
                      h-10
                      w-full
                      rounded-lg
                      border
                      border-border
                      bg-background
                      px-3
                      text-xs
                    "
                  >

                    <option value="">
                      Any
                    </option>

                    <option value="10">
                      10+
                    </option>

                    <option value="20">
                      20+
                    </option>

                    <option value="30">
                      30+
                    </option>

                    <option value="40">
                      40+
                    </option>

                    <option value="50">
                      50+
                    </option>

                    <option value="60">
                      60+
                    </option>

                    <option value="70">
                      70+
                    </option>

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
                        e.target.value as
                          | 'all'
                          | 'home'
                          | 'away'
                          | 'draw',
                      )
                    }
                    className="
                      h-10
                      w-full
                      rounded-lg
                      border
                      border-border
                      bg-background
                      px-3
                      text-xs
                    "
                  >

                    <option value="all">
                      Any
                    </option>

                    <option value="home">
                      Home Wins
                    </option>

                    <option value="away">
                      Away Wins
                    </option>

                    <option value="draw">
                      Draws
                    </option>

                  </select>

                </div>


                {/* RESET */}

                <button
                  type="button"
                  onClick={() => {
                    onReset();
                    setShowFilters(false);
                  }}
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

                  <RotateCcw
                    size={16}
                  />

                  Reset Filters

                </button>

              </div>

            </div>

          )}

        </div>

      </div>


      {/* ====================================================
          MOBILE
      ==================================================== */}

      <div
        className="
          md:hidden
        "
      >

        <div
          className="
            flex
            items-center
            justify-between
          "
        >

          {/* SEARCH BUTTON */}

          <button
            type="button"
            onClick={() =>
              setShowSearch(
                current => !current,
              )
            }
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-lg
              border
              border-border
            "
          >

            {showSearch ? (
              <X size={18} />
            ) : (
              <Search size={18} />
            )}

          </button>


          {/* MOBILE FILTER */}

          <div
            className="
              relative
            "
          >

            <button
              type="button"
              onClick={() =>
                setShowFilters(
                  current => !current,
                )
              }
              className="
                inline-flex
                h-10
                items-center
                gap-2
                rounded-lg
                border
                border-border
                px-4
                text-xs
                font-medium
              "
            >

              <SlidersHorizontal
                size={17}
              />

              Filters

            </button>


            {showFilters && (

              <div
                className="
                  absolute
                  right-0
                  top-12
                  z-50
                  w-72
                  rounded-xl
                  border
                  border-border
                  bg-popover
                  p-4
                  shadow-lg
                "
              >

                <div
                  className="
                    space-y-4
                  "
                >

                  {/* DATE */}

                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) =>
                      onDateChange(
                        e.target.value,
                      )
                    }
                    className="
                      h-10
                      w-full
                      rounded-lg
                      border
                      border-border
                      bg-background
                      px-3
                      text-xs
                    "
                  />


                  {/* GOALS */}

                  <select
                    value={goalFilter}
                    onChange={(e) =>
                      onGoalFilterChange(
                        e.target.value,
                      )
                    }
                    className="
                      h-10
                      w-full
                      rounded-lg
                      border
                      border-border
                      bg-background
                      px-3
                      text-xs
                    "
                  >

                    <option value="">
                      Goals
                    </option>

                    <option value="1">
                      1+
                    </option>

                    <option value="2">
                      2+
                    </option>

                    <option value="3">
                      3+
                    </option>

                    <option value="4">
                      4+
                    </option>

                    <option value="5">
                      5+
                    </option>

                  </select>


                  {/* POINTS */}

                  <select
                    value={pointsFilter}
                    onChange={(e) =>
                      onPointsFilterChange(
                        e.target.value,
                      )
                    }
                    className="
                      h-10
                      w-full
                      rounded-lg
                      border
                      border-border
                      bg-background
                      px-3
                      text-xs
                    "
                  >

                    <option value="">
                      Points
                    </option>

                    <option value="10">
                      10+
                    </option>

                    <option value="20">
                      20+
                    </option>

                    <option value="30">
                      30+
                    </option>

                    <option value="40">
                      40+
                    </option>

                    <option value="50">
                      50+
                    </option>

                    <option value="60">
                      60+
                    </option>

                    <option value="70">
                      70+
                    </option>

                  </select>


                  {/* RESULT */}

                  <select
                    value={resultFilter}
                    onChange={(e) =>
                      onResultFilterChange(
                        e.target.value as
                          | 'all'
                          | 'home'
                          | 'away'
                          | 'draw',
                      )
                    }
                    className="
                      h-10
                      w-full
                      rounded-lg
                      border
                      border-border
                      bg-background
                      px-3
                      text-xs
                    "
                  >

                    <option value="all">
                      Result
                    </option>

                    <option value="home">
                      Home Wins
                    </option>

                    <option value="away">
                      Away Wins
                    </option>

                    <option value="draw">
                      Draws
                    </option>

                  </select>


                  {/* RESET */}

                  <button
                    type="button"
                    onClick={() => {
                      onReset();
                      setShowFilters(false);
                    }}
                    className="
                      flex
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-lg
                      border
                      border-border
                      py-2
                      text-xs
                      font-medium
                      hover:bg-muted
                    "
                  >

                    <RotateCcw
                      size={16}
                    />

                    Reset Filters

                  </button>

                </div>

              </div>

            )}

          </div>

        </div>


        {/* MOBILE SEARCH */}

        {showSearch && (

          <div
            className="
              relative
              mt-3
            "
          >

            <Search
              size={18}
              className="
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
                onSearchChange(
                  e.target.value,
                )
              }
              placeholder="Search..."
              className="
                h-11
                w-full
                rounded-xl
                border
                border-border
                bg-transparent
                pl-10
                pr-4
                text-xs
                outline-none
                focus:border-primary
              "
            />

          </div>

        )}

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

        {[
          ['all', 'All'],
          ['predictions', 'Predictions'],
          ['live', 'Live'],
          ['today', 'Today'],
          ['results', 'Results'],
          ['upcoming', 'Upcoming'],
          ['table', 'Table'],
        ].map(
          ([value, label]) => (

            <button
              key={value}
              type="button"
              onClick={() =>
                onSectionViewChange(
                  value as SectionView,
                )
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