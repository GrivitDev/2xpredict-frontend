'use client';

import Link from 'next/link';

import {
  ArrowRight,
  Mail,
  Phone,
  ShieldCheck,
  Trophy,
  BarChart3,
} from 'lucide-react';

import { FaWhatsapp } from 'react-icons/fa6';

import AboutHero from '@/components/AboutHero';
import { InternalAds } from '@/components/ads/IntAds/InternalAds';
import { AboutAds } from '@/components/ads/ExtAds/positions/AboutAds';

import { AdPage } from '@/constants/ads/ad-page';
import { AdPosition } from '@/constants/ads/ad-position';

export default function AboutPage() {
  const supportEmail =
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL || '';

  const supportPhone =
    process.env.NEXT_PUBLIC_SUPPORT_PHONE || '';

  const whatsappChat =
    process.env.NEXT_PUBLIC_WHATSAPP_CHAT || '#';

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {/* Background */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          -z-10
          overflow-hidden
        "
      >
        <div
          className="
            absolute
            left-1/2
            top-[-240px]
            h-[620px]
            w-[900px]
            -translate-x-1/2
            rounded-full
            bg-gradient-to-r
            from-cyan-500/15
            via-indigo-500/10
            to-emerald-500/15
            blur-3xl
          "
        />
      </div>

      {/* Hero */}

      <AboutHero />

      {/* Hero Advertisement */}

      <InternalAds
        page={AdPage.HOME}
        position={AdPosition.HERO}
      />

      {/* WHY CHOOSE US */}

      <section
        className="
          mx-auto
          max-w-5xl
          border-t
          border-border/50
          px-5
          py-8
        "
      >
        <div className="mb-5 text-center">
          <h2 className="text-2xl font-bold">
            Why Choose 2xPredict
          </h2>

          <p className="mt-1.5 text-s text-muted-foreground">
            Designed to deliver reliable football predictions,
            match insights and a fast experience across every device.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <FeatureCard
            icon={<BarChart3 className="h-6 w-6" />}
            title="Smart Match Analysis"
            description="Comprehensive match statistics, trends and performance insights to help you understand every fixture."
          />

          <FeatureCard
            icon={<Trophy className="h-6 w-6" />}
            title="Reliable Predictions"
            description="Daily football predictions generated through structured research and analytical models."
          />

          <FeatureCard
            icon={<ShieldCheck className="h-6 w-6" />}
            title="Modern Experience"
            description="Responsive layouts, fast loading pages and a clean interface built for every football fan."
          />
        </div>
      </section>

      {/* External Advertisement */}

      <AboutAds />

      {/* Inline Advertisement */}

      <InternalAds
        page={AdPage.HOME}
        position={AdPosition.INLINE}
      />

      {/* CONTACT */}

      <section
        id="contact"
        className="
          mx-auto
          max-w-5xl
          border-t
          border-border/50
          px-5
          py-8
        "
      >
        <div className="mb-5 text-center">
          <h2 className="text-2xl font-bold">
            Contact Us
          </h2>

          <p className="mt-1.5 text-s text-muted-foreground">
            Need help or have a question? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <ContactCard
            icon={<Mail className="h-6 w-6" />}
            title="Email"
            value={supportEmail}
            href={`mailto:${supportEmail}`}
          />

          <ContactCard
            icon={<Phone className="h-6 w-6" />}
            title="Phone"
            value={supportPhone}
            href={`tel:${supportPhone}`}
          />

          <ContactCard
            icon={<FaWhatsapp className="h-6 w-6" />}
            title="WhatsApp"
            value="Start a conversation"
            href={whatsappChat}
          />
        </div>
      </section>

      {/* LEGAL */}

      <section
        className="
          mx-auto
          max-w-5xl
          border-t
          border-border/50
          px-5
          py-8
        "
      >
        <Link
          href="/privacy-policy"
          className="
            group
            flex
            items-center
            justify-between
            rounded-2xl
            border
            border-border
            bg-card
            p-4
            shadow-sm
            transition
            hover:border-cyan-500/40
            hover:shadow-md
          "
        >
          <div>
            <h3 className="text-lg font-semibold">
              Legal & Policies
            </h3>

            <p className="mt-1.5 text-s leading-6 text-muted-foreground">
              Read our Privacy Policy, Terms of Service, Disclaimer and
              other legal documents that govern the use of 2xPredict.
            </p>
          </div>

          <ArrowRight
            className="
              h-5
              w-5
              shrink-0
              transition-transform
              group-hover:translate-x-1
            "
          />
        </Link>
      </section>

      {/* Popup Advertisement */}

      <InternalAds
        page={AdPage.HOME}
        position={AdPosition.POPUP}
      />

        <InternalAds
          page={AdPage.HOME}
          position={AdPosition.BOTTOM}
        />
    </main>
  );
}

/* ============================================================================
   FEATURE CARD
============================================================================ */

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({
  icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <div
      className="
        group
        rounded-2xl
        border
        border-border
        bg-card
        p-4
        shadow-sm
        transition
        hover:border-cyan-500/40
        hover:shadow-md
      "
    >
      <div
        className="
          mb-3
          inline-flex
          rounded-xl
          bg-cyan-500/10
          p-2.5
          text-cyan-500
        "
      >
        {icon}
      </div>

      <h3 className="text-base font-semibold">
        {title}
      </h3>

      <p className="mt-1.5 text-s leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

/* ============================================================================
   CONTACT CARD
============================================================================ */

interface ContactCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  href: string;
}

function ContactCard({
  icon,
  title,
  value,
  href,
}: ContactCardProps) {
  const isExternal =
    href.startsWith('http://') ||
    href.startsWith('https://');

  return (
    <Link
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={
        isExternal
          ? 'noopener noreferrer'
          : undefined
      }
      className="
        group
        rounded-2xl
        border
        border-border
        bg-card
        p-4
        shadow-sm
        transition
        hover:border-cyan-500/40
        hover:shadow-md
      "
    >
      <div
        className="
          mb-3
          inline-flex
          rounded-xl
          bg-cyan-500/10
          p-2.5
          text-cyan-500
        "
      >
        {icon}
      </div>

      <h3 className="text-base font-semibold">
        {title}
      </h3>

      <p className="mt-1.5 break-all text-s leading-6 text-muted-foreground">
        {value}
      </p>
    </Link>
  );
}