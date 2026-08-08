'use client';

import Link from 'next/link';

import {
  Menu,
  Home,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';


interface Props {
  onMenuClick:()=>void;
}


export default function AdminHeader({
  onMenuClick,
}:Props) {


  return (

    <header
      className="
        sticky
        top-0
        z-30
        flex
        h-20
        items-center
        justify-between
        border-b
        border-border/60
        bg-background/70
        px-4
        backdrop-blur-xl
        lg:px-8
      "
    >


      {/* LEFT SIDE */}

      <div
        className="
          flex
          items-center
          gap-3
        "
      >

        <button
          onClick={onMenuClick}
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-2xl
            border
            border-border/60
            bg-card/80
            text-muted-foreground
            shadow-lg
            transition-all
            hover:border-primary/40
            hover:bg-primary/10
            hover:text-primary
            lg:hidden
          "
        >

          <Menu size={22}/>

        </button>



        <div
          className="
            hidden
            items-center
            gap-3
            lg:flex
          "
        >

          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-2xl
              border
              border-primary/20
              bg-primary/10
              text-primary
              shadow-lg
              shadow-primary/10
            "
          >

            <ShieldCheck size={22}/>

          </div>



          <div>

            <h2
              className="
                text-sm
                font-bold
                tracking-tight
              "
            >
              Admin Control Center
            </h2>


            <div
              className="
                flex
                items-center
                gap-2
                text-xs
                text-muted-foreground
              "
            >

              <span
                className="
                  h-2
                  w-2
                  rounded-full
                  bg-emerald-500
                  shadow-lg
                  shadow-emerald-500/50
                "
              />


              System Online

            </div>


          </div>


        </div>


      </div>




      {/* RIGHT SIDE */}

      <div
        className="
          flex
          items-center
          gap-3
        "
      >


        <Link
          href="/"
          className="
            group
            flex
            items-center
            gap-2
            rounded-2xl
            border
            border-border/60
            bg-card/70
            px-4
            py-2.5
            text-sm
            font-medium
            text-muted-foreground
            shadow-lg
            transition-all
            hover:border-primary/40
            hover:bg-primary/10
            hover:text-primary
          "
        >

          <Home
            size={18}
            className="
              transition-transform
              group-hover:-translate-y-0.5
            "
          />


          <span
            className="
              hidden
              sm:inline
            "
          >
            Home
          </span>


          <ChevronRight
            size={15}
            className="
              hidden
              opacity-50
              sm:block
            "
          />

        </Link>


      </div>


      {/* Glow */}

      <div
        className="
          pointer-events-none
          absolute
          right-20
          top-0
          h-20
          w-40
          bg-primary/10
          blur-3xl
        "
      />


    </header>

  );

}