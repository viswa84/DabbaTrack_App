import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/layout';

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  backgroundColor?: string;
}

export const ProgressBar = ({
  value,
  max,
  color = colors.brandPrimary,
  backgroundColor = colors.card,
}: ProgressBarProps) => {
  const percentage = max === 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <View style={[styles.track, { backgroundColor }]}>
      <View style={[styles.fill, { width: `${percentage}%`, backgroundColor: color }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    height: 8,
    borderRadius: spacing.md,
    overflow: 'hidden',
    opacity: 0.8,
  },
  fill: {
    height: '100%',
    borderRadius: spacing.md,
  },
});
