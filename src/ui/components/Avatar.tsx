import React from 'react';
import { View, Text, ViewProps } from 'react-native';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps extends ViewProps {
  emoji?: string;
  size?: AvatarSize;
  className?: string;
  accessibilityLabel?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  emoji = '🧠',
  size = 'md',
  className = '',
  accessibilityLabel,
  ...props
}) => {
  let sizeClasses = 'w-16 h-16';
  let emojiSize = 'text-3xl';

  if (size === 'sm') {
    sizeClasses = 'w-12 h-12';
    emojiSize = 'text-2xl';
  } else if (size === 'lg') {
    sizeClasses = 'w-20 h-20';
    emojiSize = 'text-4xl';
  } else if (size === 'xl') {
    sizeClasses = 'w-28 h-28';
    emojiSize = 'text-5xl';
  }

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel || `Avatar do Cérebro: ${emoji}`}
      className={`bg-[#1D1D21] border-2 border-[#27272A] rounded-full items-center justify-center shadow-md ${sizeClasses} ${className}`}
      {...props}
    >
      <Text className={emojiSize}>{emoji}</Text>
    </View>
  );
};
