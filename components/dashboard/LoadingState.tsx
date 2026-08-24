export default function LoadingState() {
  return (
    <div
      className="
        animate-pulse
        space-y-3
      "
    >

      {/* ======================================================
          PROFILE
          ====================================================== */}

      <div
        className="
          overflow-hidden
          rounded-2xl
          border
          border-border/60
          bg-card
        "
      >

        <div
          className="
            flex
            items-center
            gap-3
            px-4
            py-3.5
          "
        >

          {/* Avatar */}

          <div
            className="
              h-11
              w-11
              shrink-0
              rounded-xl
              bg-muted/60
            "
          />

          {/* Identity */}

          <div
            className="
              min-w-0
              flex-1
              space-y-2
            "
          >

            <div
              className="
                h-4
                w-32
                rounded-md
                bg-muted/60
              "
            />

            <div
              className="
                h-3
                w-20
                rounded-md
                bg-muted/40
              "
            />

          </div>

        </div>


        {/* Contact */}

        <div
          className="
            grid
            grid-cols-2
            border-t
            border-border/50
          "
        >

          {[1, 2].map((item) => (

            <div
              key={item}
              className={`
                flex
                items-center
                gap-2.5
                px-4
                py-3
                ${item === 2 ? 'border-l border-border/50' : ''}
              `}
            >

              <div
                className="
                  h-7
                  w-7
                  shrink-0
                  rounded-lg
                  bg-muted/50
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
                    w-10
                    rounded
                    bg-muted/40
                  "
                />

                <div
                  className="
                    h-3
                    w-20
                    max-w-full
                    rounded
                    bg-muted/50
                  "
                />

              </div>

            </div>

          ))}

        </div>

      </div>


      {/* ======================================================
          MEMBERSHIP + PROMOS
          ====================================================== */}

      <div
        className="
          grid
          gap-3
          xl:grid-cols-2
        "
      >

        {[1, 2].map((item) => (

          <div
            key={item}
            className="
              h-[150px]
              rounded-2xl
              border
              border-border/60
              bg-card
              p-4
            "
          >

            <div className="space-y-4">

              <div className="flex items-center gap-3">

                <div
                  className="
                    h-9
                    w-9
                    rounded-lg
                    bg-muted/60
                  "
                />

                <div className="flex-1 space-y-2">

                  <div
                    className="
                      h-3.5
                      w-28
                      rounded-md
                      bg-muted/60
                    "
                  />

                  <div
                    className="
                      h-2.5
                      w-20
                      rounded-md
                      bg-muted/40
                    "
                  />

                </div>

              </div>


              <div className="space-y-2">

                <div
                  className="
                    h-3
                    w-full
                    rounded
                    bg-muted/40
                  "
                />

                <div
                  className="
                    h-3
                    w-4/5
                    rounded
                    bg-muted/40
                  "
                />

              </div>

            </div>

          </div>

        ))}

      </div>


      {/* ======================================================
          TOP PREDICTIONS
          ====================================================== */}

      <div
        className="
          grid
          gap-2.5
          sm:grid-cols-2
          xl:grid-cols-3
        "
      >

        {[1, 2, 3].map((item) => (

          <div
            key={item}
            className="
              h-[145px]
              rounded-2xl
              border
              border-border/60
              bg-card
              p-4
            "
          >

            <div className="space-y-4">

              {/* Header */}

              <div className="flex items-center gap-3">

                <div
                  className="
                    h-9
                    w-9
                    shrink-0
                    rounded-lg
                    bg-muted/60
                  "
                />

                <div
                  className="
                    min-w-0
                    flex-1
                    space-y-2
                  "
                >

                  <div
                    className="
                      h-3.5
                      w-3/4
                      rounded-md
                      bg-muted/60
                    "
                  />

                  <div
                    className="
                      h-2.5
                      w-1/2
                      rounded
                      bg-muted/40
                    "
                  />

                </div>

              </div>


              {/* Content */}

              <div className="space-y-2">

                <div
                  className="
                    h-3
                    w-full
                    rounded
                    bg-muted/40
                  "
                />

                <div
                  className="
                    h-3
                    w-2/3
                    rounded
                    bg-muted/40
                  "
                />

              </div>


              {/* Footer */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >

                <div
                  className="
                    h-5
                    w-16
                    rounded-full
                    bg-muted/50
                  "
                />

                <div
                  className="
                    h-5
                    w-12
                    rounded-full
                    bg-muted/40
                  "
                />

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}