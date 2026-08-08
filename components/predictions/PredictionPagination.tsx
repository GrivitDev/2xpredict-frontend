'use client';


interface Props {

  page:number;

  totalPages:number;

  onChange:(page:number)=>void;

}



export default function PredictionPagination({

  page,

  totalPages,

  onChange,

}:Props){



  if(totalPages <= 1){

    return null;

  }




  return (

    <div

      className="
        flex
        items-center
        justify-center
        gap-2
        pt-6
      "

    >



      <button

        disabled={
          page === 1
        }

        onClick={()=>
          onChange(page - 1)
        }

        className="
          rounded-xl
          border
          px-4
          py-2
          text-sm
          disabled:opacity-40
          transition
          hover:bg-muted
        "

      >

        Previous

      </button>






      {
        Array.from(
          {
            length:totalPages
          }
        )
        .map((_,index)=>{


          const number =
            index + 1;



          return (

            <button

              key={number}

              onClick={()=>
                onChange(number)
              }

              className={`
                h-9
                w-9
                rounded-xl
                text-sm
                transition

                ${
                  page === number

                  ?
                  `
                  bg-primary
                  text-primary-foreground
                  `

                  :

                  `
                  border
                  hover:bg-muted
                  `
                }
              `}

            >

              {number}

            </button>

          );


        })
      }







      <button

        disabled={
          page === totalPages
        }

        onClick={()=>
          onChange(page + 1)
        }

        className="
          rounded-xl
          border
          px-4
          py-2
          text-sm
          disabled:opacity-40
          transition
          hover:bg-muted
        "

      >

        Next

      </button>



    </div>

  );

}