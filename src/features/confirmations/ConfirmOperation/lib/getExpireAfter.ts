import { differenceInMilliseconds } from 'date-fns';

export const getExpireAfter = (ttlInMs: number, sentAt: Date): number => {
  const expireAt = new Date(sentAt.getTime() + ttlInMs);
  const expireAfterMs = differenceInMilliseconds(expireAt, new Date());

  return Math.max(Math.floor(expireAfterMs / 1000), 0);
};
