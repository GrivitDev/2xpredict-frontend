'use client';

import {
  useState,
} from 'react';

import {
  useRouter,
} from 'next/navigation';

import {
  AdImageUploader,
} from './AdImageUploader';

import {
  AdInstructionsBuilder,
} from './AdInstructionsBuilder';

import {
  AdActionBuilder,
} from './AdActionBuilder';

import {
  AdDisplayBuilder,
} from './AdDisplayBuilder';

import {
  zodResolver,
} from '@hookform/resolvers/zod';


import {
  useForm,
} from 'react-hook-form';


import {
  z,
} from 'zod';


import {
  Input,
} from '@/components/ui/input';

import {
  Textarea,
} from '@/components/ui/textarea';

import {
  Button,
} from '@/components/ui/button';

import {
  Label,
} from '@/components/ui/label';

import {
  Switch,
} from '@/components/ui/switch';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  useCreateAd,
  useUpdateAd,
} from '@/hooks/useAds';



import {
  AdImage,
  AdminAd,
} from '@/types/ad';

import { AdAudience } from '@/constants/ads/ad-audience';




const adSchema = z.object({

  title:z.string()
    .min(
      2,
      'Title is required',
    ),


  subTitle:z.string()
    .optional(),


  description:z.string()
    .optional(),


  priority:z.coerce
    .number()
    .min(1)
    .max(10),


});




type FormValues =
z.input<typeof adSchema>;

type FormOutput =
z.output<typeof adSchema>;




interface AdFormProps {

  mode:'create' | 'edit';

  defaultValues?:AdminAd;

}






export function AdForm({

  mode,

  defaultValues,

}:AdFormProps){



  const router =
    useRouter();




  const [image,setImage] =
    useState<AdImage | undefined>(
      defaultValues?.image,
    );




  const [actions,setActions] =
    useState(
      defaultValues?.actions ?? [],
    );




  const [displays,setDisplays] =
    useState(
      defaultValues?.displays ?? [],
    );




  const [instructions,setInstructions] =
    useState(
      defaultValues?.instructions ?? [],
    );




  const [isActive,setIsActive] =
    useState(
      defaultValues?.isActive ?? true,
    );


    const [audience,setAudience] =
  useState<AdAudience>(
    defaultValues?.audience ??
    AdAudience.ALL,
  );

const [startDate,setStartDate] =
  useState(
    defaultValues?.startDate ?? '',
  );


const [endDate,setEndDate] =
  useState(
    defaultValues?.endDate ?? '',
  );


const form =
  useForm<FormValues, any, FormOutput>({
    resolver: zodResolver(adSchema),

    defaultValues:{
      title: defaultValues?.title ?? '',
      subTitle: defaultValues?.subTitle ?? '',
      description: defaultValues?.description ?? '',
      priority: defaultValues?.priority ?? 5,
    },
  });







  const createMutation =
    useCreateAd();




  const updateMutation =
    useUpdateAd();



if(
  startDate &&
  endDate &&
  new Date(startDate) > new Date(endDate)
){

 alert(
  'End date must be after start date'
 );

 return;

}




function submit(
  values: FormOutput,
){


  if(displays.length === 0){

    alert(
      'Please add at least one display placement'
    );

    return;

  }

  if(!image){

    alert(
      'Please add an image for the advertisement'
    );

    return;

  }

const payload = {

  ...values,

  audience,

  image,

  actions,

  displays,

  instructions,

  isActive,

  startDate:
    startDate || undefined,

  endDate:
    endDate || undefined,

};




    if(mode === 'create'){

console.log(
  'CREATE AD PAYLOAD',
  payload,
);
createMutation.mutate(
 payload,
 {
   onError:(error:any)=>{

     console.log(
       'CREATE AD ERROR',
       error.response?.data
     );

   },

   onSuccess:()=>{

     router.push('/admin/ads');

   },
 }
);


      return;

    }






    if(defaultValues?._id){



      updateMutation.mutate(

        {

          id:defaultValues._id,

          data:payload,

        },


        {

          onSuccess:()=>{

            router.push(
              '/admin/ads',
            );

          },


        },

      );

    }



  }









  return (

    <form

      onSubmit={
        form.handleSubmit(submit)
      }

      className="space-y-8"

    >





      {/* BASIC DETAILS */}


      <div className="space-y-4">


        <div>

          <Label>
            Title
          </Label>


          <Input

            {...form.register('title')}

            placeholder="Advertisement title"

          />


        </div>





        <div>

          <Label>
            Subtitle
          </Label>


          <Input

            {...form.register('subTitle')}

            placeholder="Short subtitle"

          />


        </div>





        <div>

          <Label>
            Description
          </Label>


          <Textarea

            {...form.register('description')}

            placeholder="Advertisement description"

          />


        </div>


      </div>

<div>

  <Label>
    Audience
  </Label>

  <Select
    value={audience}
    onValueChange={(value) =>
      setAudience(value as AdAudience)
    }
  >

    <SelectTrigger>

      <SelectValue />

    </SelectTrigger>

    <SelectContent>

      <SelectItem value={AdAudience.ALL}>
        Everyone
      </SelectItem>

      <SelectItem value={AdAudience.GUEST}>
        Guests
      </SelectItem>

      <SelectItem value={AdAudience.FREE}>
        Free Members
      </SelectItem>

      <SelectItem value={AdAudience.REGULAR}>
        Regular Members
      </SelectItem>

      <SelectItem value={AdAudience.VIP}>
        VIP Members
      </SelectItem>

    </SelectContent>

  </Select>

</div>

{/* INSTRUCTIONS */}


<AdInstructionsBuilder

  value={instructions}

  onChange={setInstructions}

/>


{/* ACTIONS */}

<AdActionBuilder

  value={actions}

  onChange={setActions}

/>


      {/* IMAGE */}



      <AdImageUploader

        value={image}

        onChange={setImage}

      />









      {/* DISPLAY RULES */}



      <AdDisplayBuilder

        value={displays}

        onChange={setDisplays}

      />




{/* SCHEDULE */}


<div className="space-y-4">


  <div>

    <Label>
      Start Date
    </Label>


    <Input

      type="datetime-local"

      value={startDate}

      onChange={(e)=>
        setStartDate(
          e.target.value
        )
      }

    />


  </div>





  <div>

    <Label>
      End Date
    </Label>


    <Input

      type="datetime-local"

      value={endDate}

      onChange={(e)=>
        setEndDate(
          e.target.value
        )
      }

    />


  </div>


</div>




      {/* SETTINGS */}



      <div className="space-y-4">



        <div>

          <Label>
            Priority
          </Label>


          <Input

            type="number"

            {...form.register(
              'priority'
            )}

          />


        </div>






        <div
          className="
            flex
            items-center
            justify-between
          "
        >


          <div>

            <Label>
              Active
            </Label>

          </div>



          <Switch

            checked={isActive}

            onCheckedChange={setIsActive}

          />


        </div>



      </div>









      <Button

        type="submit"

        disabled={
          createMutation.isPending ||
          updateMutation.isPending
        }

      >

        {
          mode === 'create'
          ? 'Create Advertisement'
          : 'Update Advertisement'
        }


      </Button>





    </form>

  );


}