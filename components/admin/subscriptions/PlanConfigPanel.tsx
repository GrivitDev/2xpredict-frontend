'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  BadgeDollarSign,
  CheckCircle2,
  AlertTriangle,
  Save,
  Settings2,
  Loader2,
} from 'lucide-react';

import toast from 'react-hot-toast';

import {
  getPlanConfig,
  updatePlanConfig,
} from '@/services/admin-plan-config.service';



export default function PlanConfigPanel({
  token,
}: {
  token: string;
}) {

  const [config, setConfig] = useState<any>(null);
  const [originalConfig, setOriginalConfig] =
    useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);



  useEffect(() => {

    (async () => {

      try {

        const data = await getPlanConfig(token);

        setConfig(data);
        setOriginalConfig(data);


      } catch {

        toast.error(
          'Unable to load subscription configuration'
        );


      } finally {

        setLoading(false);

      }

    })();

  }, [token]);





  const updateField = (
    key: string,
    value: number,
  ) => {

    setConfig((prev: any) => ({
      ...prev,
      [key]: value,
    }));

  };





  const hasChanges = useMemo(() => {

    return JSON.stringify(config) !==
      JSON.stringify(originalConfig);

  }, [
    config,
    originalConfig,
  ]);





  const incomplete = useMemo(() => {

    if (!config) return true;


    return (
      !config.regularPrice ||
      !config.vipPrice ||
      !config.subscriptionDurationDays
    );


  }, [config]);





  const save = async () => {

    if (incomplete) {

      toast.error(
        'Please complete all pricing fields'
      );

      return;

    }



    try {

      setSaving(true);


      await updatePlanConfig(
        token,
        config,
      );


      setOriginalConfig(config);


      toast.success(
        'Subscription configuration updated'
      );


    } catch {

      toast.error(
        'Failed to update configuration'
      );


    } finally {

      setSaving(false);

    }

  };






  if (loading) {

    return (

      <div className="
        rounded-3xl
        border
        bg-card/70
        p-6
        backdrop-blur-xl
      ">

        <div className="
          h-6
          w-56
          animate-pulse
          rounded-lg
          bg-muted
        "/>


        <div className="
          mt-6
          h-40
          animate-pulse
          rounded-2xl
          bg-muted
        "/>

      </div>

    );

  }







  return (

    <div className="
      relative
      overflow-hidden
      rounded-3xl
      border
      bg-card/70
      p-6
      backdrop-blur-xl
    ">



      {/* Background glow */}

      <div className="
        pointer-events-none
        absolute
        -right-20
        -top-20
        h-48
        w-48
        rounded-full
        bg-primary/10
        blur-3xl
      "/>






      {/* Header */}

      <div className="
        relative
        flex
        flex-col
        gap-4
        md:flex-row
        md:items-center
        md:justify-between
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

            <Settings2 className="
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
              Subscription Pricing Engine
            </h3>


            <p className="
              text-sm
              text-muted-foreground
            ">
              Control plans, pricing and access duration.
            </p>

          </div>


        </div>






        {hasChanges ? (

          <div className="
            flex
            items-center
            gap-2
            rounded-full
            border
            border-orange-500/20
            bg-orange-500/10
            px-4
            py-2
            text-xs
            text-orange-600
          ">

            <AlertTriangle className="h-4 w-4"/>

            Unsaved Changes

          </div>


        ) : (

          <div className="
            flex
            items-center
            gap-2
            rounded-full
            border
            border-green-500/20
            bg-green-500/10
            px-4
            py-2
            text-xs
            text-green-600
          ">


            <CheckCircle2 className="h-4 w-4"/>

            Synced

          </div>

        )}

      </div>








      {/* Pricing cards */}

      <div className="
        mt-8
        grid
        gap-5
        md:grid-cols-2
      ">



        <PriceInput
          label="Regular Subscription"
          value={config.regularPrice}
          onChange={(value)=>
            updateField(
              'regularPrice',
              value,
            )
          }
        />



        <PriceInput
          label="VIP Subscription"
          value={config.vipPrice}
          onChange={(value)=>
            updateField(
              'vipPrice',
              value,
            )
          }
        />



        <PriceInput
          label="Subscription Duration (Days)"
          value={config.subscriptionDurationDays}
          onChange={(value)=>
            updateField(
              'subscriptionDurationDays',
              value,
            )
          }
        />

      </div>







      {/* Save */}

      <button

        onClick={save}

        disabled={
          saving ||
          !hasChanges
        }


        className="
          mt-8
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

        {saving ? (

          <Loader2 className="
            h-4
            w-4
            animate-spin
          "/>

        ) : (

          <Save className="
            h-4
            w-4
          "/>

        )}


        {saving
          ? 'Saving...'
          : 'Save Configuration'
        }


      </button>



    </div>

  );

}





function PriceInput({
  label,
  value,
  onChange,
}: {
  label:string;
  value:number;
  onChange:(value:number)=>void;
}) {

  return (

    <div className="
      rounded-2xl
      border
      bg-background/50
      p-5
    ">


      <label className="
        mb-3
        flex
        items-center
        gap-2
        text-sm
        font-medium
      ">

        <BadgeDollarSign className="
          h-4
          w-4
          text-primary
        "/>


        {label}

      </label>



      <input

        type="number"

        value={value || ''}

        onChange={(e)=>
          onChange(
            Number(e.target.value)
          )
        }

        className="
          w-full
          rounded-xl
          border
          bg-card
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

  );

}