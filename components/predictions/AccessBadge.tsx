'use client';


interface Props {

  accessType:
  | 'free'
  | 'regular'
  | 'vip'
  | string;

}


export default function AccessBadge({
  accessType,
}:Props){


  const styles = {

    free:
    `
      bg-slate-500/10
      text-slate-400
      border-slate-500/20
    `,

    regular:
    `
      bg-emerald-500/10
      text-emerald-400
      border-emerald-500/20
    `,

    vip:
    `
      bg-yellow-500/10
      text-yellow-400
      border-yellow-500/30
    `,

  };



  return (

    <span

      className={`
        inline-flex
        items-center
        rounded-full
        border
        px-3
        py-1
        text-xs
        font-semibold
        uppercase
        tracking-wide
        ${
          styles[
            accessType as keyof typeof styles
          ] ??
          styles.free
        }
      `}

    >

      {
        accessType === 'vip'
        && '👑 '
      }

      {accessType}


    </span>

  );

}