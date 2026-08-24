import React from 'react';
import { View, Text, ViewProps } from 'react-native';

export type BadgeVariant = 'default' | 'secondary' | 'outline' | 'success';

export interface BadgeProps extends ViewProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  isMono?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
  isMono = true,
  ...props
}) => {
  let styleClasses = 'bg-[#FAFAFA] border-[#FAFAFA]';
  let textClasses = 'text-[#09090B]';

  if (variant === 'secondary') {
    styleClasses = 'bg-[#27272A] border-[#3F3F46]';
    textClasses = 'text-[#FAFAFA]';
  } else if (variant === 'outline') {
    styleClasses = 'bg-[#121215] border-[#27272A]';
    textClasses = 'text-[#FAFAFA]';
  } else if (variant === 'success') {
    styleClasses = 'bg-[#1D1D21] border-[#3F3F46]';
    textClasses = 'text-[#FAFAFA]';
  }

  const fontClass = isMono ? 'font-mono' : 'font-sans';

  return (
    <View
      className={`self-start px-3.5 py-1 rounded-full border ${styleClasses} ${className}`}
      {...props}
    >
      <Text className={`text-xs font-bold tracking-wider uppercase ${fontClass} ${textClasses}`}>
        {children}
      </Text>
    </View>
  );
};
