'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  AlertTriangle,
  ShieldCheck,
  UserRound,
  Activity,
  Trash2,
  Ban,
  LogOut,
  CheckCircle,
  MessageCircle,
  Mail,
  Phone,
} from 'lucide-react';

import { motion } from 'framer-motion';

import { useUserDetails } from '@/hooks/useUserDetails';
import { useUserActions } from '@/hooks/useUserActions';

import PaymentSummaryCard from '@/components/admin/users/cards/PaymentSummaryCard';
import PurchaseSummaryCard from '@/components/admin/users/cards/PurchaseSummaryCard';
import SessionSummaryCard from '@/components/admin/users/cards/SessionSummaryCard';
import SubscriptionSummaryCard from '@/components/admin/users/cards/SubscriptionSummaryCard';

import PaymentHistoryTable from '@/components/admin/users/tables/PaymentHistoryTable';
import PurchaseHistoryTable from '@/components/admin/users/tables/PurchaseHistoryTable';
import SessionHistoryTable from '@/components/admin/users/tables/SessionHistoryTable';


function AttentionIndicator({
  level,
  count,
}: {
  level: 'critical' | 'warning' | 'info' | 'none';
  count: number;
}) {

  if (level === 'none') {
    return (
      <div className="
        inline-flex
        items-center
        gap-2
        rounded-full
        border
        border-border
        bg-muted/40
        px-3
        py-1
        text-xs
        text-muted-foreground
      ">
        <span className="
          h-2
          w-2
          rounded-full
          bg-green-500
        "/>

        Healthy
      </div>
    );
  }


  const styles = {
    critical:
      'border-red-500/30 bg-red-500/10 text-red-500',

    warning:
      'border-yellow-500/30 bg-yellow-500/10 text-yellow-500',

    info:
      'border-blue-500/30 bg-blue-500/10 text-blue-500',
  };


  return (
    <div
      className={`
        inline-flex
        items-center
        gap-2
        rounded-full
        border
        px-3
        py-1
        text-xs
        ${styles[level]}
      `}
    >

      <span
        className="
          h-2
          w-2
          rounded-full
          bg-current
          animate-pulse
        "
      />

      {count} Attention

    </div>
  );
}



export default function UserDetailsPage() {

  const { id } = useParams();


  const {
    user,
    loading,
    refetch,
  } = useUserDetails(id as string);


  const actions =
    useUserActions(
      id as string,
      refetch
    );



  if (loading) {

    return (
      <div className="
        flex
        min-h-[400px]
        items-center
        justify-center
        text-muted-foreground
      ">
        Loading user profile...
      </div>
    );
  }



  if (!user) {

    return (
      <div className="
        flex
        min-h-[400px]
        flex-col
        items-center
        justify-center
        gap-4
        text-center
      ">

        <AlertTriangle
          size={42}
          className="text-red-500"
        />

        <h2 className="
          text-xl
          font-semibold
        ">
          User unavailable
        </h2>

        <p className="
          text-sm
          text-muted-foreground
        ">
          This user does not exist or cannot be accessed.
        </p>


        <Link
          href="/admin/users"
          className="
            rounded-xl
            bg-primary
            px-5
            py-2
            text-sm
            text-primary-foreground
          "
        >
          Back to Users
        </Link>

      </div>
    );
  }



  const attention =
    user.attention ?? {
      level: 'none',
      count: 0,
    };



  return (

    <main className="
      space-y-8
      p-6
      md:p-8
    ">


      {/* BACK */}
      <Link
        href="/admin/users"
        className="
          inline-flex
          items-center
          gap-2
          text-sm
          text-muted-foreground
          transition
          hover:text-foreground
        "
      >
        <ArrowLeft size={17}/>
        Back to Users
      </Link>




      {/* HEADER */}

      <motion.section
        initial={{
          opacity:0,
          y:20,
        }}
        animate={{
          opacity:1,
          y:0,
        }}
        className="
          relative
          overflow-hidden
          rounded-3xl
          border
          bg-card/60
          p-6
          shadow-xl
          backdrop-blur-xl
        "
      >

        <div className="
          absolute
          inset-0
          bg-gradient-to-br
          from-primary/10
          via-transparent
          to-transparent
          pointer-events-none
        "/>


        <div className="
          relative
          flex
          flex-col
          justify-between
          gap-6
          lg:flex-row
        ">


<div>

  <div className="
    flex
    flex-wrap
    items-center
    gap-3
  ">

    <h1 className="
      text-3xl
      font-bold
      tracking-tight
    ">
      {user.user?.fullName}
    </h1>


    <AttentionIndicator
      level={attention.level}
      count={attention.count}
    />

  </div>



  <p className="
    mt-2
    text-sm
    text-muted-foreground
  ">
    @{user.user?.username}
  </p>




  <div className="
    mt-5
    flex
    flex-wrap
    gap-3
  ">


    {/* EMAIL */}

    <div className="
      flex
      items-center
      gap-2
      rounded-xl
      border
      bg-muted/40
      px-4
      py-2
      text-sm
    ">

      <Mail
        size={15}
        className="text-primary"
      />

      {user.user?.email}

    </div>





    {/* PHONE */}

    {
      user.user?.phoneNumber && (

        <a
          href={`tel:${user.user.phoneNumber}`}
          className="
            flex
            items-center
            gap-2
            rounded-xl
            bg-green-500/10
            px-4
            py-2
            text-sm
            text-green-500
            transition
            hover:bg-green-500/20
          "
        >

          <Phone size={15}/>

          {user.user.phoneNumber}

        </a>

      )
    }







    {/* WHATSAPP */}

    {
      user.user?.phoneNumber && (

        <a
          href={`https://wa.me/${user.user.phoneNumber.replace(/\D/g,'')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="
            flex
            items-center
            gap-2
            rounded-xl
            bg-emerald-500/10
            px-4
            py-2
            text-sm
            text-emerald-500
            transition
            hover:bg-emerald-500/20
          "
        >

          <MessageCircle size={15}/>

          WhatsApp

        </a>

      )
    }


  </div>





  <div className="
    mt-5
    flex
    flex-wrap
    gap-3
  ">


    <span className="
      inline-flex
      items-center
      gap-2
      rounded-full
      border
      bg-muted/50
      px-3
      py-1
      text-xs
    ">

      <UserRound size={14}/>

      {user.user?.role}

    </span>





    <span className="
      inline-flex
      items-center
      gap-2
      rounded-full
      border
      bg-muted/50
      px-3
      py-1
      text-xs
    ">

      <ShieldCheck size={14}/>

      {user.user?.status}

    </span>





    {
      user.subscription?.plan && (

        <span className="
          inline-flex
          items-center
          gap-2
          rounded-full
          border
          border-primary/20
          bg-primary/10
          px-3
          py-1
          text-xs
          text-primary
        ">

          <ShieldCheck size={14}/>

          {user.subscription.plan}

        </span>

      )
    }


  </div>


</div>




          {/* ACTIONS */}

          <div className="
            flex
            flex-wrap
            gap-3
          ">


            <button
              onClick={() =>
                actions.suspend(
                  'Manual Suspension'
                )
              }
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-yellow-500/15
                px-4
                py-2
                text-sm
                text-yellow-500
                transition
                hover:bg-yellow-500/25
              "
            >
              <Ban size={16}/>
              Suspend
            </button>



            <button
              onClick={actions.activate}
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-green-500/15
                px-4
                py-2
                text-sm
                text-green-500
                transition
                hover:bg-green-500/25
              "
            >
              <CheckCircle size={16}/>
              Activate
            </button>




            <button
              onClick={
                actions.forceLogoutAllDevices
              }
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-blue-500/15
                px-4
                py-2
                text-sm
                text-blue-500
                transition
                hover:bg-blue-500/25
              "
            >
              <LogOut size={16}/>
              Logout
            </button>




            <button
              onClick={actions.remove}
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-red-500/15
                px-4
                py-2
                text-sm
                text-red-500
                transition
                hover:bg-red-500/25
              "
            >
              <Trash2 size={16}/>
              Delete
            </button>


          </div>


        </div>


      </motion.section>





      {/* SUMMARY */}

      <motion.section
        initial={{
          opacity:0,
          y:20
        }}
        animate={{
          opacity:1,
          y:0
        }}
        transition={{
          delay:.1
        }}
        className="
          grid
          gap-8
          md:grid-cols-2
          xl:grid-cols-2
        "
      >

        <PaymentSummaryCard
          summary={user.payments}
        />

        <SubscriptionSummaryCard
          summary={user.subscription}
        />

        <PurchaseSummaryCard
          summary={user.purchases}
        />

        <SessionSummaryCard
          summary={user.sessions}
        />

      </motion.section>





      {/* ATTENTION PANEL */}

      {
        attention.count > 0 && (

          <section className="
            rounded-3xl
            border
            border-red-500/20
            bg-red-500/5
            p-6
          ">

            <div className="
              flex
              items-center
              gap-3
            ">

              <Activity
                className="text-red-500"
              />

              <h2 className="
                font-semibold
              ">
                Attention Required
              </h2>

            </div>


            <ul className="
              mt-4
              space-y-2
              text-sm
            ">

              {
                user.attention?.reasons?.map(
                  (reason:string)=>(
                    <li
                      key={reason}
                      className="
                        flex
                        items-center
                        gap-2
                      "
                    >

                      <span className="
                        h-2
                        w-2
                        rounded-full
                        bg-red-500
                      "/>

                      {reason}

                    </li>
                  )
                )
              }

            </ul>


          </section>

        )
      }





      {/* HISTORY */}

      <section className="space-y-8">

        <PaymentHistoryTable
          payments={
            user.payments.latestPayments
          }
        />


        <PurchaseHistoryTable
          purchases={
            user.purchases.latestPurchases
          }
        />


        <SessionHistoryTable
          sessions={
            user.sessions.latestSessions
          }
        />

      </section>



    </main>
  );
}