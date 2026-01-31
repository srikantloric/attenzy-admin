// project-imports
import pages from './pages';
import settings from './settings';

// types
import type { NavItemType } from '@/types/menu';

// ==============================|| MENU ITEMS ||============================== //

const menuItems: { items: NavItemType[] } = {
    items: [pages, settings]
};

export default menuItems;
