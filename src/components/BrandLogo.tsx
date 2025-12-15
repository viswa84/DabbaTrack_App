import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/layout';

interface BrandLogoProps {
  size?: number;
  style?: ViewStyle;
  showText?: boolean;
}

// Lightweight logo mark built from gradients and shapes so we don't need an external image.
export const BrandLogo = ({ size = 72, style, showText = false }: BrandLogoProps) => {
  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={[colors.brandPrimary, colors.brandSecondary]}
        style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <View style={[styles.inner, { width: size * 0.6, height: size * 0.6, borderRadius: size / 3 }]}>
          <View style={styles.tiffinLid} />
          <View style={styles.tiffinBox} />
        </View>
      </LinearGradient>
      {showText && <Text style={styles.text}>DabbaTrack</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
  },
  inner: {
    backgroundColor: 'rgba(0,0,0,0.28)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tiffinLid: {
    width: '70%',
    height: 6,
    backgroundColor: '#fff',
    borderRadius: 6,
    marginBottom: 4,
  },
  tiffinBox: {
    width: '80%',
    height: '45%',
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  text: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.4,
  },
});
