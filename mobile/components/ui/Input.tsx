import React from 'react'
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native'
import { theme } from '../../theme'

interface InputProps extends TextInputProps {
  label?: string
  errorText?: string
}

export function Input({ label, errorText, style, ...rest }: InputProps) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={theme.colors.gray400}
        style={[styles.input, style]}
        {...rest}
      />
      {errorText ? <Text style={styles.error}>{errorText}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    ...theme.typography.label,
    color: theme.colors.gray700,
    marginBottom: theme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.gray300,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.gray900,
    backgroundColor: theme.colors.gray50,
  },
  error: {
    marginTop: theme.spacing.sm,
    color: theme.colors.danger,
    fontSize: 12,
  },
})

export default Input


