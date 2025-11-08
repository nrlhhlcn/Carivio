import React from 'react'
import { View, StyleSheet, ViewProps } from 'react-native'
import { theme } from '../../theme'

export function Card({ style, ...rest }: ViewProps) {
  return <View style={[styles.card, style]} {...rest} />
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.card,
  },
})

export default Card


