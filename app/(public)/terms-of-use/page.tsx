"use client";

import { useEffect, useState } from "react";

const sections = [
  { id: "ownership", title: "Ownership and Scope" },
  { id: "acceptance", title: "Acceptance of These Terms" },
  { id: "eligibility", title: "Eligibility and Accounts" },
  { id: "services", title: "Our Services" },
  { id: "predictions", title: "Predictions and Information" },
  { id: "responsible-use", title: "Responsible Use and Age Requirements" },
  { id: "subscriptions", title: "Subscriptions and Paid Access" },
  { id: "payments", title: "Payments and Transactions" },
  { id: "refunds", title: "Refunds and Service Issues" },
  { id: "privacy", title: "Privacy and Cookies" },
  { id: "advertising", title: "Advertising and Third Parties" },
  { id: "acceptable-use", title: "Acceptable Use" },
  { id: "intellectual-property", title: "Intellectual Property" },
  { id: "availability", title: "Availability and Changes" },
  { id: "suspension", title: "Suspension and Closure" },
  { id: "liability", title: "Disclaimers and Liability" },
  { id: "law", title: "Complaints and Applicable Law" },
  { id: "changes", title: "Changes to These Terms" },
  { id: "contact", title: "Contact Information" },
];

const sectionClass =
  "scroll-mt-20 border-b border-border/50 py-3 last:border-b-0 sm:py-3.5";
const headingClass =
  "mb-1 text-base font-semibold leading-5 tracking-tight text-foreground";
const paragraphClass =
  "text-justify text-sm leading-[1.55] text-muted-foreground";

function TableOfContents({
  activeSection,
  onNavigate,
}: {
  activeSection: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Table of contents">
      <ul className="list-none space-y-0.5 p-0">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              onClick={onNavigate}
              aria-current={activeSection === section.id ? "location" : undefined}
              className={`block rounded-md px-2 py-1 text-[12px] leading-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                activeSection === section.id
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              {section.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function TermsOfUsePage() {
  const [activeSection, setActiveSection] = useState("ownership");
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  useEffect(() => {
    const elements = sections
      .map(({ id }) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-12% 0px -72% 0px", threshold: 0 }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
        <header className="mx-auto mb-4 max-w-3xl text-center sm:mb-5">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
            Legal
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Terms of Use
          </h1>
          <p className="mx-auto mt-1.5 max-w-2xl text-sm leading-5 text-muted-foreground">
            The terms governing your access to and use of 2xPredict, including
            its football information, prediction features, accounts, and paid
            services.
          </p>
          <p className="mt-1.5 text-[10px] text-muted-foreground">
            Last updated: 29 October 2026
          </p>
        </header>

        <div className="mb-2 md:hidden">
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card/60">
            <button
              type="button"
              aria-expanded={mobileTocOpen}
              aria-controls="mobile-terms-toc"
              onClick={() => setMobileTocOpen((open) => !open)}
              className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50"
            >
              <span>Table of contents</span>
              <span
                aria-hidden="true"
                className={`text-muted-foreground transition-transform ${
                  mobileTocOpen ? "rotate-180" : ""
                }`}
              >
                ▾
              </span>
            </button>
            {mobileTocOpen && (
              <div id="mobile-terms-toc" className="border-t border-border/50 p-1.5">
                <TableOfContents
                  activeSection={activeSection}
                  onNavigate={() => setMobileTocOpen(false)}
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-[190px_minmax(0,1fr)] md:items-start md:gap-5 xl:grid-cols-[210px_minmax(0,1fr)] xl:gap-6">
          <aside className="sticky top-4 hidden h-fit self-start md:block">
            <div className="max-h-[calc(100vh-2rem)] overflow-y-auto rounded-lg border border-border/60 bg-card/50 p-2">
              <h2 className="mb-1 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                On this page
              </h2>
              <TableOfContents activeSection={activeSection} />
            </div>
          </aside>

          <article className="min-w-0 rounded-lg border border-border/60 bg-card/40 px-3 sm:px-5">
            <section id="ownership" className={sectionClass}>
              <h2 className={headingClass}>{sections[0].title}</h2>
              <p className={paragraphClass}>
                2xPredict (the “Platform”) is owned and operated by{" "}
                <strong className="font-semibold text-foreground">
                  Grivit Digital Services
                </strong>
                . The Platform was designed and developed by{" "}
                <strong className="font-semibold text-foreground">
                  GrivitTech
                </strong>
                . In these Terms, “we”, “us” and “our” refer to Grivit Digital
                Services as owner and operator of the Platform. “You” and
                “your” refer to any person who visits, registers for, or uses
                the Platform.
              </p>
              <p className={`${paragraphClass} mt-1.5`}>
                These Terms apply to your use of the website and its available
                features, including football information, predictions,
                statistics, articles, highlights, interactive tools, user
                accounts, subscriptions and other digital services. They should
                be read together with any additional terms presented to you
                before you purchase or use a particular feature.
              </p>
            </section>

            <section id="acceptance" className={sectionClass}>
              <h2 className={headingClass}>{sections[1].title}</h2>
              <p className={paragraphClass}>
                By visiting or using the Platform, opening an account,
                purchasing a subscription, or accessing a feature, you confirm
                that you have read and understood these Terms and agree to
                comply with them. If you do not agree, do not create an account
                or continue using the relevant service. If a separate feature
                has additional terms, those terms apply alongside this
                document; where a genuine conflict exists, the specific terms
                for that feature will govern that feature to the extent of the
                conflict.
              </p>
              <p className={`${paragraphClass} mt-1.5`}>
                These Terms describe the general conditions of use. They do
                not remove rights that you may have under applicable law, and
                they do not create a partnership, employment relationship, or
                agency relationship between you and Grivit Digital Services.
              </p>
            </section>

            <section id="eligibility" className={sectionClass}>
              <h2 className={headingClass}>{sections[2].title}</h2>
              <p className={paragraphClass}>
                You may use the Platform only if you are legally permitted to
                do so in your location and meet any age or eligibility
                requirements that apply to the service you wish to access. You
                are responsible for checking the rules applicable to you,
                including any restrictions concerning betting-related
                information or activities. Access to the Platform must not be
                used to evade a legal restriction.
              </p>
              <p className={`${paragraphClass} mt-1.5`}>
                Where registration is required, you must provide information
                that is accurate and not misleading, and update it when
                necessary. You are responsible for protecting your password,
                verification methods, and other account credentials, and for
                activity carried out through your account. Do not knowingly
                allow another person to use your account in a way that
                breaches these Terms or the conditions of your plan.
              </p>
              <p className={`${paragraphClass} mt-1.5`}>
                If you suspect that your account has been accessed without
                permission, contact us promptly through the support channel
                available on the Platform. We may ask for reasonable
                information to verify account ownership or protect the account
                from further misuse.
              </p>
            </section>

            <section id="services" className={sectionClass}>
              <h2 className={headingClass}>{sections[3].title}</h2>
              <p className={paragraphClass}>
                2xPredict provides football-related content and digital
                features. Depending on the service available at the time, this
                may include fixtures, scores, team and match statistics,
                analytical information, predictions, news, highlights,
                membership features, and interactive tools such as Bet Lab.
                The Platform may offer different levels of access, and some
                material or features may be available only to eligible
                subscribers.
              </p>
              <p className={`${paragraphClass} mt-1.5`}>
                We aim to present information clearly and to improve the
                usefulness of the service over time. Features, coverage, and
                content may nevertheless vary because of technical
                constraints, the availability of data, third-party permissions,
                or operational decisions. We may correct, update, replace, or
                discontinue a feature where reasonably necessary, taking
                account of users and any obligations we have under applicable
                law.
              </p>
              <p className={`${paragraphClass} mt-1.5`}>
                Some interactive features may use points, credits, or
                illustrative balances to let users explore the feature. Unless
                the Platform expressly states otherwise in specific terms,
                such points or virtual balances are not money, do not represent
                a deposit, and cannot be withdrawn, transferred, or exchanged
                for cash. Any actual payment, account credit, or other balance
                will be governed by the conditions clearly presented for that
                particular service.
              </p>
            </section>

            <section id="predictions" className={sectionClass}>
              <h2 className={headingClass}>{sections[4].title}</h2>
              <p className={paragraphClass}>
                Predictions, probability estimates, odds, statistics, and
                match analysis are assessments prepared from information and
                methods available at the time. They are offered to help users
                understand football fixtures and are provided for information
                and entertainment. They are not a promise that a team will win,
                that a selection will succeed, or that you will make a profit.
              </p>
              <p className={`${paragraphClass} mt-1.5`}>
                Football is unpredictable. A match can turn on injuries, team
                selection, tactics, refereeing decisions, weather, player
                form, late changes, or events that cannot reasonably be
                forecast. Data feeds may also be delayed, incomplete, revised,
                or incorrect. We make reasonable efforts to present useful
                information, but we cannot guarantee that every statistic,
                market price, prediction, or match detail will always be
                complete, current, or error-free.
              </p>
              <p className={`${paragraphClass} mt-1.5`}>
                A confidence score, probability, historic record, or previous
                successful prediction should not be treated as certainty.
                Past performance is not a reliable guarantee of future
                performance, and different providers may use different data or
                methods. You should consider the limits of the information
                available and independently check time-sensitive details
                before relying on them.
              </p>
              <p className={`${paragraphClass} mt-1.5`}>
                You are responsible for decisions you make after viewing
                Platform content, including any decision to place a bet with
                an independent operator. We do not control external betting
                accounts, their prices, acceptance of a wager, settlement
                decisions, or payment of winnings. Our content is not
                financial, investment, or professional gambling advice.
              </p>
            </section>

            <section id="responsible-use" className={sectionClass}>
              <h2 className={headingClass}>{sections[5].title}</h2>
              <p className={paragraphClass}>
                You must meet the minimum legal age for the content or activity
                concerned and comply with all laws that apply where you live.
                If you choose to bet through an external operator, you must
                independently confirm that the activity is lawful and that the
                operator is authorised to provide the service in your
                jurisdiction. The Platform does not authorise anyone to
                participate in an activity that is illegal for them.
              </p>
              <p className={`${paragraphClass} mt-1.5`}>
                Predictions must never be treated as a guaranteed source of
                income. If you choose to gamble, only risk money you can afford
                to lose, set clear limits, and do not borrow money or chase
                losses. Take a break if the activity stops being enjoyable or
                begins to affect your finances, relationships, work, or
                wellbeing. Consider seeking help from an appropriate support
                service if you feel that gambling is becoming difficult to
                control.
              </p>
            </section>

            <section id="subscriptions" className={sectionClass}>
              <h2 className={headingClass}>{sections[6].title}</h2>
              <p className={paragraphClass}>
                The Platform may provide free access, paid subscriptions,
                VIP or other membership levels, and one-off purchases of
                digital content. The price, duration, access rights, and
                benefits of a plan will be shown at the point of purchase or in
                the relevant account area. Please read that information before
                paying; the name of a plan alone may not describe every
                restriction or benefit attached to it.
              </p>
              <p className={`${paragraphClass} mt-1.5`}>
                Paid access is normally activated after the payment has been
                confirmed. The access supplied is the access described for the
                selected plan and period. It does not transfer ownership of
                the Platform, its software, or the content provided through
                it. Unless recurring billing is clearly disclosed and agreed
                to, you should not assume that a plan renews automatically.
              </p>
              <p className={`${paragraphClass} mt-1.5`}>
                We may change future pricing, membership options, or the
                benefits attached to a plan. We will not deliberately describe
                a paid feature in a misleading way. Where a change would
                materially affect an existing paid period, we will handle it
                in accordance with the purchase terms and applicable law.
                Changes to a future subscription period may be reflected in
                the offer shown when that period is purchased or renewed.
              </p>
              <p className={`${paragraphClass} mt-1.5`}>
                You are responsible for keeping track of your plan, its expiry
                date, and any renewal or cancellation requirements shown in
                your account. If a feature is temporarily unavailable, please
                contact support with details so the matter can be reviewed.
              </p>
            </section>

            <section id="payments" className={sectionClass}>
              <h2 className={headingClass}>{sections[7].title}</h2>
              <p className={paragraphClass}>
                Payments must be made using the methods presented on the
                Platform. You must be authorised to use the selected payment
                method and provide the information required to complete the
                transaction. A payment may remain pending while the payment
                provider or financial institution confirms it; access should
                not be considered activated until confirmation is received or
                the Platform otherwise states that it is active.
              </p>
              <p className={`${paragraphClass} mt-1.5`}>
                Payments may be processed by independent providers and are
                subject to their operating procedures and terms. We cannot
                control delays caused by a bank, payment network, provider
                outage, or incorrect details supplied during checkout. If
                money appears to have been deducted but the service has not
                been activated, retain your transaction reference and contact
                support rather than repeatedly making the same payment.
              </p>
              <p className={`${paragraphClass} mt-1.5`}>
                For your protection, never send your password, one-time
                verification code, full card number, or banking PIN to our
                support team. We may request a transaction reference or
                reasonable evidence of payment to investigate a payment issue.
              </p>
            </section>

            <section id="refunds" className={sectionClass}>
              <h2 className={headingClass}>{sections[8].title}</h2>
              <p className={paragraphClass}>
                Because subscriptions and predictions are digital services,
                payments for access that has been successfully activated or
                content that has been delivered are generally non-refundable,
                except where applicable law provides otherwise or a refund is
                approved after review. This approach reflects the nature of
                digital access, which may be provided immediately after
                payment.
              </p>
              <p className={`${paragraphClass} mt-1.5`}>
                We may review a request where there is evidence of a genuine
                payment or delivery problem. Examples include a verified
                duplicate charge, a payment deducted without the purchased
                access being activated, or a technical failure that prevented
                delivery of the service. To help us investigate, provide your
                registered account details, transaction reference, payment
                evidence, the service purchased, and a short explanation of
                the issue. Do not include passwords or complete payment
                credentials.
              </p>
              <p className={`${paragraphClass} mt-1.5`}>
                A missed prediction, an unexpected match result, a lost bet,
                a change of mind, or dissatisfaction with an outcome does not
                by itself qualify for a refund where the purchased digital
                service was delivered. Each genuine service or payment
                complaint will be considered on its circumstances. If a refund
                is approved, the time required for the funds to appear may
                depend on the payment provider or financial institution.
                Nothing in these Terms removes a consumer right that cannot
                lawfully be excluded.
              </p>
            </section>

            <section id="privacy" className={sectionClass}>
              <h2 className={headingClass}>{sections[9].title}</h2>
              <p className={paragraphClass}>
                We may receive information that you give us when you create or
                manage an account, subscribe, make a purchase, contact support,
                or interact with the Platform. Depending on how you use the
                service, this may include your contact and account details,
                subscription and transaction records, messages sent to
                support, and limited technical or usage information needed to
                operate, secure, and improve the Platform.
              </p>
              <p className={`${paragraphClass} mt-1.5`}>
                We use information for legitimate platform purposes, such as
                managing accounts and subscriptions, confirming transactions,
                responding to enquiries, preventing misuse, maintaining
                security, meeting legal obligations, and improving the
                service. We apply reasonable safeguards, but no internet-based
                system can be guaranteed to be completely secure. You should
                keep your credentials private and tell us if you suspect your
                account has been compromised.
              </p>
              <p className={`${paragraphClass} mt-1.5`}>
                We retain information for as long as reasonably necessary for
                the purpose for which it was collected, including service
                delivery, record-keeping, security, dispute handling, and legal
                requirements. Some information may be processed by providers
                supporting hosting, communications, analytics, payments, or
                other platform operations, subject to the arrangements that
                apply to those services.
              </p>
              <p className={`${paragraphClass} mt-1.5`}>
                Cookies and similar technologies may help keep your session
                active, remember preferences, protect account functions, and
                understand how the Platform is used. You can manage cookies
                through available site controls and browser settings, although
                disabling essential cookies may prevent some features from
                working as intended. Requests about personal information may
                be submitted through the contact or support channel available
                on the Platform and will be handled in accordance with
                applicable law.
              </p>
            </section>

            <section id="advertising" className={sectionClass}>
              <h2 className={headingClass}>{sections[10].title}</h2>
              <p className={paragraphClass}>
                The Platform may display advertisements, sponsored material,
                promotional offers, or links to external websites. We may
                also use third-party services for functions such as payment
                processing, hosting, analytics, communications, and football
                data. These providers may have their own terms, privacy
                notices, and procedures, which are outside our direct control.
              </p>
              <p className={`${paragraphClass} mt-1.5`}>
                An advertisement or link does not, by itself, mean that
                Grivit Digital Services guarantees, recommends, or endorses
                the advertised product or service. Before visiting an external
                website, sharing information, or making a purchase from a
                third party, consider its terms and privacy practices.
                Transactions with external businesses are between you and
                that business, unless the Platform clearly states otherwise.
              </p>
              <p className={`${paragraphClass} mt-1.5`}>
                Commercial placements do not guarantee or determine the outcome
                of a football prediction. We may correct or remove promotional
                material where reasonably necessary, but we do not promise
                that every third-party service or external link will be
                continuously available or error-free.
              </p>
            </section>

            <section id="acceptable-use" className={sectionClass}>
              <h2 className={headingClass}>{sections[11].title}</h2>
              <p className={paragraphClass}>
                You must use the Platform lawfully, responsibly, and in a way
                that does not compromise its security or another person’s
                access. In particular, you must not:
              </p>
              <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-justify text-sm leading-[1.55] text-muted-foreground">
                <li>Use the service for fraud, harassment, unlawful activity, or another harmful purpose.</li>
                <li>Attempt to access another person’s account, private information, or any system without permission.</li>
                <li>Interfere with the Platform’s security, availability, or normal operation, or deliberately introduce malicious code.</li>
                <li>Misrepresent your identity, falsify material registration details, or manipulate a payment or subscription process.</li>
                <li>Copy, scrape, republish, resell, or commercially exploit Platform content without permission, except where the law allows it.</li>
                <li>Use the Platform in a way that infringes another person’s rights or disrupts other users.</li>
              </ul>
              <p className={`${paragraphClass} mt-1.5`}>
                We may investigate suspected misuse and take reasonable,
                proportionate steps to protect users, our systems, and our
                legal rights. Depending on the circumstances, this may include
                removing content, limiting a feature, suspending access, or
                referring a matter to the appropriate authority where legally
                required.
              </p>
            </section>

            <section id="intellectual-property" className={sectionClass}>
              <h2 className={headingClass}>{sections[12].title}</h2>
              <p className={paragraphClass}>
                Unless stated otherwise, the Platform’s original branding,
                design, layout, text, graphics, software, and other materials
                are owned by Grivit Digital Services or used under licence.
                Third-party names, logos, statistics, media, and other
                materials remain the property of their respective owners.
                Displaying material on the Platform does not transfer
                ownership to you.
              </p>
              <p className={`${paragraphClass} mt-1.5`}>
                You may access the Platform for your own lawful use in
                accordance with these Terms. Unless you have our prior written
                permission or the law otherwise allows it, you must not
                reproduce, modify, distribute, sell, publicly republish, or
                create commercial products from protected Platform material.
                You must also not remove ownership notices or present our
                content as your own.
              </p>
              <p className={`${paragraphClass} mt-1.5`}>
                If you believe that material available on the Platform
                infringes rights that you hold, please contact us with enough
                detail to identify the material and explain the concern so it
                can be reviewed.
              </p>
            </section>

            <section id="availability" className={sectionClass}>
              <h2 className={headingClass}>{sections[13].title}</h2>
              <p className={paragraphClass}>
                We aim to keep the Platform reliable and accessible, but we
                cannot promise uninterrupted service or that every feature
                will always be free from errors. Maintenance, updates,
                hosting or network failures, third-party outages, security
                incidents, and other events beyond our reasonable control may
                temporarily affect access.
              </p>
              <p className={`${paragraphClass} mt-1.5`}>
                Football schedules, scores, odds, statistics, and other
                time-sensitive information may change after they are displayed.
                We may correct or update information when new details become
                available, but you should verify important information with
                an appropriate source before acting on it. If you notice an
                apparent error, you may report it through the available
                support channel.
              </p>
              <p className={`${paragraphClass} mt-1.5`}>
                Where reasonably necessary, we may temporarily limit or
                suspend part of the Platform to address a technical problem,
                protect users, maintain security, comply with law, or carry
                out maintenance. We will seek to restore normal operation when
                practicable, but cannot guarantee a particular restoration
                time in every circumstance.
              </p>
            </section>

            <section id="suspension" className={sectionClass}>
              <h2 className={headingClass}>{sections[14].title}</h2>
              <p className={paragraphClass}>
                We may restrict, suspend, or terminate access if we reasonably
                believe that an account has materially breached these Terms,
                been used for fraud or abuse, threatened platform security, or
                created a serious legal or operational risk. We may also take
                action where required by law or by a competent authority.
              </p>
              <p className={`${paragraphClass} mt-1.5`}>
                Where it is reasonable and practicable to do so, we will
                explain the reason for a significant account restriction and
                give the user an opportunity to contact support. We may act
                immediately without advance notice where necessary to prevent
                harm, protect information, investigate suspected fraud, or
                comply with a legal requirement.
              </p>
              <p className={`${paragraphClass} mt-1.5`}>
                You may stop using the Platform at any time. If you wish to
                close an account or need help with account information, use
                the available account controls or contact support. Closing an
                account does not automatically entitle you to a refund for
                digital services already provided. Any provisions that by
                their nature should continue after use ends will remain
                applicable.
              </p>
            </section>

            <section id="liability" className={sectionClass}>
              <h2 className={headingClass}>{sections[15].title}</h2>
              <p className={paragraphClass}>
                We take reasonable care in operating the Platform, but the
                service and its content are provided on an “as available”
                basis. To the extent permitted by law, we do not warrant that
                the Platform will always be uninterrupted, that every item of
                information will be complete or error-free, or that any
                prediction, probability, odds value, or analysis will produce
                a particular outcome.
              </p>
              <p className={`${paragraphClass} mt-1.5`}>
                To the extent permitted by applicable law, Grivit Digital
                Services will not be liable for indirect or consequential loss,
                loss of profit, loss of opportunity, loss of data, service
                interruption, or loss arising from reliance on a prediction,
                third-party data, an external website, or a decision made
                through an independent betting operator. This does not mean
                that we exclude responsibility where the law does not permit
                us to do so.
              </p>
              <p className={`${paragraphClass} mt-1.5`}>
                Nothing in these Terms excludes or limits liability that
                cannot lawfully be excluded or limited, or removes any
                mandatory consumer protection right you may have. Where a
                legal limitation applies, these Terms operate only to the
                extent that the limitation is permitted.
              </p>
            </section>

            <section id="law" className={sectionClass}>
              <h2 className={headingClass}>{sections[16].title}</h2>
              <p className={paragraphClass}>
                If you have a concern about the Platform, a subscription, a
                payment, or an account decision, please contact us first with
                the relevant details. We will review the information available
                and seek to respond appropriately. You should keep transaction
                references or other relevant records where your concern
                relates to a payment or purchase.
              </p>
              <p className={`${paragraphClass} mt-1.5`}>
                These Terms are subject to the laws that properly apply to
                the Platform and to any mandatory legal protections available
                to you. Where a dispute cannot be resolved directly, it may
                be referred to a competent court or other appropriate process
                under applicable law. Nothing in this section takes away a
                legal right or forum that cannot lawfully be waived.
              </p>
            </section>

            <section id="changes" className={sectionClass}>
              <h2 className={headingClass}>{sections[17].title}</h2>
              <p className={paragraphClass}>
                We may revise these Terms when the Platform changes, new
                features are introduced, our operating practices develop, or
                legal requirements change. The latest version will be made
                available on this page with its revision date. Please review
                the Terms from time to time, particularly when you begin using
                a new service or make a purchase.
              </p>
              <p className={`${paragraphClass} mt-1.5`}>
                Revisions take effect when published unless a later date is
                stated or applicable law requires another process. Where a
                change materially affects an existing paid service, we will
                handle the change in accordance with the relevant purchase
                terms and applicable law. If you do not agree to a revised
                version, you should stop using the affected service.
              </p>
            </section>

            <section id="contact" className={sectionClass}>
              <h2 className={headingClass}>{sections[18].title}</h2>
              <p className={paragraphClass}>
                Questions or complaints about these Terms, account access,
                subscriptions, payments, privacy, or the operation of the
                Platform may be sent through the contact or support channel
                made available on the website. To help us understand the
                issue, include a concise description and any relevant account
                or transaction reference. Do not include passwords, PINs, or
                full payment credentials.
              </p>
              <div className="mt-3 rounded-lg border border-border/50 bg-background/60 px-3 py-2.5 text-sm leading-6 text-muted-foreground">
                <p>
                  <strong className="font-semibold text-foreground">
                    Platform owner and operator:
                  </strong>{" "}
                  Grivit Digital Services
                </p>
                <p>
                  <strong className="font-semibold text-foreground">
                    Design and development:
                  </strong>{" "}
                  GrivitTech
                </p>
              </div>
            </section>
          </article>
        </div>
      </div>
    </main>
  );
}
