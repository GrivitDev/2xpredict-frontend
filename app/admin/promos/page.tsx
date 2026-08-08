import Link from 'next/link';


import {
  Plus,
} from 'lucide-react';


import {
  Button,
} from '@/components/ui/button';


import {
  Card,
  CardContent,
} from '@/components/ui/card';


import PromoTable from '@/components/admin/promos/PromoTable';


import {
  getPromos,
} from '@/services/admin-promos.service';
import PromoRewards from '@/components/admin/promos/PromoRewards';
import AdminClaimedRewardsTable from '@/components/admin/promos/AdminClaimedRewardsTable';
import PendingCashRewardsTable from '@/components/admin/promos/PendingCashRewardsTable';





export default async function AdminPromosPage(){


  const promos = await getPromos();



  const total =
    promos.length;



  const active =
    promos.filter(
      promo=>promo.isActive,
    ).length;



  const referral =
    promos.filter(
      promo=>promo.campaignType === 'referral',
    ).length;



  const direct =
    promos.filter(
      promo=>promo.campaignType === 'direct',
    ).length;




  return (

    <div className="space-y-8">


      <div className="flex items-center justify-between">


        <div>

          <h1 className="text-3xl font-bold">

            Promotions

          </h1>


          <p className="text-muted-foreground">

            Create and manage promotional campaigns

          </p>


        </div>



        <Button asChild>


          <Link href="/admin/promos/create">


            <Plus className="mr-2 h-4 w-4"/>

            Create Promo


          </Link>


        </Button>



      </div>






      <div className="grid gap-4 md:grid-cols-4">


        <Card>

          <CardContent className="p-6">


            <p className="text-sm text-muted-foreground">

              Total Promos

            </p>


            <p className="mt-2 text-3xl font-bold">

              {total}

            </p>


          </CardContent>


        </Card>





        <Card>

          <CardContent className="p-6">


            <p className="text-sm text-muted-foreground">

              Active

            </p>


            <p className="mt-2 text-3xl font-bold">

              {active}

            </p>


          </CardContent>


        </Card>





        <Card>

          <CardContent className="p-6">


            <p className="text-sm text-muted-foreground">

              Referral Campaigns

            </p>


            <p className="mt-2 text-3xl font-bold">

              {referral}

            </p>


          </CardContent>


        </Card>





        <Card>

          <CardContent className="p-6">


            <p className="text-sm text-muted-foreground">

              Direct Campaigns

            </p>


            <p className="mt-2 text-3xl font-bold">

              {direct}

            </p>


          </CardContent>


        </Card>


      </div>






      <PromoTable />
      <AdminClaimedRewardsTable />
      <PendingCashRewardsTable />


    </div>

  );

}