'use client';

interface Props {
  confidence:number;
}


export default function ConfidenceBadge({
  confidence,
}:Props){


  const level =
    confidence >= 80
      ? 'High'
      : confidence >= 60
      ? 'Medium'
      : 'Low';



  return (

    <div className="space-y-2">


      <div
        className="
          flex
          items-center
          justify-between
          text-xs
        "
      >

        <span
          className="
            text-muted-foreground
          "
        >
          Confidence
        </span>


        <span
          className={`
            font-bold
            ${
              confidence >= 80
              ? 'text-emerald-400'
              : confidence >= 60
              ? 'text-yellow-400'
              : 'text-red-400'
            }
          `}
        >
          {confidence}%
        </span>


      </div>




      <div
        className="
          h-2
          rounded-full
          bg-muted
          overflow-hidden
        "
      >

        <div
          className={`
            h-full
            rounded-full
            transition-all
            ${
              confidence >= 80
              ? 'bg-emerald-500'
              : confidence >= 60
              ? 'bg-yellow-500'
              : 'bg-red-500'
            }
          `}
          style={{
            width:`${confidence}%`,
          }}
        />


      </div>



      <p
        className="
          text-[11px]
          text-muted-foreground
        "
      >

        {level} confidence prediction

      </p>


    </div>

  );

}