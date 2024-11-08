import {
  Link,
  Breadcrumbs as MuiBreadcrumbs,
  BreadcrumbsProps as MuiBreadcrumbsProps,
  Typography,
} from '@mui/material';

interface BreadcrumbsProps extends MuiBreadcrumbsProps {
  data: { link?: string; title: string; isActive?: boolean }[];
}

export const Breadcrumbs = ({ data }: BreadcrumbsProps) => {
  const active = data.find((d) => d.isActive);

  return (
    <MuiBreadcrumbs aria-label="breadcrumb" sx={{ mb: 6 }}>
      {data
        .filter((d) => !d.isActive)
        .map((d) => (
          <Link key={d.link} underline="hover" color="inherit" href={d.link}>
            {d.title}
          </Link>
        ))}

      <Typography color="text.primary">{active?.title}</Typography>
    </MuiBreadcrumbs>
  );
};
