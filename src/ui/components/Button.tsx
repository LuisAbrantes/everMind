import React from 'react';
import { Pressable, Text, PressableProps, ActivityIndicator, View } from 'react-native';

export type ButtonVariant = 'default' | 'outline' | 'secondary' | 'ghost';
export type ButtonSize = 'default' | 'sm' | 'lg';

export interface ButtonProps extends PressableProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  accessibilityLabel: string;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Senior Accessible Button (WCAG AAA & ADR-0005)
 * Touch targets: default (54dp), lg (64dp), sm (48dp).
 * High Contrast Monochromatic Palette (#FAFAFA on #09090B / #121215).
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'default',
  children,
  accessibilityLabel,
  disabled = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) => {
  let sizeClasses = 'min-h-[54px] px-6 rounded-full';
  let textClasses = 'text-lg font-sans font-semibold tracking-wide';

  if (size === 'lg') {
    sizeClasses = 'min-h-[64px] px-8 rounded-full';
    textClasses = 'text-xl font-sans font-bold tracking-wide';
  } else if (size === 'sm') {
    sizeClasses = 'min-h-[48px] px-4 rounded-full';
    textClasses = 'text-base font-sans font-semibold';
  }

  let variantContainerClasses = 'bg-[#FAFAFA] border border-[#FAFAFA] active:bg-[#E4E4E7]';
  let variantTextClasses = 'text-[#09090B]';

  if (variant === 'outline') {
    variantContainerClasses = 'bg-[#121215] border-2 border-[#27272A] active:bg-[#1D1D21]';
    variantTextClasses = 'text-[#FAFAFA]';
  } else if (variant === 'secondary') {
    variantContainerClasses = 'bg-[#27272A] border border-[#3F3F46] active:bg-[#3F3F46]';
    variantTextClasses = 'text-[#FAFAFA]';
  } else if (variant === 'ghost') {
    variantContainerClasses = 'bg-transparent border-0 active:bg-[#1D1D21]';
    variantTextClasses = 'text-[#FAFAFA]';
  }

  const isInteractionDisabled = disabled || isLoading;
  const disabledClasses = isInteractionDisabled ? 'opacity-50' : '';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isInteractionDisabled, busy: isLoading }}
      disabled={isInteractionDisabled}
      className={`flex-row items-center justify-center ${sizeClasses} ${variantContainerClasses} ${disabledClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'default' ? '#09090B' : '#FAFAFA'} size="small" />
      ) : (
        <View className="flex-row items-center justify-center">
          {leftIcon ? <View className="mr-3">{leftIcon}</View> : null}
          {typeof children === 'string' ? (
            <Text className={`${textClasses} ${variantTextClasses}`}>{children}</Text>
          ) : (
            children
          )}
          {rightIcon ? <View className="ml-3">{rightIcon}</View> : null}
        </View>
      )}
    </Pressable>
  );
};
