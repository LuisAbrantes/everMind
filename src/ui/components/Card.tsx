import React from 'react';
import { View, Text, ViewProps, TextProps } from 'react-native';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <View
      className={`bg-[#121215] border border-[#27272A] rounded-3xl p-6 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </View>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <View className={`mb-3 ${className}`} {...props}>
      {children}
    </View>
  );
};

export const CardTitle: React.FC<TextProps & { className?: string }> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <Text
      className={`text-[#FAFAFA] font-sans font-bold text-2xl tracking-tight leading-snug ${className}`}
      {...props}
    >
      {children}
    </Text>
  );
};

export const CardDescription: React.FC<TextProps & { className?: string }> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <Text
      className={`text-[#A1A1AA] font-sans text-base leading-relaxed mt-1 ${className}`}
      {...props}
    >
      {children}
    </Text>
  );
};

export const CardContent: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <View className={`${className}`} {...props}>
      {children}
    </View>
  );
};

export const CardFooter: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <View className={`mt-4 pt-3 border-t border-[#27272A] flex-row items-center justify-between ${className}`} {...props}>
      {children}
    </View>
  );
};
