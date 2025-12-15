import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../../context/AppContext';
import { BrandLogo } from '../../components/BrandLogo';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/layout';

const statusLegend = [
  { label: 'Active tiffins', color: colors.success },
  { label: 'Payments due', color: colors.warning },
  { label: 'New sign-ups', color: colors.info },
];

export const LoginScreen = () => {
  const { login } = useAppContext();
  const navigation = useNavigation<any>();
  const [phone, setPhone] = useState('');
  const [loginAsAdmin, setLoginAsAdmin] = useState(false);
  const phoneValid = /^\d{10}$/.test(phone);

  const handleContinue = () => {
    if (!phoneValid) return;
    navigation.navigate('OTP', { phone, role: loginAsAdmin ? 'ADMIN' : 'CUSTOMER' });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.root}
    >
      <LinearGradient colors={['#0B1224', '#0F172A', '#0F172A']} style={styles.gradient}>
        <View style={styles.content}>
          <View style={styles.centerBlock}>
            <BrandLogo showText />
            <Text style={styles.title}>Log in to DabbaTrack</Text>
            <Text style={styles.subtitle}>
              Track attendance, settle billing, and keep your kitchen on schedule from one dashboard.
            </Text>
            <View style={styles.legendRow}>
              {statusLegend.map((item) => (
                <View key={item.label} style={styles.legendPill}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <Text style={styles.legendLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardEyebrow}>Welcome back</Text>
                  <Text style={styles.cardTitle}>Sign in to continue</Text>
                </View>
                <View style={styles.stepPill}>
                  <Text style={styles.stepText}>Step 1 · Access</Text>
                </View>
              </View>

            <View style={styles.field}>
              <Text style={styles.label}>Phone number</Text>
              <TextInput
                style={styles.input}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                placeholder="+91 90000 00000"
                placeholderTextColor="#94A3B8"
                maxLength={10}
              />
            </View>

            <TouchableOpacity
              style={[styles.adminToggle, loginAsAdmin && styles.adminToggleActive]}
              onPress={() => setLoginAsAdmin((prev) => !prev)}
              activeOpacity={0.85}
            >
              <View style={[styles.adminSwitch, loginAsAdmin && styles.adminSwitchActive]}>
                {loginAsAdmin && <View style={styles.adminSwitchDot} />}
              </View>
              <View style={styles.adminCopy}>
                <Text style={styles.adminTitle}>Login as admin</Text>
                <Text style={styles.adminSubtitle}>Manage billing, plans, and kitchen controls</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cta, !phoneValid && styles.ctaDisabled]}
              onPress={handleContinue}
              activeOpacity={phoneValid ? 0.9 : 1}
              disabled={!phoneValid}
            >
              <Text style={styles.ctaText}>
                Continue to OTP
              </Text>
            </TouchableOpacity>

            <Pressable onPress={() => login(loginAsAdmin ? 'ADMIN' : 'CUSTOMER')}>
              <Text style={styles.skipText}>Skip auth (dev only)</Text>
            </Pressable>
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  gradient: { flex: 1 },
  content: { flex: 1, paddingHorizontal: spacing.lg, paddingVertical: spacing.xl, gap: spacing.lg },
  centerBlock: { alignItems: 'center', gap: spacing.sm },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  legendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { color: colors.textPrimary, fontSize: 12, fontWeight: '700' },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardEyebrow: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  cardTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '800', marginTop: 2 },
  stepPill: {
    backgroundColor: 'rgba(249,115,22,0.18)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs - 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.35)',
  },
  stepText: { color: colors.brandPrimary, fontSize: 11, fontWeight: '700' },
  field: { gap: spacing.xs },
  label: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  input: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  adminToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  adminToggleActive: {
    borderColor: colors.brandPrimary,
    backgroundColor: 'rgba(249,115,22,0.12)',
  },
  adminSwitch: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminSwitchActive: { borderColor: colors.brandPrimary, backgroundColor: colors.brandPrimary },
  adminSwitchDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: '#fff' },
  adminCopy: { flex: 1 },
  adminTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: '700' },
  adminSubtitle: { color: colors.textSecondary, fontSize: 12 },
  cta: {
    marginTop: spacing.xs,
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: colors.brandPrimary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
  },
  ctaDisabled: {
    opacity: 0.4,
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  skipText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: spacing.xs,
  },
});
