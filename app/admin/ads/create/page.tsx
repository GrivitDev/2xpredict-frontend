'use client';


import Link from 'next/link';


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







export default function CreateAdPage(){



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

            Create Advertisement

          </h1>



          <p className="text-muted-foreground">

            Create and configure a new internal advertisement.

          </p>



        </div>




      </div>









      {/* FORM */}



      <Card className="surface">



        <CardHeader>


          <CardTitle>

            Advertisement Details

          </CardTitle>


        </CardHeader>






        <CardContent>


          <AdForm

            mode="create"

          />


        </CardContent>





      </Card>





    </div>

  );


}