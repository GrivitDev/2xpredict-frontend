import { HeroSlide } from './hero.types';

export const heroSlides: HeroSlide[] = [
  {
    id: 'welcome',

    badge: 'WELCOME TO HONEST PREDICT',

    title: 'Professional Football Predictions.',

    subtitle:
      'Accurate match analysis, confidence ratings and premium football insights every day.',

    background: '/hero/stadium-1.webp',

    overlay: 'green',

    players: [
      {
        id: '1',
        image: '/players/player-1.png',
        alt: 'Player',
        width: 650,
        height: 650,
        priority: true,
        className:
          'bottom-0 top-0 right-[4%] w-[32%] lg:w-[32%]',
      },

      {
        id: '2',
        image: '/players/player-2.png',
        alt: 'Player',
        width: 420,
        height: 420,
        className:
          'bottom-0 top-55 left-[52%] w-[24%] lg:w-[18%]',
      },

      {
        id: '3',
        image: '/players/player-3.png',
        alt: 'Player',
        width: 350,
        height: 350,
        className:
          'bottom-0 right-[86%] w-[20%] lg:w-[25%]',
      },
    ],

    button: {
      label: 'Explore Predictions',

      href: '/register',
    },

    stats: [
      {
        value: '1000+',
        label: 'Predictions',
      },

      {
        value: '150+',
        label: 'Matches Weekly',
      },

      {
        value: '24/7',
        label: 'Updates',
      },
    ],
  },

  {
    id: 'free',

    badge: 'FREE MEMBERSHIP',

    title: 'Join For Free.',

    subtitle:
      'Create your account and start enjoying free daily football predictions.',

    background: '/hero/stadium-2.webp',

    overlay: 'blue',

    players: [
      {
        id: '1',
        image: '/players/player-4.png',
        alt: 'Player',
        width: 620,
        height: 620,
        priority: true,
        className:
          'bottom-0 top-3 right-[22%] w-[40%] lg:w-[40%]',
      },

      {
        id: '2',
        image: '/players/player-5.png',
        alt: 'Player',
        width: 390,
        height: 390,
        className:
          'bottom-0 left-[78%] w-[18%]',
      },
    ],

    button: {
      label: 'Create Free Account',

      href: '/register',
    },
  },

  {
    id: 'regular',

    badge: 'REGULAR MEMBERSHIP',

    title: 'Unlock More Winning Opportunities.',

    subtitle:
      'Access more prediction markets, better releases and exclusive paid predictions.',

    background: '/hero/stadium-3.webp',

    overlay: 'purple',

    players: [
      {
        id: '1',
        image: '/players/player-6.png',
        alt: 'Player',
        width: 850,
        height: 850,
        priority: true,
        className:
          'bottom-0 right-[20%] w-[42%]',
      },

      {
        id: '2',
        image: '/players/player-7.png',
        alt: 'Player',
        width: 380,
        height: 380,
        className:
          'bottom-0 left-[84%] w-[16%]',
      },
    ],

    button: {
      label: 'Become Regular',

      href: '/pricing',
    },
  },

  {
    id: 'vip',

    badge: 'VIP MEMBERSHIP',

    title: 'Maximum Advantage.',

    subtitle:
      'Receive premium predictions up to three days before kickoff with Telegram delivery.',

    background: '/hero/stadium-4.webp',

    overlay: 'gold',

    players: [
      {
        id: '1',
        image: '/players/player-8.png',
        alt: 'Player',
        width: 700,
        height: 700,
        priority: true,
        className:
          'bottom-0 right-[2%] w-[30%]',
      },

      {
        id: '2',
        image: '/players/player-9.png',
        alt: 'Player',
        width: 420,
        height: 420,
        className:
          'bottom-0 left-[50%] w-[16%]',
      },
    ],

    button: {
      label: 'Go VIP',

      href: '/pricing',
    },
  },

  {
    id: 'summary',

    badge: 'HONEST PREDICT',

    title: 'One Platform. Three Plans.',

    subtitle:
      'Whether you are just starting or already betting professionally, there is a plan designed for you.',

    background: '/hero/stadium-5.webp',

    overlay: 'mixed',

    players: [
      {
        id: '1',
        image: '/players/player-10.png',
        alt: 'Player',
        width: 700,
        height: 700,
        priority: true,
        className:
          'bottom-0 right-[5%] w-[38%]',
      },
            {
        id: '2',
        image: '/players/player-9.png',
        alt: 'Player',
        width: 420,
        height: 420,
        className:
          'bottom-0 left-[52%] w-[12%]',
      },
    ],

    button: {
      label: 'Choose Your Plan',

      href: '/pricing',
    },
  },
];