import React from 'react'
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native'
import { theme } from '../../theme'

type TextVariant = 'heading1' | 'heading2' | 'heading3' | 'body' | 'muted'

interface TextProps extends RNTextProps {
  variant?: TextVariant
  color?: string
}

export function Text({ variant = 'body', color, style, ...rest }: TextProps) {
  return (
    <RNText
      style={[
        styles[variant],
        color ? { color } : undefined,
        style,
      ]}
      {...rest}
    />
  )
}

const styles = StyleSheet.create({
  heading1: {
    ...theme.typography.heading1,
    color: theme.colors.gray900,
  },
  heading2: {
    ...theme.typography.heading2,
    color: theme.colors.gray900,
  },
  heading3: {
    ...theme.typography.heading3,
    color: theme.colors.gray900,
  },
  body: {
    ...theme.typography.body,
    color: theme.colors.gray700,
  },
  muted: {
    ...theme.typography.body,
    color: theme.colors.gray500,
  },
})

export default Text


