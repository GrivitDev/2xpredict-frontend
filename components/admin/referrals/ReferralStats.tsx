'use client';


import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';


import {
  Users,
  UserPlus,
  Crown,
  CreditCard,
  Target,
  TrendingUp,
} from 'lucide-react';


import {
  ReferralAdminStats,
} from '@/types/referral';



interface ReferralStatsProps {

  stats: ReferralAdminStats;

}



export default function ReferralStats({
  stats,
}: ReferralStatsProps){


  const items = [

    {
      title:'Total Referrals',

      value:stats.total,

      icon:Users,
    },


    {
      title:'Active Referrers',

      value:stats.totalReferrers,

      icon:UserPlus,
    },


    {
      title:'Registered Users',

      value:stats.registered,

      icon:Users,
    },


    {
      title:'Regular Subscribers',

      value:stats.regularSubscribers,

      icon:CreditCard,
    },


    {
      title:'VIP Subscribers',

      value:stats.vipSubscribers,

      icon:Crown,
    },


    {
      title:'Prediction Purchases',

      value:stats.predictionPurchases,

      icon:Target,
    },


    {
      title:'Conversion Rate',

      value:`${stats.conversionRate}%`,

      icon:TrendingUp,
    },

  ];



  return (

    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">


      {
        items.map((item)=>{


          const Icon = item.icon;


          return (

            <Card
              key={item.title}
              className="surface-card"
            >

              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">


                <CardTitle className="text-sm font-medium">

                  {item.title}

                </CardTitle>


                <Icon className="h-5 w-5 text-muted-foreground"/>


              </CardHeader>



              <CardContent>


                <div className="text-2xl font-bold">

                  {item.value}

                </div>


              </CardContent>


            </Card>

          );


        })
      }


    </div>

  );

}