import React from 'react';
import { StyleSheet, StyleProp, Text, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/layout';
import { Card } from './Card';

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const StatCard = ({ label, value, hint, color = colors.brandPrimary, style }: StatCardProps) => {
  const cardStyle = StyleSheet.flatten([styles.card, style, { borderColor: color }]);
  return (
    <Card style={cardStyle}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
      {hint && <Text style={styles.hint}>{hint}</Text>}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
    flex: 1,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 13,
  },
});
