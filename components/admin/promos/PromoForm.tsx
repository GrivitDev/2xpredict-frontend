'use client';


import {
  useEffect,
} from 'react';


import {
  useRouter,
} from 'next/navigation';


import {
  useForm,
} from 'react-hook-form';


import {
  zodResolver,
} from '@hookform/resolvers/zod';


import {
  z,
} from 'zod';


import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';


import {
  toast,
} from 'sonner';


import {
  Button,
} from '@/components/ui/button';


import {
  Input,
} from '@/components/ui/input';


import {
  Textarea,
} from '@/components/ui/textarea';


import {
  Label,
} from '@/components/ui/label';


import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';


import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';



import {
  Promo,
  CreatePromoPayload,
} from '@/types/promo';



import {
  createPromo,
  updatePromo,
} from '@/services/admin-promos.service';



import {
  PROMO_CAMPAIGN_OPTIONS,
  PROMO_REQUIREMENT_OPTIONS,
  REWARD_TYPE_OPTIONS,
  REWARD_PLAN_OPTIONS,
  CLAIM_OPTIONS,
} from '@/constants/promo';





const schema = z.object({

  name:z.string().min(3),

  description:z.string().optional(),

  campaignType:z.enum([
    'direct',
    'referral',
  ]),


  startDate:z.string(),

  endDate:z.string(),


  requirement:z.enum([
    'register',
    'regular_subscription',
    'vip_subscription',
    'any_subscription',
    'prediction_purchase',
  ]),


  targetCount:z.coerce.number(),

  maxClaims:z.coerce.number(),


  rewardType:z.enum([
    'subscription',
    'cash',
  ]),


  rewardPlan:z.enum([
    'regular',
    'vip',
  ]).optional(),


  rewardDurationDays:z.coerce.number().optional(),


  rewardAmount:z.coerce.number().optional(),

});



type FormValues = z.input<typeof schema>;

type FormOutput = z.output<typeof schema>;




interface PromoFormProps {

  promo?:Promo;

}





export default function PromoForm({
  promo,
}:PromoFormProps){


  const router = useRouter();

  const queryClient = useQueryClient();



const form = useForm<FormValues, any, FormOutput>({

  resolver:zodResolver(schema),

  defaultValues:{
    name:promo?.name ?? '',

    description:promo?.description ?? '',

    campaignType:
      promo?.campaignType ?? 'referral',

    startDate:
      promo?.startDate?.slice(0,10) ?? '',

    endDate:
      promo?.endDate?.slice(0,10) ?? '',

    requirement:
      promo?.requirement ?? 'register',

    targetCount:
      promo?.targetCount ?? 1,

    maxClaims:
      promo?.maxClaims ?? 1,

    rewardType:
      promo?.rewardType ?? 'subscription',

    rewardPlan:
      promo?.rewardPlan,

    rewardDurationDays:
      promo?.rewardDurationDays,

    rewardAmount:
      promo?.rewardAmount,
  },

});





  const rewardType =
    form.watch('rewardType');





  const mutation = useMutation({

    mutationFn:(
      values:CreatePromoPayload,
    )=>{


      if(promo){

        return updatePromo(
          promo._id,
          values,
        );

      }


      return createPromo(values);

    },


    onSuccess:()=>{


      toast.success(
        promo
          ? 'Promo updated'
          : 'Promo created',
      );


      queryClient.invalidateQueries({

        queryKey:[
          'admin-promos',
        ],

      });


      router.push(
        '/admin/promos',
      );


    },


    onError:()=>{

      toast.error(
        'Something went wrong',
      );

    },

  });





 function submit(
  values:FormOutput,
){

  mutation.mutate(values);

}






  return (

    <Card>


      <CardHeader>

        <CardTitle>

          {
            promo
              ? 'Edit Promo'
              : 'Create Promo'
          }

        </CardTitle>


      </CardHeader>



      <CardContent>


        <form
          onSubmit={
            form.handleSubmit(submit)
          }
          className="space-y-6"
        >



          <div>

            <Label>
              Promo Name
            </Label>

            <Input
              {...form.register('name')}
            />

          </div>





          <div>

            <Label>
              Description
            </Label>

            <Textarea
              {...form.register('description')}
            />

          </div>





          <div className="grid md:grid-cols-2 gap-4">


            <div>

              <Label>
                Campaign Type
              </Label>


                <Select
                value={form.watch('campaignType')}
                onValueChange={(value) =>
                    form.setValue('campaignType', value as any)
                }
                >
                <SelectTrigger>
                    <SelectValue placeholder="Select campaign type" />
                </SelectTrigger>

                <SelectContent>
                    {PROMO_CAMPAIGN_OPTIONS.map((item) => (
                    <SelectItem
                        key={item.value}
                        value={item.value}
                    >
                        {item.label}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>


            </div>





            <div>

              <Label>
                Requirement
              </Label>


             <Select
                value={form.watch('requirement')}
                onValueChange={(value) =>
                    form.setValue('requirement', value as any)
                }
                >
                <SelectTrigger>
                    <SelectValue placeholder="Select requirement" />
                </SelectTrigger>

                <SelectContent>
                    {PROMO_REQUIREMENT_OPTIONS.map((item) => (
                    <SelectItem
                        key={item.value}
                        value={item.value}
                    >
                        {item.label}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>


            </div>


          </div>





          <div className="grid md:grid-cols-2 gap-4">


            <div>

              <Label>
                Start Date
              </Label>


              <Input

                type="date"

                {...form.register(
                  'startDate'
                )}

              />


            </div>



            <div>

              <Label>
                End Date
              </Label>


              <Input

                type="date"

                {...form.register(
                  'endDate'
                )}

              />


            </div>


          </div>





          <div className="grid md:grid-cols-2 gap-4">


            <div>

              <Label>
                Required Count
              </Label>


              <Input

                type="number"

                {...form.register(
                  'targetCount'
                )}

              />


            </div>




            <div>

              <Label>
                Maximum Claims
              </Label>


             <Select
                value={String(form.watch('maxClaims'))}
                onValueChange={(value) =>
                    form.setValue('maxClaims', Number(value))
                }
                >
                <SelectTrigger>
                    <SelectValue placeholder="Select maximum claims" />
                </SelectTrigger>

                <SelectContent>
                    {CLAIM_OPTIONS.map((item) => (
                    <SelectItem
                        key={item.value}
                        value={String(item.value)}
                    >
                        {item.label}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>

            </div>


          </div>





          <div>

            <Label>
              Reward Type
            </Label>


            <Select
                value={form.watch('rewardType')}
                onValueChange={(value) =>
                    form.setValue('rewardType', value as any)
                }
                >
                <SelectTrigger>
                    <SelectValue placeholder="Select reward type" />
                </SelectTrigger>

                <SelectContent>
                    {REWARD_TYPE_OPTIONS.map((item) => (
                    <SelectItem
                        key={item.value}
                        value={item.value}
                    >
                        {item.label}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>


          </div>





          {
            rewardType === 'subscription'
            &&
            (

              <div className="grid md:grid-cols-2 gap-4">


                <Select
                value={form.watch('rewardPlan') ?? ''}
                onValueChange={(value) =>
                    form.setValue('rewardPlan', value as any)
                }
                >
                <SelectTrigger>
                    <SelectValue placeholder="Select reward plan" />
                </SelectTrigger>

                <SelectContent>
                    {REWARD_PLAN_OPTIONS.map((item) => (
                    <SelectItem
                        key={item.value}
                        value={item.value}
                    >
                        {item.label}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>



                <Input

                  type="number"

                  placeholder="Duration days"

                  {...form.register(
                    'rewardDurationDays'
                  )}

                />


              </div>

            )
          }






          {
            rewardType === 'cash'
            &&
            (

              <Input

                type="number"

                placeholder="Reward amount"

                {...form.register(
                  'rewardAmount'
                )}

              />

            )
          }





          <Button
            disabled={
              mutation.isPending
            }
          >

            {
              mutation.isPending
                ? 'Saving...'
                : promo
                  ? 'Update Promo'
                  : 'Create Promo'
            }

          </Button>



        </form>


      </CardContent>


    </Card>

  );

}