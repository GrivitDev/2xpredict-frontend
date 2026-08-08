'use client';

import Link from 'next/link';

import {
  ArrowRight,
  Mail,
  Phone,
} from 'lucide-react';

import {
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaXTwitter,
  FaTelegram,
  FaWhatsapp,
} from 'react-icons/fa6';

import LegalPreview from '@/components/LegalPreview';
import AboutHero from '@/components/AboutHero';
import { InternalAds } from '@/components/ads/IntAds/InternalAds';
import { AdPage } from '@/constants/ads/ad-page';
import { AdPosition } from '@/constants/ads/ad-position';
import { AboutAds } from '@/components/ads/ExtAds/positions/AboutAds';



const communities = [
  {
    icon: <FaTelegram />,
    name: 'Telegram Channel',
    text: 'Daily predictions and announcements',
    link: process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL || '#',
  },
  {
    icon: <FaWhatsapp />,
    name: 'WhatsApp Channel',
    text: 'Follow football updates and insights',
    link: process.env.NEXT_PUBLIC_WHATSAPP_CHANNEL || '#',
  },
  {
    icon: <FaWhatsapp />,
    name: 'WhatsApp Group',
    text: 'Discuss matches with other football fans',
    link: process.env.NEXT_PUBLIC_WHATSAPP_GROUP || '#',
  },
  {
    icon: <FaFacebook />,
    name: 'Facebook Page',
    text: 'News and community updates',
    link: process.env.NEXT_PUBLIC_FACEBOOK || '#',
  },
  {
    icon: <FaXTwitter />,
    name: 'X (Twitter)',
    text: 'Football opinions and updates',
    link: process.env.NEXT_PUBLIC_TWITTER || '#',
  },
  {
    icon: <FaInstagram />,
    name: 'Instagram',
    text: 'Football content and highlights',
    link: process.env.NEXT_PUBLIC_INSTAGRAM || '#',
  },
  {
    icon: <FaYoutube />,
    name: 'YouTube',
    text: 'Football analysis videos',
    link: process.env.NEXT_PUBLIC_YOUTUBE || '#',
  },
];



export default function AboutPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">

      <div className="absolute inset-0 -z-20 bg-background" />


      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">

        <div className="
          absolute left-1/2 top-[-250px]
          h-[650px] w-[950px]
          -translate-x-1/2
          rounded-full
          bg-gradient-to-r
          from-indigo-500/20
          via-cyan-500/15
          to-emerald-500/20
          blur-3xl
          animate-ambient
        "/>


        <div className="
          absolute bottom-[-200px] right-[-150px]
          h-[420px] w-[420px]
          rounded-full
          bg-purple-500/10
          blur-3xl
          animate-float-slow
        "/>

      </div>

<AboutHero />


        <InternalAds
          page={AdPage.HOME}
          position={AdPosition.HERO}
        />

        {/* COMMUNITY */}

        <section className="mt-8 px-8">

          <h2 className="text-center text-3xl font-black">
            Connect With us on our Social Media Platforms 
          </h2>


          <div
            className="
              mt-12
              grid
              grid-cols-2
              gap-4
              md:grid-cols-3
              lg:grid-cols-4
            "
          >

            {communities.map((item) => (
              <SocialCard key={item.name} {...item} />
            ))}

          </div>

        </section>


        {/* CONTACT */}

        <section className="mt-8 px-12">

          <h2 className="text-center text-4xl font-black">
            Contact Us
          </h2>

          <div className="mt-4 grid gap-6 md:grid-cols-3">

            <ContactCard
              icon={<Mail />}
              title="Email"
              value={process.env.NEXT_PUBLIC_SUPPORT_EMAIL || ''}
              href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`}
            />

            <ContactCard
              icon={<Phone />}
              title="Phone"
              value={process.env.NEXT_PUBLIC_SUPPORT_PHONE || ''}
              href={`tel:${process.env.NEXT_PUBLIC_SUPPORT_PHONE}`}
            />

            <ContactCard
              icon={<FaWhatsapp />}
              title="WhatsApp Chat"
              value="Chat with us"
              href={process.env.NEXT_PUBLIC_WHATSAPP_CHAT || '#'}
            />

          </div>

        </section>

<AboutAds />
                    <InternalAds
  page={AdPage.HOME}
  position={AdPosition.INLINE}
/>
<InternalAds
  page={AdPage.HOME}
  position={AdPosition.POPUP}
/>
<section className=" px-8">

      <LegalPreview/> 
</section>


<section className="mb-4 px-16">

        <div className="mt-8 flex justify-start">

          <Link
            href="/"
            className="
              group flex gap-3
              rounded-full border border-border
              bg-muted/40 px-8 py-4
              font-semibold backdrop-blur-xl
              transition
              hover:border-cyan-500/50
            "
          >

            Explore PredictPro

            <ArrowRight className="
         h-4 w-4 transition
              group-hover:translate-x-1
            "/>

          </Link>

        </div>


      </section>

    </main>
  );
}








function SocialCard({
  icon,
  name,
  text,
  link,
}: {
  icon: React.ReactNode;
  name: string;
  text: string;
  link: string;
}) {
  return (
    <Link
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="
        group
        rounded-2xl
        border
        border-border
        bg-muted/30
        p-4
        backdrop-blur-xl
        text-center
        transition-all
        duration-300
        hover:-translate-y-2
        hover:border-cyan-500/40
        sm:p-5
        lg:p-6
      "
    >
      <div
        className="
          mb-3
          flex
          justify-center
          text-2xl
          text-cyan-500
          transition-transform
          group-hover:scale-110
          sm:text-3xl
        "
      >
        {icon}
      </div>

      <h3
        className="
          text-sm
          font-bold
          sm:text-base
        "
      >
        {name}
      </h3>

      <p
        className="
          mt-2
          hidden
          text-sm
          text-muted-foreground
          md:block
        "
      >
        {text}
      </p>
    </Link>
  );
}







function ContactCard({
  icon,
  title,
  value,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  href: string;
}) {
  const isExternal = href.startsWith('http');

  return (
    <Link
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className="
        group
        rounded-2xl
        border
        border-border
        bg-muted/30
        p-6
        backdrop-blur-xl
        transition-all
        duration-300
        hover:-translate-y-2
        hover:border-cyan-500/40
        hover:bg-muted/50
      "
    >
      <div className="mb-4 text-cyan-500 transition-transform group-hover:scale-110">
        {icon}
      </div>

      <h3 className="text-xl font-bold">
        {title}
      </h3>

      <p className="mt-3 text-muted-foreground break-all">
        {value}
      </p>
    </Link>
  );
}