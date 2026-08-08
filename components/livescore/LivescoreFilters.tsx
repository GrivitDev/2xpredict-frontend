'use client';

import {
  Search,
  RotateCcw,
} from 'lucide-react';

interface Props {

  search:string;

  selectedDate:string;

  goalFilter:string;

  pointsFilter:string;

  resultFilter:'all'|'home'|'away'|'draw';

  onSearchChange:(value:string)=>void;

  onDateChange:(value:string)=>void;

  onGoalFilterChange:(value:string)=>void;

  onPointsFilterChange:(value:string)=>void;

  onResultFilterChange:(
    value:'all'|'home'|'away'|'draw'
  )=>void;

  onReset:()=>void;

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

  onReset,

}:Props){

  return(

<section
  className="
    relative
    overflow-hidden
  "
>

      <div
        className="
          grid
          gap-5
          lg:grid-cols-12
        "
      >

        {/* SEARCH */}

        <div
          className="
            relative
            lg:col-span-4
          "
        >

          <Search
            size={18}
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-muted-foreground
            "
          />

          <input

            type="text"

            value={search}

            onChange={(e)=>
              onSearchChange(
                e.target.value,
              )
            }

            placeholder="
              Search team, league or venue...
            "

            className="
              h-12
              w-full
              rounded-xl
              border
              border-border
              bg-background
              pl-11
              pr-4
              text-sm
              outline-none
              transition
              focus:border-primary
            "

          />

        </div>

        {/* DATE */}

        <div
          className="
            lg:col-span-2
          "
        >

          <input

            type="date"

            value={selectedDate}

            onChange={(e)=>
              onDateChange(
                e.target.value,
              )
            }

            className="
              h-12
              w-full
              rounded-xl
              border
              border-border
              bg-background
              px-4
              text-sm
              outline-none
              focus:border-primary
            "

          />

        </div>

        {/* GOALS */}

        <div
          className="
            lg:col-span-2
          "
        >

          <select

            value={goalFilter}

            onChange={(e)=>
              onGoalFilterChange(
                e.target.value,
              )
            }

            className="
              h-12
              w-full
              rounded-xl
              border
              border-border
              bg-background
              px-4
              text-sm
              outline-none
              focus:border-primary
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

        </div>

        {/* POINTS */}

        <div
          className="
            lg:col-span-2
          "
        >

          <select

            value={pointsFilter}

            onChange={(e)=>
              onPointsFilterChange(
                e.target.value,
              )
            }

            className="
              h-12
              w-full
              rounded-xl
              border
              border-border
              bg-background
              px-4
              text-sm
              outline-none
              focus:border-primary
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

        </div>

        {/* RESULT */}

        <div
          className="
            lg:col-span-2
          "
        >

          <select

            value={resultFilter}

            onChange={(e)=>

              onResultFilterChange(

                e.target.value as
                'all'
                |'home'
                |'away'
                |'draw',

              )

            }

            className="
              h-12
              w-full
              rounded-xl
              border
              border-border
              bg-background
              px-4
              text-sm
              outline-none
              focus:border-primary
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

        </div>

      </div>

<div
  className="
    mt-5
    flex
    items-center
    justify-between
    gap-4
    px-3
  "
>
  <p
    className="
      text-sm
      text-muted-foreground
      sm:text-base
    "
  >
    Filter matches and standings by team, date, goals, points, or result.
  </p>

  <button
    onClick={onReset}
    className="
      inline-flex
      shrink-0
      items-center
      gap-2
      rounded-xl
      border
      border-border
      px-4
      py-2
      text-sm
      font-semibold
      transition
      hover:bg-muted
    "
  >
    <RotateCcw size={16} />

    Reset Filters
  </button>
</div>

    </section>

  );

}