interface LegalHighlightProps {
  children: React.ReactNode;
}

export default function LegalHighlight({
  children,
}: LegalHighlightProps) {
  return (
    <blockquote
      className="
        relative
        my-10
        overflow-hidden
        rounded-3xl
        border
        border-primary/20
        bg-primary/5
        px-6
        py-6
        text-base
        italic
        leading-8
        text-foreground
        shadow-sm
        transition-colors
        duration-300
        sm:px-8
        sm:py-7
        sm:text-lg
      "
    >
      <div
        className="
          absolute
          inset-y-0
          left-0
          w-1
          rounded-l-3xl
          bg-primary
        "
      />

      <div
        className="
          relative
          pl-3
          sm:pl-4
        "
      >
        {children}
      </div>
    </blockquote>
  );
}