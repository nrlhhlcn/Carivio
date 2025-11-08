import React from 'react'
import { TouchableOpacity, StyleSheet, ViewStyle, TextStyle, View, Text as RNText } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { theme } from '../../theme'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps {
  title: string
  onPress?: () => void
  disabled?: boolean
  variant?: ButtonVariant
  size?: ButtonSize
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
  style?: ViewStyle
  textStyle?: TextStyle
}

export function Button({
  title,
  onPress,
  disabled,
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  style,
  textStyle,
}: ButtonProps) {
  const height = size === 'lg' ? 56 : size === 'sm' ? 40 : 48
  const content = (
    <View style={[styles.content, { height }]}>
      {iconLeft ? <View style={styles.icon}>{iconLeft}</View> : null}
      <RNText
        style={[
          styles.text,
          variant === 'outline' || variant === 'ghost' ? { color: theme.colors.gray900 } : undefined,
          textStyle,
        ]}
      >
        {title}
      </RNText>
      {iconRight ? <View style={styles.icon}>{iconRight}</View> : null}
    </View>
  )

  if (variant === 'primary' || variant === 'secondary') {
    const colors = variant === 'primary' ? theme.colors.gradientPrimary : [theme.colors.gray100, theme.colors.gray200]
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={onPress} disabled={disabled} style={[style, disabled && styles.disabled]}>
        <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.base, { height }]}>
          {content}
        </LinearGradient>
      </TouchableOpacity>
    )
  }

  const baseStyles: ViewStyle[] = [styles.base, { height }]
  if (variant === 'outline') {
    baseStyles.push({
      backgroundColor: theme.colors.white,
      borderWidth: 1,
      borderColor: theme.colors.gray300,
    })
  }
  if (variant === 'ghost') {
    baseStyles.push({
      backgroundColor: 'transparent',
    })
  }

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} disabled={disabled} style={[...baseStyles, style, disabled && styles.disabled]}>
      {content}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing['2xl'],
  },
  text: {
    ...theme.typography.button,
    color: theme.colors.white,
  },
  icon: {
    marginHorizontal: theme.spacing.sm,
  },
  disabled: {
    opacity: 0.6,
  },
})

export default Button


