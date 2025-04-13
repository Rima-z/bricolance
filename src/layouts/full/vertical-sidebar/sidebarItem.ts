import {
  LayoutDashboardIcon,BorderAllIcon,
  UserIcon,
  CircleDotIcon,
  BoxMultiple1Icon,
  LoginIcon, MoodHappyIcon, ApertureIcon, UserPlusIcon
} from 'vue-tabler-icons';

export interface menu {
  header?: string;
  title?: string;
  icon?: any;
  to?: string;
  chip?: string;
  BgColor?: string;
  chipBgColor?: string;
  chipColor?: string;
  chipVariant?: string;
  chipIcon?: string;
  children?: menu[];
  disabled?: boolean;
  type?: string;
  subCaption?: string;
  requiresAuth?: boolean;
}

const sidebarItem: menu[] = [
  { header: 'accueil' },
  {
    title: "Catégories",
    icon: BoxMultiple1Icon,
    BgColor: 'primary',
    to: "/ui/cards",
  },
  {
    title: 'Services',
    icon: LayoutDashboardIcon,
    BgColor: 'primary',
    to: '/'
  },
  {
    title: "Profil",
    icon: UserIcon,
    BgColor: 'primary',
    to: "/profil",
    requiresAuth: true // Seulement visible si connecté
  },
  {
    title: "Button",
    icon: CircleDotIcon,
    BgColor: 'primary',
    to: "/ui/buttons",
  },
  
  {
    title: "Tables",
    icon: BorderAllIcon,
    BgColor: 'primary',
    to: "/ui/tables",
  },

  { header: 'Auth' },
  {
    title: 'Login',
    icon: LoginIcon,
    BgColor: 'primary',
    to: '/auth/login',
    requiresAuth: false // Seulement visible si non connecté
  },
  {
    title: 'Register',
    icon: UserPlusIcon,
    BgColor: 'primary',
    to: '/auth/register',
    requiresAuth: false // Seulement visible si non connecté
  },


];

export default sidebarItem;