import { eventOver } from '@/data/status';

export interface NavItem {
  name: string;
  link: string;
  external?: boolean;
}

export const navItems: NavItem[] = eventOver ? [
  {
    name: 'Photos',
    link: '/photos',
  }
] : [
  {
    name: 'Venue',
    link: '/#venue',
  },
  {
    name: 'Schedule',
    link: '/#schedule',
  },
  {
    name: 'Lodging',
    link: '/#lodging',
  },
  {
    name: 'FAQ',
    link: '/#faq',
  },
  {
    name: 'RSVP',
    link: '/rsvp',
  },
  {
    name: 'Activities',
    link: '/activities',
  },
  {
    name: 'Registry',
    link: 'https://withjoy.com/alex-and-max-sep-26/registry',
    external: true,
  },
];
