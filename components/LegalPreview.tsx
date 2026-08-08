import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  FileText,
  Cookie,
  AlertTriangle,
  RotateCcw,
  Megaphone,
  Building2,
} from 'lucide-react';


const legalItems = [
  {
    title: 'Privacy Policy',
    href: '/privacy-policy',
    icon: ShieldCheck,
  },

  {
    title: 'Terms & Conditions',
    href: '/terms-and-conditions',
    icon: FileText,
  },

  {
  title: 'Ownership Information',
  href: '/ownership',
  icon: Building2,
  },

  {
    title: 'Cookie Policy',
    href: '/cookie-policy',
    icon: Cookie,
  },

  {
    title: 'Disclaimer',
    href: '/disclaimer',
    icon: AlertTriangle,
  },

  {
    title: 'Refund Policy',
    href: '/refund-policy',
    icon: RotateCcw,
  },

  {
    title: 'Advertising Policy',
    href: '/advertising-policy',
    icon: Megaphone,
  },
];


export default function LegalPreview() {

  return (

    <section
      className="
        relative
        overflow-hidden
        py-10
      "
    >

      <div
        className="
          absolute
          inset-0
          bg-gradient-to-b
          from-transparent
          via-muted/20
          to-transparent
          text-center
        "
      />


      <div
        className="
          relative
          mx-auto
          max-w-7xl
          px-6
        "
      >


<div
  className="
    mb-4
    mx-auto
    max-w-3xl
    text-center
  "
>

  <h2
    className="
      mt-2
      text-3xl
      font-black
      md:text-3xl
    "
  >
    Privacy Policies & Terms and Conditions
  </h2>

</div>



        <div
          className="
            grid
            gap-6
            grid-cols-2
            md:grid-cols-3
            lg:grid-cols-7
          "
        >

          {legalItems.map(
            ({
              title,
              href,
              icon: Icon,
            }) => (

              <Link
                key={href}
                href={href}
                className="
                  group
                  rounded-3xl
                  border
                  border-border/60
                  bg-background/60
                  p-3
                  backdrop-blur-xl
                  transition
                  hover:-translate-y-1
                  hover:border-primary/40
                "
              >

                <div
                  className="
                    flex
                    items-center
                    justify-center
                    text-center
                    rounded-2xl
                    text-primary
                  "
                >

                  <Icon
                    className="
                      h-8
                      w-8
                    "
                  />

                </div>



                <h3
                  className="
                    mt-2
                    text-l
                    font-bold
                    text-center
                  "
                >
                  {title}
                </h3>

                <div
                  className="
                    mt-2
                    flex
                    items-center
                    text-sm
                    font-semibold
                    text-primary
                  "
                >

                  Read More

                  <ArrowRight
                    className="
                      ml-4
                      h-4
                      w-4
                      transition
                      group-hover:translate-x-1
                    "
                  />

                </div>


              </Link>

            )
          )}

        </div>


      </div>

    </section>

  );
}