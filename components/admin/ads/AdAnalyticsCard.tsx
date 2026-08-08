'use client';

import {
  LucideIcon,
} from 'lucide-react';


import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';





interface AdAnalyticsCardProps {


  title:string;


  value:number | string;


  icon:LucideIcon;


  description?:string;


}





export function AdAnalyticsCard({

  title,

  value,

  icon:Icon,

  description,

}:AdAnalyticsCardProps){



  return (

    <Card className="surface">


      <CardHeader
        className="
          flex
          flex-row
          items-center
          justify-between
          space-y-0
          pb-2
        "
      >


        <CardTitle
          className="
            text-sm
            font-medium
          "
        >

          {title}

        </CardTitle>




        <Icon
          className="
            size-5
            text-muted-foreground
          "
        />



      </CardHeader>




      <CardContent>


        <div
          className="
            text-2xl
            font-bold
          "
        >

          {
            typeof value === 'number'
            ?
            value.toLocaleString()
            :
            value
          }

        </div>




        {
          description && (

            <p
              className="
                mt-1
                text-xs
                text-muted-foreground
              "
            >

              {description}

            </p>

          )
        }



      </CardContent>


    </Card>

  );

}