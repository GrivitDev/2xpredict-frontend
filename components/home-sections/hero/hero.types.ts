export interface HeroPlayer {
  id: string;

  image: string;

  alt: string;

  width: number;

  height: number;

  className?: string;

  priority?: boolean;
}

export interface HeroButton {
  label: string;

  href: string;
}

export interface HeroSlide {
  id: string;

  title: string;

  subtitle: string;

  badge: string;

  background: string;

  overlay:
    | 'green'
    | 'blue'
    | 'purple'
    | 'gold'
    | 'mixed';

  players: HeroPlayer[];

  button: HeroButton;

  stats?: {
    value: string;

    label: string;
  }[];

  advertisement?: boolean;
}