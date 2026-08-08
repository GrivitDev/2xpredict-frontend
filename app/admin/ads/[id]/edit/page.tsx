'use client';


import Link from 'next/link';



import {
  useParams,
} from 'next/navigation';



import {
  ArrowLeft,
} from 'lucide-react';



import {
  Button,
} from '@/components/ui/button';



import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';



import {
  AdForm,
} from '@/components/admin/ads/AdForm';



import {
  useAd,
} from '@/hooks/useAds';









export default function EditAdPage(){



  const params =
    useParams();



  const id =
    params.id as string;





  const {
    data:ad,

    isLoading,

    isError,

  } = useAd(id);









  if(isLoading){


    return (

      <div className="py-10 text-center text-muted-foreground">

        Loading advertisement...

      </div>

    );


  }








  if(isError || !ad){


    return (

      <div className="py-10 text-center text-destructive">

        Advertisement not found.

      </div>

    );


  }










  return (

    <div className="space-y-8">





      {/* HEADER */}



      <div
        className="
          flex
          items-center
          gap-4
        "
      >



        <Button

          variant="outline"

          size="icon"

          asChild

        >


          <Link href="/admin/ads">


            <ArrowLeft className="size-4"/>


          </Link>


        </Button>







        <div>


          <h1 className="text-3xl font-bold">

            Edit Advertisement

          </h1>



          <p className="text-muted-foreground">

            Update advertisement details and display rules.

          </p>



        </div>




      </div>









      <Card className="surface">


        <CardHeader>


          <CardTitle>

            Advertisement Details

          </CardTitle>


        </CardHeader>






        <CardContent>



          <AdForm

            mode="edit"

            defaultValues={ad}

          />



        </CardContent>





      </Card>






    </div>

  );


}