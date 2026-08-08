'use client';

import Link from 'next/link';

import {
  Edit,
  Trash2,
  Power,
} from 'lucide-react';


import {
  Button,
} from '@/components/ui/button';


import {
  Badge,
} from '@/components/ui/badge';


import {
  Card,
  CardContent,
} from '@/components/ui/card';



import {
  AdminAd,
} from '@/types/ad';




interface AdTableProps {

  ads:AdminAd[];

  onDelete?:(id:string)=>void;

  onToggle?:(id:string)=>void;

}




export function AdTable({

  ads,

  onDelete,

  onToggle,

}:AdTableProps){



  return (

    <div className="space-y-4">


      {
        ads.map((ad)=>(


          <Card

            key={ad._id}

            className="surface"

          >


            <CardContent className="p-5">


              <div
                className="
                  flex
                  flex-col
                  gap-4
                  lg:flex-row
                  lg:items-center
                  lg:justify-between
                "
              >



                {/* Advertisement info */}


                <div className="space-y-2">


                  <div className="flex items-center gap-3">


                    <h3 className="font-semibold">

                      {ad.title}

                    </h3>



                    <Badge

                      variant={
                        ad.isActive
                        ? 'default'
                        : 'secondary'
                      }

                    >

                      {
                        ad.isActive
                        ? 'Active'
                        : 'Inactive'
                      }

                    </Badge>



                  </div>





                  {
                    ad.subTitle && (

                      <p className="text-sm text-muted-foreground">

                        {ad.subTitle}

                      </p>

                    )
                  }




                  <div className="
                    flex
                    gap-5
                    text-sm
                    text-muted-foreground
                  ">


                    <span>

                      Views:
                      {' '}
                      {ad.impressions.toLocaleString()}

                    </span>



                    <span>

                      Clicks:
                      {' '}
                      {ad.clicks.toLocaleString()}

                    </span>



                    <span>

                      CTR:
                      {' '}
                      {
                        ad.impressions > 0
                        ?
                        (
                          (
                            ad.clicks /
                            ad.impressions
                          )
                          *
                          100
                        ).toFixed(2)
                        :
                        0
                      }%

                    </span>


                  </div>



                </div>







                {/* Actions */}


                <div className="
                  flex
                  items-center
                  gap-2
                ">



                  <Button

                    size="sm"

                    variant="outline"

                    asChild

                  >

                    <Link
                      href={`/admin/ads/${ad._id}/edit`}
                    >

                      <Edit className="mr-2 size-4"/>

                      Edit

                    </Link>


                  </Button>





                  <Button

                    size="icon"

                    variant="outline"

                    onClick={()=>
                      onToggle?.(ad._id)
                    }

                  >

                    <Power className="size-4"/>

                  </Button>






                  <Button

                    size="icon"

                    variant="destructive"

                    onClick={()=>
                      onDelete?.(ad._id)
                    }

                  >

                    <Trash2 className="size-4"/>

                  </Button>




                </div>




              </div>


            </CardContent>


          </Card>


        ))
      }



    </div>

  );

}