import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Link,
} from '@mui/material';
import { ReactNode } from 'react';

export interface MenuItems {
  icon: ReactNode;
  name: string;
  href: Url;
  active?: boolean;
}

export interface SideMenuProps {
  items: MenuItems[];
}

export const SideMenu = ({ items }: SideMenuProps) => (
  <List component="nav">
    {items.map((item) => (
      <Link key={item.name} href={item.href} sx={{ textDecoration: 'none' }}>
        <ListItemButton selected={item.active}>
          <ListItemIcon>{item.icon}</ListItemIcon>

          <ListItemText
            sx={{
              display: {
                xs: 'none',
                xl: 'inline-flex',
              },
              marginInlineStart: 3,
            }}
            primary={item.name}
          />
        </ListItemButton>
      </Link>
    ))}
  </List>
);
