import React from 'react';
import { Text, TextProps } from 'react-native';

export interface AccessibleTextProps extends TextProps {
  variant?: 'body' | 'body-lead' | 'title-lg' | 'title-md' | 'caption' | 'mono-stat';
  className?: string;
}

/**
 * Senior Accessible Typography (WCAG AAA & ADR-0005)
 * Body: >= 18sp
 * Title: >= 24sp
 * Mono: Geist Mono for stats and numbers
 */
export const AccessibleText: React.FC<AccessibleTextProps> = ({
  variant = 'body',
  children,
  className = '',
  ...props
}) => {
  let styleClasses = 'text-lg text-[#FAFAFA] font-sans leading-relaxed';

  switch (variant) {
    case 'body-lead':
      styleClasses = 'text-xl text-[#FAFAFA] font-sans font-medium leading-relaxed';
      break;
    case 'title-lg':
      styleClasses = 'text-3xl text-[#FAFAFA] font-sans font-extrabold tracking-tight';
      break;
    case 'title-md':
      styleClasses = 'text-2xl text-[#FAFAFA] font-sans font-bold tracking-tight';
      break;
    case 'caption':
      styleClasses = 'text-base text-[#A1A1AA] font-sans';
      break;
    case 'mono-stat':
      styleClasses = 'text-base text-[#FAFAFA] font-mono font-bold tracking-wider';
      break;
  }

  return (
    <Text className={`${styleClasses} ${className}`} {...props}>
      {children}
    </Text>
  );
};
