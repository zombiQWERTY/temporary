'use client';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { useUser } from '@/shared/auth';
import { AccountStatusEnum } from '@/shared/commonProjectParts';
import { Routes, AccountRoutes, TrustManagementRoutes } from '@/shared/router';
import { SideMenu, DashboardIcon, CardIcon, HandshakeIcon } from '@/shared/ui';

export const DashboardSideMenu = () => {
  const pathName = usePathname();

  const { data: user } = useUser();
  const t = useTranslations('Widgets.DashboardSideMenu');

  const menuItems = useMemo(
    () => [
      {
        name: t('dashboard'),
        icon: <DashboardIcon />,
        href: Routes.Dashboard,
        active: pathName?.endsWith(Routes.Dashboard),
      },
      {
        name: t('accounts'),
        icon: <CardIcon />,
        href:
          user?.accountStatus === AccountStatusEnum.Verified
            ? AccountRoutes.Base
            : Routes.PassportDetails,
        active: pathName?.includes(AccountRoutes.Base),
      },
      {
        name: t('trust_management'),
        icon: <HandshakeIcon />,
        href: TrustManagementRoutes.Base,
        active: pathName?.includes(TrustManagementRoutes.Base),
      },
      // {
      //   name: t('help_Center'),
      //   icon: <HelpIcon />,
      //   href: Routes.HelpCenter,
      //   active: pathName?.includes(Routes.HelpCenter),
      // },
      // {
      //   name: t('faq'),
      //   icon: <CircleHelpIcon />,
      //   href: Routes.Faq,
      //   active: pathName.includes(Routes.Faq),
      // },
      // {
      //   name: t('documents'),
      //   icon: <DocumentTextIcon />,
      //   href: Routes.Documents,
      //   active: pathName.includes(Routes.Documents),
      // },
    ],
    [pathName, user?.accountStatus, t],
  );

  return <SideMenu items={menuItems} />;
};
