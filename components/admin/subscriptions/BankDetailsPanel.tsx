'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  Save,
  Landmark,
} from 'lucide-react';

import toast from 'react-hot-toast';

import {
  getPlanConfig,
  updatePlanConfig,
} from '@/services/admin-plan-config.service';


export default function BankDetailsPanel({
  token,
}: {
  token: string;
}) {

  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    instructions: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);



  useEffect(() => {

    (async () => {

      try {

        const data = await getPlanConfig(token);

        setBankDetails({
          bankName: data.bankDetails?.bankName || '',
          accountName: data.bankDetails?.accountName || '',
          accountNumber: data.bankDetails?.accountNumber || '',
          instructions: data.bankDetails?.instructions || '',
        });


      } catch {

        toast.error(
          'Unable to load bank configuration'
        );


      } finally {

        setLoading(false);

      }

    })();

  }, [token]);





  const updateField = (
    key: keyof typeof bankDetails,
    value: string,
  ) => {

    setBankDetails((prev) => ({
      ...prev,
      [key]: value,
    }));

  };





  const missingFields = useMemo(() => {

    return Object.entries(bankDetails)
      .filter(([, value]) => !value.trim())
      .length;

  }, [bankDetails]);





  const save = async () => {

    try {

      setSaving(true);


      await updatePlanConfig(token, {
        bankDetails,
      });


      toast.success(
        'Bank details updated successfully'
      );


    } catch {

      toast.error(
        'Failed to update bank details'
      );


    } finally {

      setSaving(false);

    }

  };





  if (loading) {
  return (
    <div
      className="
        rounded-3xl
        border
        bg-card/60
        p-6
        backdrop-blur
      "
    >
      <div
        className="
          h-6
          w-48
          animate-pulse
          rounded-lg
          bg-muted
        "
      />

      <div
        className="
          mt-6
          h-32
          animate-pulse
          rounded-xl
          bg-muted
        "
      />
    </div>
  );
}





  return (

    <div className="
      group
      relative
      overflow-hidden
      rounded-3xl
      border
      bg-card/70
      p-6
      shadow-sm
      backdrop-blur-xl
      transition
      hover:shadow-xl
    ">


      {/* Glow */}
      <div className="
        pointer-events-none
        absolute
        -right-20
        -top-20
        h-40
        w-40
        rounded-full
        bg-primary/10
        blur-3xl
      "/>



      {/* Header */}

      <div className="
        relative
        flex
        items-start
        justify-between
        gap-4
      ">


        <div className="
          flex
          items-center
          gap-4
        ">


          <div className="
            rounded-2xl
            bg-primary/10
            p-4
          ">

            <Landmark className="
              h-6
              w-6
              text-primary
            "/>

          </div>



          <div>

            <h3 className="
              text-xl
              font-semibold
            ">
              Bank Transfer Configuration
            </h3>


            <p className="
              mt-1
              text-sm
              text-muted-foreground
            ">
              Manage payment information displayed
              to subscribers.
            </p>

          </div>


        </div>





        {/* Status */}

        {missingFields === 0 ? (

          <div className="
            flex
            items-center
            gap-2
            rounded-full
            border
            border-green-500/20
            bg-green-500/10
            px-3
            py-1.5
            text-xs
            text-green-600
          ">

            <CheckCircle2 className="h-4 w-4"/>

            Configured

          </div>


        ) : (

          <div className="
            flex
            items-center
            gap-2
            rounded-full
            border
            border-orange-500/20
            bg-orange-500/10
            px-3
            py-1.5
            text-xs
            text-orange-600
          ">

            <AlertTriangle className="h-4 w-4"/>

            Action Required

          </div>

        )}

      </div>





      {/* Warning */}

      {missingFields > 0 && (

        <div className="
          mt-6
          flex
          items-center
          gap-3
          rounded-2xl
          border
          border-orange-500/20
          bg-orange-500/10
          p-4
          text-sm
        ">

          <AlertTriangle className="
            h-5
            w-5
            text-orange-500
          "/>


          <p>

            Complete the missing bank information
            before accepting subscriber payments.

          </p>

        </div>

      )}







      {/* Form */}

      <div className="
        relative
        mt-8
        grid
        gap-5
        md:grid-cols-2
      ">


        {[
          {
            label:'Bank Name',
            key:'bankName',
            placeholder:'Example: First Bank',
          },
          {
            label:'Account Name',
            key:'accountName',
            placeholder:'Account holder name',
          },
          {
            label:'Account Number',
            key:'accountNumber',
            placeholder:'Account number',
          },

        ].map((field)=> (

          <div
            key={field.key}
            className="space-y-2"
          >

            <label className="
              text-sm
              font-medium
            ">
              {field.label}
            </label>


            <input

              value={
                bankDetails[
                  field.key as keyof typeof bankDetails
                ]
              }

              onChange={(e)=>
                updateField(
                  field.key as keyof typeof bankDetails,
                  e.target.value,
                )
              }

              placeholder={field.placeholder}

              className="
                w-full
                rounded-xl
                border
                bg-background
                px-4
                py-3
                text-sm
                outline-none
                transition
                focus:border-primary
                focus:ring-4
                focus:ring-primary/10
              "

            />

          </div>

        ))}


      </div>





      <div className="
        mt-5
        space-y-2
      ">

        <label className="
          text-sm
          font-medium
        ">
          Payment Instructions
        </label>


        <textarea

          value={bankDetails.instructions}

          onChange={(e)=>
            updateField(
              'instructions',
              e.target.value,
            )
          }

          rows={5}

          placeholder="
          Explain payment steps for users...
          "

          className="
            w-full
            resize-none
            rounded-xl
            border
            bg-background
            px-4
            py-3
            text-sm
            outline-none
            transition
            focus:border-primary
            focus:ring-4
            focus:ring-primary/10
          "

        />

      </div>





      {/* Save */}

      <button

        onClick={save}

        disabled={saving}

        className="
          mt-6
          inline-flex
          items-center
          gap-2
          rounded-xl
          bg-primary
          px-6
          py-3
          text-sm
          font-semibold
          text-primary-foreground
          transition
          hover:opacity-90
          disabled:cursor-not-allowed
          disabled:opacity-50
        "

      >

        <Save className="h-4 w-4"/>

        {saving
          ? 'Saving configuration...'
          : 'Save Bank Details'
        }

      </button>


    </div>

  );

}