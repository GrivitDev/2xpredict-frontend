'use client';


import {
  Button,
} from '@/components/ui/button';



export type ReferralFilter =
  | 'all'
  | 'registered'
  | 'regular'
  | 'vip'
  | 'prediction'
  | 'reward';



interface ReferralFiltersProps {

  activeFilter: ReferralFilter;

  onChange:(filter:ReferralFilter)=>void;

}



export default function ReferralFilters({

  activeFilter,

  onChange,

}:ReferralFiltersProps){



  const filters:{label:string; value:ReferralFilter}[] = [

    {
      label:'All',
      value:'all',
    },


    {
      label:'Registered',
      value:'registered',
    },


    {
      label:'Regular',
      value:'regular',
    },


    {
      label:'VIP',
      value:'vip',
    },


    {
      label:'Prediction',
      value:'prediction',
    },


    {
      label:'Reward Claimed',
      value:'reward',
    },

  ];



  return (

    <div className="flex flex-wrap gap-2">


      {
        filters.map((filter)=>{


          return (

            <Button

              key={filter.value}

              size="sm"

              variant={
                activeFilter === filter.value
                  ? 'default'
                  : 'outline'
              }

              onClick={()=>onChange(filter.value)}

            >

              {filter.label}

            </Button>

          );


        })
      }


    </div>

  );

}