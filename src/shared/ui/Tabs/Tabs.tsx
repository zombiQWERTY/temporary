import {
  Tabs as MuiTabs,
  TabsProps as MuiTabsProps,
  Tab as MuiTab,
  TabProps as MuiTabProps,
} from '@mui/material';

export interface TabProps extends MuiTabProps {}

export { MuiTab as Tab };

export interface TabsProps extends MuiTabsProps {
  fullWidth?: boolean;
  options?: TabProps[];
}

export const Tabs = ({ options, children, ...props }: TabsProps) => (
  <MuiTabs {...props}>
    {options !== undefined
      ? options.map(({ ...tab }) => <MuiTab key={tab.id} {...tab} />)
      : children}
  </MuiTabs>
);
