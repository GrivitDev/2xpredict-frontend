'use client';

import {
  Activity,
  Clock,
  ShieldCheck,
  Users,
} from 'lucide-react';


type Props = {
  summary: {
    totalSessions: number;
    activeSessions: number;
    lastLogin: string | null;
    latestSessions: unknown[];
    currentSession: unknown | null;
  };
};




export default function SessionSummaryCard({
  summary,
}:Props){


  const lastLogin =
    summary.lastLogin
      ?
      new Date(
        summary.lastLogin
      ).toLocaleString()
      :
      'Never';



  return (

    <div className="
      group
      relative
      overflow-hidden
      rounded-3xl
      border
      bg-card/60
      p-6
      shadow-xl
      backdrop-blur-xl
      transition
      hover:-translate-y-1
    ">


      {/* GLOW */}

      <div className="
        absolute
        inset-0
        bg-gradient-to-br
        from-blue-500/10
        via-transparent
        to-transparent
      "/>



      <div className="
        relative
        space-y-6
      ">



        {/* HEADER */}

        <div className="
          flex
          items-center
          gap-3
        ">


          <div className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-2xl
            bg-blue-500/10
            text-blue-500
          ">

            <Activity size={22}/>

          </div>




          <div>

            <h2 className="
              font-semibold
            ">
              Sessions
            </h2>


            <p className="
              text-xs
              text-muted-foreground
            ">
              Login activity & security
            </p>


          </div>


        </div>







        {/* SESSION STATS */}

        <div className="
          grid
          grid-cols-2
          gap-4
        ">


          <Stat

            icon={
              <Users size={15}/>
            }

            label="Total"

            value={
              summary.totalSessions
            }

          />



          <Stat

            icon={
              <ShieldCheck size={15}/>
            }

            label="Active"

            value={
              summary.activeSessions
            }

          />


        </div>







        {/* LAST LOGIN */}

        <div className="
          rounded-2xl
          border
          bg-background/40
          p-4
        ">


          <div className="
            flex
            items-center
            gap-2
            text-xs
            text-muted-foreground
          ">

            <Clock size={14}/>

            Last Login

          </div>



          <p className="
            mt-2
            text-sm
            font-semibold
          ">

            {lastLogin}

          </p>


        </div>








        {/* SECURITY STATUS */}

        <div className="
          flex
          items-center
          gap-2
          rounded-xl
          bg-blue-500/10
          px-3
          py-2
          text-xs
          text-blue-500
        ">


          <ShieldCheck size={15}/>


          Account activity monitored


        </div>




      </div>


    </div>

  );

}






function Stat({
  icon,
  label,
  value,
}:{
  icon:React.ReactNode;
  label:string;
  value:number;
}){


  return (

    <div className="
      rounded-xl
      border
      bg-background/30
      p-3
    ">


      <div className="
        flex
        items-center
        gap-2
        text-xs
        text-muted-foreground
      ">

        {icon}

        {label}

      </div>



      <p className="
        mt-2
        text-xl
        font-bold
      ">
        {value}
      </p>


    </div>

  );

}