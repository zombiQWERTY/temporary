export const formatBytes = (bytes: number, decimals = 2): string => {
  if (!bytes) {
    return '0 Bytes';
  }

  const k = 1024;
  const sizes = [
    'Bytes',
    'KiB',
    'MiB',
    'GiB',
    'TiB',
    'PiB',
    'EiB',
    'ZiB',
    'YiB',
  ];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const formattedBytes = (bytes / k ** i).toFixed(Math.max(0, decimals));

  return `${formattedBytes} ${sizes[i]}`;
};
