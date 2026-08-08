'use client';


import {
  Referral,
} from '@/types/referral';


import ReferralStatusBadge from './ReferralStatusBadge';



interface ReferralTableProps {

  referrals: Referral[];

}



export default function ReferralTable({
  referrals,
}: ReferralTableProps){


  return (

    <div className="overflow-hidden rounded-xl border border-border bg-card">


      <div className="overflow-x-auto">


        <table className="w-full text-sm">


          <thead className="border-b bg-muted/40">


            <tr>


              <th className="px-4 py-3 text-left font-medium">

                Referrer

              </th>


              <th className="px-4 py-3 text-left font-medium">

                Referred User

              </th>


              <th className="px-4 py-3 text-left font-medium">

                Progress

              </th>


              <th className="px-4 py-3 text-left font-medium">

                Reward

              </th>


              <th className="px-4 py-3 text-left font-medium">

                Date

              </th>


            </tr>


          </thead>



          <tbody>


            {
              referrals.map((referral)=>{


                return (

                  <tr

                    key={referral._id}

                    className="border-b last:border-0 hover:bg-muted/30"

                  >



                    <td className="px-4 py-4">


                      <div className="font-medium">

                        {
                          referral.referrerId?.username ??
                          'Unknown'
                        }

                      </div>


                      <div className="text-xs text-muted-foreground">

                        {
                          referral.referrerId?.email
                        }

                      </div>


                    </td>




                    <td className="px-4 py-4">


                      <div className="font-medium">

                        {
                          referral.referredUserId?.username ??
                          'Unknown'
                        }

                      </div>


                      <div className="text-xs text-muted-foreground">

                        {
                          referral.referredUserId?.email
                        }

                      </div>


                    </td>




                    <td className="px-4 py-4">


                      <div className="flex flex-wrap gap-2">


                        <ReferralStatusBadge

                          label="Registered"

                          active={
                            referral.registered
                          }

                        />


                        <ReferralStatusBadge

                          label="Regular"

                          active={
                            referral.regularSubscription
                          }

                        />


                        <ReferralStatusBadge

                          label="VIP"

                          active={
                            referral.vipSubscription
                          }

                        />


                        <ReferralStatusBadge

                          label="Prediction"

                          active={
                            referral.predictionPurchased
                          }

                        />


                      </div>


                    </td>




                    <td className="px-4 py-4">


                      <ReferralStatusBadge

                        label="Claimed"

                        active={
                          referral.rewardClaimed
                        }

                      />


                    </td>




                    <td className="px-4 py-4 text-muted-foreground">


                      {
                        new Date(
                          referral.createdAt,
                        ).toLocaleDateString()
                      }


                    </td>



                  </tr>

                );


              })
            }


          </tbody>


        </table>


      </div>


    </div>

  );

}