import React from 'react';
import { View, ViewProps } from 'react-native';

export interface ProgressProps extends ViewProps {
  value: number; // 0 to 100
  accessibilityLabel: string;
  className?: string;
  height?: number;
}

/**
 * Senior Accessible Progress Bar (WCAG AAA)
 * High contrast track (#1D1D21) and fill (#FAFAFA).
 */
export const Progress: React.FC<ProgressProps> = ({
  value,
  accessibilityLabel,
  className = '',
  height = 14,
  ...props
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clampedValue }}
      accessibilityLabel={accessibilityLabel}
      className={`w-full bg-[#1D1D21] rounded-full overflow-hidden border border-[#27272A] ${className}`}
      style={{ height }}
      {...props}
    >
      <View
        className="h-full bg-[#FAFAFA] rounded-full"
        style={{ width: `${clampedValue}%` }}
      />
    </View>
  );
};
