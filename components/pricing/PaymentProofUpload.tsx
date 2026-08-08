'use client';

import { useState } from 'react';

import { uploadService } from '@/services/uploads.service';



interface PaymentProofUploadProps {

  onUpload:
    (data:{
      url:string;
      publicId:string;
    })=>void;

}



export default function PaymentProofUpload({
  onUpload,
}:PaymentProofUploadProps){


  const [loading,setLoading] =
    useState(false);


  const [fileName,setFileName] =
    useState('');



  async function handleUpload(
    e:React.ChangeEvent<HTMLInputElement>,
  ){


    const file =
      e.target.files?.[0];


    if(!file) return;



    try {

      setLoading(true);



      const result =
        await uploadService.uploadPaymentProof(
          file,
        );



      setFileName(
        file.name,
      );



      onUpload({
        url:result.url,
        publicId:result.publicId,
      });



    } catch(error){

      console.error(
        'Payment proof upload failed',
        error,
      );


    } finally {

      setLoading(false);

    }


  }



  return (

    <label
      className="
        block
        cursor-pointer
        rounded-xl
        border
        p-4
        text-center
        transition
        hover:bg-muted
      "
    >

      {
        loading
          ?
          'Uploading...'
          :
          fileName
          ?
          fileName
          :
          'Upload Payment Screenshot'
      }


      <input

        type="file"

        accept="image/*"

        hidden

        onChange={handleUpload}

      />


    </label>

  );

}