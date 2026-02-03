import type { NavItemType } from '@/types/menu';
import type { Role } from '@/types/role';

export const filterMenuByRole = (
    items: NavItemType[],
    role: Role
): NavItemType[] => {
    return items
        .filter(item => !item.roles || item.roles.includes(role))
        .map(item => ({
            ...item,
            children: item.children
                ? filterMenuByRole(item.children, role)
                : undefined
        }))
        .filter(item => !item.children || item.children.length > 0);
};
