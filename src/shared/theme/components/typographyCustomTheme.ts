import React from 'react';

export const typographyCustomTheme: { [key: string]: React.CSSProperties } = {
  Heading01: {
    lineHeight: '52px',
    fontSize: '40px',
    fontWeight: 700,
  },
  Heading02: {
    lineHeight: '52px',
    fontSize: '40px',
    fontWeight: 600,
  },
  Heading03: {
    lineHeight: '52px',
    fontSize: '40px',
    fontWeight: 500,
  },
  Heading04: {
    lineHeight: '44px',
    fontSize: '32px',
    fontWeight: 700,
  },
  Heading05: {
    lineHeight: '44px',
    fontSize: '32px',
    fontWeight: 600,
  },
  Heading06: {
    lineHeight: '36px',
    fontSize: '24px',
    fontWeight: 600,
  },
  Heading07: {
    lineHeight: '32px',
    fontSize: '20px',
    fontWeight: 600,
  },

  BodyMRegular: {
    lineHeight: '24px',
    fontSize: '16px',
    fontWeight: 400,
  },
  BodyMMedium: {
    lineHeight: '24px',
    fontSize: '16px',
    fontWeight: 500,
  },
  BodyMSemiBold: {
    lineHeight: '24px',
    fontSize: '16px',
    fontWeight: 600,
  },

  BodySRegular: {
    lineHeight: '20px',
    fontSize: '14px',
    fontWeight: 400,
  },
  BodySMedium: {
    lineHeight: '20px',
    fontSize: '14px',
    fontWeight: 500,
  },
  BodySSemiBold: {
    lineHeight: '24px',
    fontSize: '14px',
    fontWeight: 700,
  },

  FootnoteRegular: {
    lineHeight: '16px',
    fontSize: '12px',
    fontWeight: 400,
  },
  FootnoteMedium: {
    lineHeight: '16px',
    fontSize: '12px',
    fontWeight: 500,
  },
  FootnoteSemiBold: {
    lineHeight: '16px',
    fontSize: '12px',
    fontWeight: 600,
  },

  CaptionRegular: {
    lineHeight: '12px',
    fontSize: '10px',
    fontWeight: 400,
  },
  CaptionMedium: {
    lineHeight: '12px',
    fontSize: '10px',
    fontWeight: 500,
  },
  CaptionSemiBold: {
    lineHeight: '12px',
    fontSize: '10px',
    fontWeight: 600,
  },
} as const;

export type CustomTypographyVariants = {
  [key in keyof typeof typographyCustomTheme]: React.CSSProperties;
};
