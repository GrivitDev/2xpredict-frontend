import PromoForm from '@/components/admin/promos/PromoForm';



export default function CreatePromoPage(){


  return (

    <div className="space-y-8">


      <div>

        <h1 className="text-3xl font-bold">

          Create Promo

        </h1>


        <p className="text-muted-foreground">

          Create a new promotional campaign for users.

        </p>


      </div>



      <PromoForm />


    </div>

  );

}