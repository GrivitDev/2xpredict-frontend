'use client';


import {
  useQuery,
} from '@tanstack/react-query';


import {
  useParams,
} from 'next/navigation';


import {
  getPromo,
} from '@/services/admin-promos.service';


import PromoForm from '@/components/admin/promos/PromoForm';


import {
  Skeleton,
} from '@/components/ui/skeleton';
import PromoRewards from '@/components/admin/promos/PromoRewards';



export default function EditPromoPage(){


  const params = useParams();


  const id =
    params.id as string;




  const {
    data:promo,
    isLoading,
  } = useQuery({

    queryKey:[
      'admin-promo',
      id,
    ],


    queryFn:()=>getPromo(id),


    enabled:!!id,

  });





  if(isLoading){


    return (

      <div className="space-y-6">


        <Skeleton className="h-10 w-64"/>


        <Skeleton className="h-[600px] w-full"/>


      </div>

    );


  }





  if(!promo){


    return (

      <div className="text-muted-foreground">

        Promo not found.

      </div>

    );

  }





  return (

    <div className="space-y-8">


      <div>


        <h1 className="text-3xl font-bold">

          Edit Promo

        </h1>


        <p className="text-muted-foreground">

          Update promotional campaign settings.

        </p>


      </div>




          <PromoForm
            promo={promo}
          />


          <PromoRewards
            promoId={id}
          />



    </div>

  );

}