'use client';


import {
  useState,
} from 'react';


import Image from 'next/image';



import {
  Upload,
  X,
} from 'lucide-react';



import {
  Button,
} from '@/components/ui/button';



import {
  Label,
} from '@/components/ui/label';



import api from '@/lib/axios';



import {
  AdImage,
} from '@/types/ad';





interface AdImageUploaderProps {


  value?:AdImage;


  onChange:(image?:AdImage)=>void;


}







export function AdImageUploader({

  value,

  onChange,

}:AdImageUploaderProps){



  const [preview,setPreview] =
    useState(
      value?.url ?? '',
    );



  const [uploading,setUploading] =
    useState(false);









  async function uploadImage(
    event:React.ChangeEvent<HTMLInputElement>,
  ){



    const file =
      event.target.files?.[0];



    if(!file){
      return;
    }





    const formData =
      new FormData();



formData.append(
  'image',
  file,
);




    try{


      setUploading(true);



const response =
  await api.post(
    '/uploads/ads',

          formData,

          {

            headers:{

              'Content-Type':
                'multipart/form-data',

            },

          },

        );





 const image:AdImage =
  response.data.data;





      setPreview(
        image.url,
      );



      onChange(
        image,
      );



    }

    finally{


      setUploading(false);


    }



  }









  function removeImage(){


    setPreview('');

    onChange(
      undefined,
    );


  }









  return (

    <div className="space-y-4">



      <Label>
        Advertisement Image
      </Label>







      {
        preview && (

          <div
            className="
              relative
              h-52
              overflow-hidden
              rounded-xl
              border
            "
          >


            <Image

              src={preview}

              alt="Advertisement image"

              fill

              className="
                object-cover
              "

            />




            <Button

              type="button"

              size="icon"

              variant="destructive"

              className="
                absolute
                right-3
                top-3
              "

              onClick={removeImage}

            >

              <X className="size-4"/>

            </Button>



          </div>


        )

      }









      {
        !preview && (


          <label

            className="
              flex
              cursor-pointer
              flex-col
              items-center
              justify-center
              rounded-xl
              border
              border-dashed
              p-10
              text-center
            "

          >


            <Upload
              className="mb-3 size-8"
            />



            <span className="text-sm">

              {
                uploading
                ?
                'Uploading image...'
                :
                'Click to upload image'
              }


            </span>





            <input

              type="file"

              accept="image/*"

              className="hidden"

              onChange={uploadImage}

            />



          </label>


        )

      }



    </div>

  );

}