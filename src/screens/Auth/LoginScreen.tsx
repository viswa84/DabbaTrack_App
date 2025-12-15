import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/layout';
import { useAppContext } from '../../context/AppContext';
import { BrandLogo } from '../../components/BrandLogo';

export const LoginScreen = () => {
  const { login } = useAppContext();
  const [phone, setPhone] = useState('9876543210');
  const [otp, setOtp] = useState('');
  const [loginAsAdmin, setLoginAsAdmin] = useState(false);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={styles.card}>
        <BrandLogo showText style={styles.logo} />
        <Text style={styles.heading}>Welcome to DabbaTrack</Text>
        <Text style={styles.subheading}>Effortless attendance and billing for your mess / dabba service</Text>
        <Text style={styles.label}>Phone number</Text>
        <TextInput
          style={styles.input}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          placeholder="+91 90000 00000"
          placeholderTextColor={colors.textSecondary}
        />
        <Text style={styles.label}>OTP</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          value={otp}
          onChangeText={setOtp}
          placeholder="123456"
          placeholderTextColor={colors.textSecondary}
        />
        <View style={styles.checkboxRow}>
          <TouchableOpacity
            style={[styles.checkbox, loginAsAdmin && styles.checkboxChecked]}
            onPress={() => setLoginAsAdmin((prev) => !prev)}
          >
            {loginAsAdmin && <Text style={styles.checkboxTick}>✓</Text>}
          </TouchableOpacity>
          <Text style={styles.checkboxLabel}>Login as admin</Text>
        </View>
        <TouchableOpacity style={styles.primaryButton} onPress={() => login(loginAsAdmin ? 'ADMIN' : 'CUSTOMER')}>
          <Text style={styles.primaryButtonText}>{loginAsAdmin ? 'Enter Admin Dashboard' : 'Login as Customer'}</Text>
        </TouchableOpacity>
        <Text style={styles.helper}>OTP is mocked for now. Toggle admin if you manage the kitchen.</Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: spacing.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  logo: {
    alignSelf: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subheading: {
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: spacing.md,
    padding: spacing.md,
    color: colors.textPrimary,
  },
  primaryButton: {
    backgroundColor: colors.brandPrimary,
    borderRadius: spacing.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  helper: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  checkboxTick: {
    color: '#fff',
    fontWeight: '700',
  },
  checkboxLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
