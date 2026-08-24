'use client';

import ProfileHero from '@/components/dashboard/profile/ProfileHero';

import { useProfile } from '@/hooks/useProfile';
import { usePurchases } from '@/hooks/usePurchases';


// ============================================================
// PROFILE PAGE
// ============================================================

export default function ProfilePage() {

  const {
    user,
    loading,
  } = useProfile();


  const {
    plan,
  } = usePurchases();


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading || !user) {

    return (

      <main
        className="
          w-full
          animate-pulse
        "
      >

        <div
          className="
            relative
            overflow-hidden
            rounded-2xl
            border
            border-border/60
            bg-card
            shadow-sm
          "
        >

          {/* Top bar */}

          <div
            className="
              flex
              items-center
              justify-between
              border-b
              border-border/50
              px-4
              py-3
              sm:px-5
            "
          >

            <div
              className="
                h-6
                w-32
                rounded-md
                bg-muted
              "
            />

            <div
              className="
                h-6
                w-14
                rounded-full
                bg-muted
              "
            />

          </div>


          {/* Profile */}

          <div
            className="
              p-4
              sm:p-5
            "
          >

            <div
              className="
                flex
                flex-col
                gap-4
                sm:flex-row
                sm:items-center
              "
            >

              <div
                className="
                  mx-auto
                  h-[76px]
                  w-[76px]
                  shrink-0
                  rounded-2xl
                  bg-muted
                  sm:mx-0
                "
              />


              <div
                className="
                  flex-1
                  space-y-2.5
                  text-center
                  sm:text-left
                "
              >

                <div
                  className="
                    mx-auto
                    h-7
                    w-48
                    rounded-md
                    bg-muted
                    sm:mx-0
                  "
                />

                <div
                  className="
                    mx-auto
                    h-4
                    w-28
                    rounded-md
                    bg-muted
                    sm:mx-0
                  "
                />

                <div
                  className="
                    mx-auto
                    h-4
                    w-64
                    max-w-full
                    rounded-md
                    bg-muted
                    sm:mx-0
                  "
                />

              </div>

            </div>


            {/* Account information */}

            <div
              className="
                mt-5
                border-t
                border-border/50
                pt-4
              "
            >

              <div
                className="
                  mb-2.5
                  h-3
                  w-36
                  rounded
                  bg-muted
                "
              />


              <div
                className="
                  grid
                  gap-2
                  sm:grid-cols-3
                "
              >

                <LoadingItem />

                <LoadingItem />

                <LoadingItem />

              </div>

            </div>


            {/* Stats */}

            <div
              className="
                mt-2
                grid
                gap-2
                sm:grid-cols-3
              "
            >

              <LoadingItem />

              <LoadingItem />

              <LoadingItem />

            </div>


            {/* Actions */}

            <div
              className="
                mt-4
                border-t
                border-border/50
                pt-4
              "
            >

              <div
                className="
                  mb-2.5
                  h-3
                  w-28
                  rounded
                  bg-muted
                "
              />


              <div
                className="
                  flex
                  flex-wrap
                  gap-2
                "
              >

                <div
                  className="
                    h-9
                    w-28
                    rounded-lg
                    bg-muted
                  "
                />

                <div
                  className="
                    h-9
                    w-36
                    rounded-lg
                    bg-muted
                  "
                />

                <div
                  className="
                    h-9
                    w-24
                    rounded-lg
                    bg-muted
                  "
                />

                <div
                  className="
                    h-9
                    w-32
                    rounded-lg
                    bg-muted
                  "
                />

              </div>

            </div>

          </div>

        </div>

      </main>
    );
  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <main
      className="
        w-full
      "
    >

      <ProfileHero
        user={user}
        plan={plan}
      />

    </main>
  );
}


// ============================================================
// LOADING ITEM
// ============================================================

function LoadingItem() {

  return (

    <div
      className="
        flex
        h-[60px]
        items-center
        gap-3
        rounded-xl
        border
        border-border/50
        bg-muted/[0.12]
        px-3
      "
    >

      <div
        className="
          h-8
          w-8
          shrink-0
          rounded-lg
          bg-muted
        "
      />

      <div
        className="
          min-w-0
          flex-1
          space-y-1.5
        "
      >

        <div
          className="
            h-2.5
            w-20
            rounded
            bg-muted
          "
        />

        <div
          className="
            h-3.5
            w-28
            max-w-full
            rounded
            bg-muted
          "
        />

      </div>

    </div>
  );
}