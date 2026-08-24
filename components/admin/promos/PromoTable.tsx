'use client';

import type {
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
  PROMO_REQUIREMENT_LABELS,
  PROMO_CAMPAIGN_LABELS,
} from '@/constants/promo';





interface Props {

  promos:Promo[];

}





export default function PromoTable({
  promos,
}:Props) {


  function rewardText(
    promo:Promo,
  ) {

    if (
      promo.rewardType === 'subscription'
    ) {

      return [
        promo.rewardPlan?.toUpperCase(),
        promo.rewardDurationDays
          ? `${promo.rewardDurationDays} Days`
          : null,
      ]
        .filter(Boolean)
        .join(' ');

    }


    return `₦${(
      promo.rewardAmount ?? 0
    ).toLocaleString()}`;

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


              {promos.length === 0 ? (

                <TableRow>

                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >

                    No promo campaigns found.

                  </TableCell>

                </TableRow>

              ) : (

                promos.map(
                  promo => (

                    <TableRow
                      key={promo._id}
                    >


                      {/* NAME */}

                      <TableCell>

                        <div>

                          <p className="font-medium">
                            {promo.name}
                          </p>


                          {promo.promoCode && (

                            <p className="text-xs text-muted-foreground">
                              {promo.promoCode}
                            </p>

                          )}

                        </div>

                      </TableCell>




                      {/* CAMPAIGN */}

                      <TableCell>

                        {
                          PROMO_CAMPAIGN_LABELS[
                            promo.campaignType
                          ]
                        }

                      </TableCell>




                      {/* REQUIREMENT */}

                      <TableCell>

                        {
                          PROMO_REQUIREMENT_LABELS[
                            promo.requirement
                          ]
                        }

                      </TableCell>




                      {/* REWARD */}

                      <TableCell>

                        {rewardText(promo)}

                      </TableCell>




                      {/* DURATION */}

                      <TableCell>

                        <div className="text-s">

                          <p>
                            {new Date(
                              promo.startDate,
                            ).toLocaleDateString()}
                          </p>


                          <p className="text-muted-foreground">
                            to
                          </p>


                          <p>
                            {new Date(
                              promo.endDate,
                            ).toLocaleDateString()}
                          </p>

                        </div>

                      </TableCell>




                      {/* STATUS */}

                      <TableCell>

                        <PromoStatusBadge
                          promo={promo}
                        />

                      </TableCell>




                      {/* ACTIONS */}

                      <TableCell>

                        <PromoActions
                          promo={promo}
                        />

                      </TableCell>


                    </TableRow>

                  ),
                )

              )}


            </TableBody>


          </Table>


        </div>


      </CardContent>


    </Card>

  );

}