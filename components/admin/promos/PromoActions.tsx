'use client';


import {
  Copy,
  Edit,
  Power,
} from 'lucide-react';


import { useRouter } from 'next/navigation';


import {
  Button,
} from '@/components/ui/button';


import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';


import {
  Promo,
} from '@/types/promo';


import {
  deactivatePromo,
} from '@/services/admin-promos.service';


import {
  toast,
} from 'sonner';


import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';



interface PromoActionsProps {

  promo:Promo;

}



export default function PromoActions({
  promo,
}:PromoActionsProps) {


  const router = useRouter();


  const queryClient = useQueryClient();



  const deactivateMutation = useMutation({

    mutationFn:()=>deactivatePromo(
      promo._id,
    ),


    onSuccess:()=>{

      toast.success(
        'Promo deactivated successfully',
      );


      queryClient.invalidateQueries({
        queryKey:['admin-promos'],
      });

    },


    onError:()=>{

      toast.error(
        'Failed to deactivate promo',
      );

    },

  });




  function copyLink(){

    if(!promo.registrationUrl){

      toast.error(
        'No registration link available',
      );

      return;

    }


    navigator.clipboard.writeText(
      promo.registrationUrl,
    );


    toast.success(
      'Promo link copied',
    );

  }





  return (

    <div className="flex items-center gap-2">


      <Button

        size="icon"

        variant="ghost"

        onClick={()=>router.push(
          `/admin/promos/${promo._id}`,
        )}

      >

        <Edit
          className="h-4 w-4"
        />

      </Button>



      {
        promo.registrationUrl && (

          <Button

            size="icon"

            variant="ghost"

            onClick={copyLink}

          >

            <Copy
              className="h-4 w-4"
            />

          </Button>

        )
      }




      {
        promo.isActive && (

          <AlertDialog>

            <AlertDialogTrigger asChild>

              <Button

                size="icon"

                variant="ghost"

              >

                <Power
                  className="h-4 w-4 text-destructive"
                />

              </Button>


            </AlertDialogTrigger>



            <AlertDialogContent>


              <AlertDialogHeader>

                <AlertDialogTitle>

                  Deactivate Promo?

                </AlertDialogTitle>


                <AlertDialogDescription>

                  This will stop users from
                  participating in this campaign.

                </AlertDialogDescription>


              </AlertDialogHeader>



              <AlertDialogFooter>


                <AlertDialogCancel>

                  Cancel

                </AlertDialogCancel>



                <AlertDialogAction

                  onClick={()=>deactivateMutation.mutate()}

                >

                  Deactivate

                </AlertDialogAction>


              </AlertDialogFooter>


            </AlertDialogContent>


          </AlertDialog>

        )
      }



    </div>

  );

}