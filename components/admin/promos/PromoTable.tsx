'use client';


import {
  useQuery,
} from '@tanstack/react-query';


import {
  getPromos,
} from '@/services/admin-promos.service';


import {
  Promo,
} from '@/types/promo';


import PromoStatusBadge from './PromoStatusBadge';

import PromoActions from './PromoActions';



import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';


import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';


import {
  Skeleton,
} from '@/components/ui/skeleton';



import {
  PROMO_REQUIREMENT_LABELS,
  PROMO_CAMPAIGN_LABELS,
  REWARD_TYPE_LABELS,
} from '@/constants/promo';





export default function PromoTable(){


  const {
    data:promos = [],
    isLoading,
  } = useQuery({

    queryKey:[
      'admin-promos',
    ],

    queryFn:getPromos,

  });





  function rewardText(
    promo:Promo,
  ){

    if(
      promo.rewardType === 'subscription'
    ){

      return `${promo.rewardPlan?.toUpperCase()} ${promo.rewardDurationDays} Days`;

    }


    return `₦${promo.rewardAmount}`;

  }





  if(isLoading){

    return (

      <Card>

        <CardContent className="space-y-4 p-6">

          {
            [1,2,3,4].map(
              item=>(

                <Skeleton
                  key={item}
                  className="h-12 w-full"
                />

              )
            )
          }

        </CardContent>

      </Card>

    );

  }





  return (

    <Card>


      <CardHeader>

        <CardTitle>

          Promo Campaigns

        </CardTitle>


      </CardHeader>



      <CardContent>


        <div className="overflow-x-auto">


          <Table>


            <TableHeader>

              <TableRow>


                <TableHead>
                  Name
                </TableHead>


                <TableHead>
                  Campaign
                </TableHead>


                <TableHead>
                  Requirement
                </TableHead>


                <TableHead>
                  Reward
                </TableHead>


                <TableHead>
                  Duration
                </TableHead>


                <TableHead>
                  Status
                </TableHead>


                <TableHead>
                  Actions
                </TableHead>


              </TableRow>


            </TableHeader>



            <TableBody>



              {
                promos.map(
                  (promo)=>(
                    
                    <TableRow
                      key={promo._id}
                    >


                      <TableCell>

                        <div>

                          <p className="font-medium">

                            {promo.name}

                          </p>


                          {
                            promo.promoCode && (

                              <p className="text-xs text-muted-foreground">

                                {promo.promoCode}

                              </p>

                            )
                          }


                        </div>


                      </TableCell>





                      <TableCell>

                        {
                          PROMO_CAMPAIGN_LABELS[
                            promo.campaignType
                          ]
                        }


                      </TableCell>





                      <TableCell>

                        {
                          PROMO_REQUIREMENT_LABELS[
                            promo.requirement
                          ]
                        }


                      </TableCell>





                      <TableCell>

                        {rewardText(promo)}

                      </TableCell>





                      <TableCell>

                        <div className="text-sm">

                          <p>

                            {new Date(
                              promo.startDate
                            ).toLocaleDateString()}

                          </p>


                          <p className="text-muted-foreground">

                            to

                          </p>


                          <p>

                            {new Date(
                              promo.endDate
                            ).toLocaleDateString()}

                          </p>


                        </div>


                      </TableCell>





                      <TableCell>

                        <PromoStatusBadge
                          promo={promo}
                        />

                      </TableCell>





                      <TableCell>

                        <PromoActions
                          promo={promo}
                        />

                      </TableCell>



                    </TableRow>

                  )
                )
              }



            </TableBody>


          </Table>


        </div>


      </CardContent>


    </Card>

  );

}