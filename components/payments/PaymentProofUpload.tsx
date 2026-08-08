'use client';

import {
  useRef,
  useState,
} from 'react';

import {
  UploadCloud,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

import toast from 'react-hot-toast';

import {
  uploadService,
} from '@/services/uploads.service';



interface PaymentProofUploadProps {

  onUploadComplete: (
    url: string,
    publicId: string,
  ) => void;


  onRemove?: () => void;

}



export default function PaymentProofUpload({

  onUploadComplete,

  onRemove,

}: PaymentProofUploadProps) {



  const inputRef =
    useRef<HTMLInputElement | null>(null);



  const [
    uploading,
    setUploading,
  ] = useState(false);



  const [
    uploaded,
    setUploaded,
  ] = useState(false);



  const [
    fileName,
    setFileName,
  ] = useState('');





  const resetUpload = () => {

    setUploaded(false);

    setFileName('');

    if(inputRef.current){

      inputRef.current.value = '';

    }


    onRemove?.();

  };








  const handleUpload = async(
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {



    const file =
      e.target.files?.[0];



    if(!file){

      return;

    }





    const allowedTypes = [

      'image/jpeg',

      'image/png',

      'image/webp',

      'application/pdf',

    ];





    if(
      !allowedTypes.includes(file.type)
    ){

      toast.error(
        'Only JPG, PNG, WEBP images or PDF files are allowed',
      );

      return;

    }





    const maxSize =
      5 * 1024 * 1024;





    if(file.size > maxSize){

      toast.error(
        'File size must be less than 5MB',
      );

      return;

    }







    try{


      setUploading(true);

      setFileName(file.name);





const result =
  await uploadService.uploadPaymentProof(file);




      onUploadComplete(

        result.url,

        result.publicId,

      );





      setUploaded(true);




      toast.success(
        'Payment proof uploaded successfully',
      );



    }catch(error){



      console.error(
        error,
      );


      toast.error(
        'Unable to upload payment proof',
      );


      setUploaded(false);


      setFileName('');



      if(inputRef.current){

        inputRef.current.value = '';

      }




    }finally{


      setUploading(false);


    }


  };








  return (

    <div

      className="
        rounded-2xl
        border
        border-dashed
        bg-card/50
        p-6
        text-center
      "

    >



      {
        uploaded ? (


          <div

            className="
              flex
              flex-col
              items-center
              gap-3
            "

          >


            <CheckCircle2

              className="
                h-10
                w-10
                text-green-500
              "

            />



            <p

              className="
                max-w-full
                truncate
                text-sm
                font-medium
              "

            >

              {fileName}

            </p>




            <p

              className="
                text-xs
                text-muted-foreground
              "

            >

              Payment proof uploaded

            </p>




            <button

              type="button"

              onClick={resetUpload}

              className="
                mt-2
                inline-flex
                items-center
                gap-2
                rounded-xl
                border
                px-4
                py-2
                text-xs
                transition
                hover:bg-muted
              "

            >

              <XCircle
                className="
                  h-4
                  w-4
                "
              />

              Replace File


            </button>



          </div>



        ) : (


          <>



            {
              uploading ? (


                <Loader2

                  className="
                    mx-auto
                    mb-3
                    h-10
                    w-10
                    animate-spin
                    text-primary
                  "

                />


              ) : (


                <UploadCloud

                  className="
                    mx-auto
                    mb-3
                    h-10
                    w-10
                    text-primary
                  "

                />


              )
            }





            <p

              className="
                mb-2
                text-sm
                font-semibold
              "

            >

              Upload Payment Proof

            </p>




            <p

              className="
                mb-4
                text-xs
                text-muted-foreground
              "

            >

              Upload screenshot or PDF receipt before submitting payment

            </p>





            <label

              className="
                inline-flex
                cursor-pointer
                items-center
                rounded-xl
                border
                px-5
                py-2
                text-sm
                transition
                hover:bg-muted
              "

            >


              Select File



              <input

                ref={inputRef}

                type="file"

                accept="
                  image/png,
                  image/jpeg,
                  image/webp,
                  application/pdf
                "

                hidden


                disabled={uploading}


                onChange={handleUpload}


              />


            </label>




          </>


        )
      }




    </div>


  );

}