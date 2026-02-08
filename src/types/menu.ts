

// project-imports

import type { Role } from './role';
import type { ReactNode } from 'react';

// ==============================|| TYPES - MENU  ||============================== //

type NavActionType = 'button' | 'link';

type NavActionProps = {
  type: NavActionType;
  label: string;
  function?: any;
  url?: string;
  target?: boolean;
  icon: any;
};

export type NavItemType = {
  breadcrumbs?: boolean;
  caption?: string;
  children?: NavItemType[];
  elements?: NavItemType[];
  chip?: ReactNode;
  color?: 'primary' | 'secondary' | 'default' | undefined;
  disabled?: boolean;
  external?: boolean;
  isDropdown?: boolean;
  icon?: any;
  id?: string;
  link?: string;
  search?: string;
  target?: boolean;
  title?: string;
  type?: string;
  url?: string | undefined;
  actions?: NavActionProps[];

  // 👇 ADD THIS
  roles?: Role[];
};

export type LinkTarget = '_blank' | '_self' | '_parent' | '_top';

export type MenuProps = {
  /**
   * Indicate if dashboard layout menu open or not
   */
  isDashboardDrawerOpened: boolean;

  /**
   * Indicate if component layout menu open or not
   */
  isComponentDrawerOpened: boolean;
};
