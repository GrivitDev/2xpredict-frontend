'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Crown,
  Gift,
  Sparkles,
  Target,
  Users,
  Wallet,
} from 'lucide-react';

import { toast } from 'sonner';


import {
  Badge,
} from '@/components/ui/badge';

import {
  Button,
} from '@/components/ui/button';


import {
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';


import {
  DashboardCard,
} from '@/components/dashboard/shared/DashboardCard';


import {
  EmptyState,
} from '@/components/dashboard/shared/EmptyState';


import {
  LoadingCard,
} from '@/components/dashboard/shared/LoadingCard';


import {
  SectionTitle,
} from '@/components/dashboard/shared/SectionTitle';


import {
  getReferralPromos,
  joinPromo,
} from '@/services/promos.service';



export function AvailableCampaigns() {


  const queryClient =
    useQueryClient();



  const {
    data: campaigns = [],
    isLoading,
  } = useQuery({

    queryKey:[
      'active-referral-promos',
    ],

    queryFn:
      getReferralPromos,

  });




  const joinMutation =
    useMutation({

      mutationFn:
        joinPromo,


      onSuccess(){

        toast.success(
          'Campaign joined successfully',
        );


        queryClient.invalidateQueries({

          queryKey:[
            'promo-progress',
          ],

        });


        queryClient.invalidateQueries({

          queryKey:[
            'active-referral-promos',
          ],

        });

      },


      onError(){

        toast.error(
          'Unable to join campaign',
        );

      },

    });





  if(isLoading){

    return (

      <LoadingCard
        text="Loading available campaigns..."
      />

    );

  }





  if(campaigns.length === 0){

    return (

      <EmptyState

        title="No Campaigns Available"

        description="
          There are currently no active referral campaigns.
        "

        icon={Gift}

      />

    );

  }





  return (

    <div
      className="
        space-y-6
      "
    >


      <SectionTitle

        title="Available Campaigns"

        description="
          Join campaigns and unlock exclusive rewards.
        "

      />




      <div
        className="
          grid
          gap-6
          lg:grid-cols-2
        "
      >

        {
          campaigns.map(
            (campaign:any)=>(


              <DashboardCard

                key={
                  campaign._id
                }

                className="
                  group
                  relative
                  overflow-hidden
                  border-border/60
                  bg-gradient-to-br
                  from-background
                  via-background
                  to-primary/5
                  transition-all
                  duration-500
                  hover:-translate-y-1
                  hover:shadow-2xl
                "

              >


                <div
                  className="
                    pointer-events-none
                    absolute
                    -right-20
                    -top-20
                    h-64
                    w-64
                    rounded-full
                    bg-primary/20
                    blur-3xl
                  "
                />



                <CardHeader

                  className="
                    relative
                    border-b
                    border-border/50
                    px-5
                    py-5
                    sm:px-6
                  "

                >

                  <div
                    className="
                      flex
                      flex-col
                      gap-4
                      sm:flex-row
                      sm:items-center
                      sm:justify-between
                    "
                  >


                    <CardTitle

                      className="
                        flex
                        items-center
                        gap-3
                        text-lg
                      "

                    >

                      <div
                        className="
                          flex
                          h-12
                          w-12
                          items-center
                          justify-center
                          rounded-2xl
                          bg-gradient-to-br
                          from-violet-500/20
                          to-cyan-500/20
                          text-primary
                        "
                      >

                        <Gift
                          className="
                            h-6
                            w-6
                          "
                        />

                      </div>



                      <span className="truncate">

                        {campaign.name}

                      </span>


                    </CardTitle>





                    <Badge

                      className="
                        w-fit
                        rounded-full
                        bg-emerald-500/10
                        px-4
                        text-emerald-600
                        dark:text-emerald-400
                      "

                    >

                      Active

                    </Badge>


                  </div>


                </CardHeader>






                <CardContent

                  className="
                    relative
                    space-y-6
                    p-5
                    sm:p-6
                  "

                >


                  <p
                    className="
                      text-sm
                      leading-relaxed
                      text-muted-foreground
                    "
                  >

                    {campaign.description}

                  </p>





                  <div
                    className="
                      grid
                      gap-4
                      sm:grid-cols-2
                    "
                  >


                    <CampaignInfo

                      icon={Target}

                      title="Requirement"

                      value={
                        campaign.targetCount
                      }

                      description="
                        referrals needed
                      "

                    />




                    <CampaignInfo

                      icon={
                        campaign.rewardType === 'cash'
                          ? Wallet
                          : Crown
                      }

                      title="Reward"

                      value={

                        campaign.rewardType === 'cash'

                          ?

                          new Intl.NumberFormat(
                            'en-GB',
                            {
                              style:'currency',
                              currency:'NGN',
                              maximumFractionDigits:0,
                            },
                          )
                          .format(
                            campaign.rewardAmount,
                          )

                          :

                          campaign.rewardPlan

                      }

                      description={

                        campaign.rewardType !== 'cash'

                        ?

                        `${campaign.rewardDurationDays} days`

                        :

                        undefined

                      }

                    />


                  </div>






                  <div
                    className="
                      space-y-4
                      rounded-2xl
                      border
                      border-border/50
                      bg-muted/20
                      p-4
                    "
                  >


                    <MetaRow

                      icon={Users}

                      label="Maximum Claims"

                      value={
                        campaign.maxClaims ||
                        'Unlimited'
                      }

                    />



                    <MetaRow

                      icon={CalendarDays}

                      label="Ends"

                      value={

                        new Date(
                          campaign.endDate,
                        )
                        .toLocaleDateString(
                          'en-GB',
                          {
                            day:'2-digit',
                            month:'short',
                            year:'numeric',
                          },
                        )

                      }

                    />


                  </div>






                  <Button

                    className="
                      h-12
                      w-full
                      rounded-xl
                      text-base
                      font-bold
                    "

                    disabled={
                      joinMutation.isPending ||
                      campaign.isJoined
                    }

                    onClick={() =>
                      joinMutation.mutate(
                        campaign._id,
                      )
                    }

                  >

                    {
                      campaign.isJoined

                      ?

                      <>

                        <CheckCircle2
                          className="
                            mr-2
                            h-5
                            w-5
                          "
                        />

                        Joined

                      </>


                      :

                      <>

                        Join Campaign


                        <ArrowRight
                          className="
                            ml-auto
                            h-5
                            w-5
                          "
                        />

                      </>

                    }


                  </Button>




                </CardContent>


              </DashboardCard>


            ),
          )
        }


      </div>


    </div>

  );

}







function MetaRow({

  icon:Icon,

  label,

  value,

}:{

  icon:any;

  label:string;

  value:string | number;

}){


  return (

    <div
      className="
        flex
        items-center
        justify-between
        gap-3
        text-sm
      "
    >

      <div
        className="
          flex
          items-center
          gap-2
          text-muted-foreground
        "
      >

        <Icon
          className="
            h-4
            w-4
          "
        />

        {label}

      </div>


      <span
        className="
          font-semibold
        "
      >

        {value}

      </span>


    </div>

  );

}






function CampaignInfo({

  icon:Icon,

  title,

  value,

  description,

}:{

  icon:any;

  title:string;

  value:string | number;

  description?:string;

}){


  return (

    <div

      className="
        rounded-2xl
        border
        border-border/50
        bg-muted/20
        p-4
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-lg
      "

    >


      <div
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          bg-primary/10
          text-primary
        "
      >

        <Icon
          className="
            h-5
            w-5
          "
        />

      </div>




      <p
        className="
          mt-3
          text-sm
          text-muted-foreground
        "
      >

        {title}

      </p>




      <p
        className="
          mt-1
          break-words
          text-xl
          font-black
        "
      >

        {value}

      </p>




      {
        description && (

          <p
            className="
              mt-1
              text-sm
              text-muted-foreground
            "
          >

            {description}

          </p>

        )
      }


    </div>

  );

}