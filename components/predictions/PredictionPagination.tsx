'use client';

interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export default function PredictionPagination({
  page,
  totalPages,
  onChange,
}: Props) {
  if (totalPages <= 1) {
    return null;
  }

  const goToPage = (nextPage: number) => {
    if (
      nextPage < 1 ||
      nextPage > totalPages ||
      nextPage === page
    ) {
      return;
    }

    onChange(nextPage);
  };

  return (
    <nav
      aria-label="Prediction pagination"
      className="
        flex
        items-center
        justify-center
        gap-1.5
        pt-5
      "
    >
      <PaginationButton
        disabled={page === 1}
        onClick={() => goToPage(page - 1)}
      >
        Previous
      </PaginationButton>

      <div
        className="
          flex
          items-center
          gap-1
        "
      >
        {Array.from(
          { length: totalPages },
          (_, index) => {
            const number = index + 1;
            const active = page === number;

            return (
              <button
                key={number}
                type="button"
                aria-current={
                  active
                    ? 'page'
                    : undefined
                }
                onClick={() =>
                  goToPage(number)
                }
                className={`
                  h-8
                  w-8
                  rounded-lg
                  text-[11px]
                  font-semibold
                  transition
                  focus:outline-none
                  focus:ring-2
                  focus:ring-primary/30

                  ${
                    active
                      ? `
                        bg-primary
                        text-primary-foreground
                      `
                      : `
                        border
                        border-border
                        bg-background
                        hover:bg-muted
                      `
                  }
                `}
              >
                {number}
              </button>
            );
          },
        )}
      </div>

      <PaginationButton
        disabled={page === totalPages}
        onClick={() => goToPage(page + 1)}
      >
        Next
      </PaginationButton>
    </nav>
  );
}

/* =========================================================
   PAGINATION BUTTON
========================================================= */

function PaginationButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="
        rounded-lg
        border
        border-border
        bg-background
        px-3
        py-1.5
        text-[11px]
        font-semibold
        transition
        hover:bg-muted
        focus:outline-none
        focus:ring-2
        focus:ring-primary/30
        disabled:pointer-events-none
        disabled:opacity-40
      "
    >
      {children}
    </button>
  );
}