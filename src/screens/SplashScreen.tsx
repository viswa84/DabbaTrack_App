import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { BrandLogo } from '../components/BrandLogo';
import { colors } from '../theme/colors';
import { spacing } from '../theme/layout';

export const SplashScreen = () => {
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 800,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1600, useNativeDriver: true }),
      ]),
    ).start();
  }, [logoScale, pulse, titleOpacity]);

  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1.3],
  });

  return (
    <LinearGradient colors={[colors.brandPrimary, colors.brandDark]} style={styles.container}>
      <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseScale }] }]} />
      <View style={styles.logoContainer}>
        <Animated.View style={{ transform: [{ scale: logoScale }] }}>
          <BrandLogo size={96} showText />
        </Animated.View>
        <Animated.Text style={[styles.subtitle, { opacity: titleOpacity }]}>
          Attendance + Billing for modern Indian tiffin services
        </Animated.Text>
        <View style={styles.badges}>
          <Text style={styles.badge}>Realtime skips</Text>
          <Text style={styles.badge}>Billing insights</Text>
          <Text style={styles.badge}>Cutoff control</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  pulseRing: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 250,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  logoContainer: {
    alignItems: 'center',
    gap: spacing.md,
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  badge: {
    fontSize: 11,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    color: colors.textPrimary,
  },
});
