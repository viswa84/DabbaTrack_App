import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppContext } from '../../context/AppContext';
import { BrandLogo } from '../../components/BrandLogo';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/layout';
import { showToast } from '../../utils/toast';

type Role = 'CUSTOMER' | 'ADMIN';

const LOGIN_MUTATION = gql`
  mutation Login($phone: String!, $otp: String!,$role: Role) {
    login(phone: $phone, otp: $otp,role: $role) {
      message
      token
      user {
        id
        name
        phone
        description
      }
    }
  }
`;

export const OTPScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { loginWithToken } = useAppContext();
  const phone: string = route?.params?.phone || '';
  const role: Role = route?.params?.role || 'CUSTOMER';

  const [digits, setDigits] = useState(['', '', '', '']);
  const inputs = useRef<Array<TextInput | null>>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [runLogin, { loading, error: loginError, data }] = useMutation(LOGIN_MUTATION);

  const otpValue = useMemo(() => digits.join(''), [digits]);
  const isComplete = otpValue.length === 4;
  const canSubmit = isComplete && !loading;

  useEffect(() => {
    console.log('OTP state', { loading, loginError: loginError?.message, data, otpValue, errorMessage });
  }, [loading, loginError, data, otpValue, errorMessage]);

  useEffect(() => {
    if (!phone) {
      navigation.goBack();
    }
  }, [navigation, phone]);

  const handleChange = (index: number, value: string) => {
    const val = value.slice(-1).replace(/\D/g, '');
    const nextDigits = [...digits];
    nextDigits[index] = val;
    setDigits(nextDigits);
    setErrorMessage(null);

    if (val && index < inputs.current.length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    setErrorMessage(null);
    console.log( { phone, otp: otpValue,role }, "055555555555555555");
    runLogin({ variables: { phone, otp: otpValue,role } })
      .then(async ({ data }) => {
        console.log('OTP success', data);
        const token = data?.login?.token;
        if (!token) {
          setErrorMessage('Login failed. Please try again.');
          return;
        }
        await loginWithToken({ token, role, user: data?.login?.user });
        showToast('success', 'Login successful', 'Welcome back to DabbaTrack');
      })
      .catch((err) => {
        console.log('OTP error', err);
        const message = err?.message || 'Unable to verify code. Please try again.';
        setErrorMessage(message);
        showToast('error', 'Verification failed', message);
      });
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
            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>We sent a 4-digit code to {phone || 'your number'}</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.8}>
              <Text style={styles.changeNumber}>Change number</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardEyebrow}>Step 2 · Verify</Text>
                <Text style={styles.cardTitle}>Enter the code below</Text>
              </View>
              <View style={styles.stepPill}>
                <Text style={styles.stepText}>Secure login</Text>
              </View>
            </View>

            <View style={styles.otpRow}>
              {digits.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(el) => {
                    inputs.current[index] = el;
                  }}
                  style={styles.otpBox}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={(val) => handleChange(index, val)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                  autoFocus={index === 0}
                  returnKeyType="next"
                  textContentType="oneTimeCode"
                />
              ))}
            </View>

            <TouchableOpacity
              style={[styles.cta, !canSubmit && styles.ctaDisabled]}
              onPress={handleSubmit}
              activeOpacity={canSubmit ? 0.9 : 1}
              disabled={!canSubmit}
            >
              <Text style={styles.ctaText}>{loading ? 'Verifying...' : 'Verify & continue'}</Text>
            </TouchableOpacity>

            <View style={styles.resendRow}>
              <Text style={styles.resendText}>Didn’t get the code?</Text>
              <TouchableOpacity onPress={() => setDigits(['', '', '', ''])} activeOpacity={0.8}>
                <Text style={styles.resendLink}>Resend</Text>
              </TouchableOpacity>
            </View>
            {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
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
  centerBlock: { alignItems: 'center', gap: spacing.xs },
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
  changeNumber: { color: colors.brandPrimary, fontWeight: '700', marginTop: spacing.xs },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardEyebrow: { color: colors.textSecondary, fontSize: 13, fontWeight: '700' },
  cardTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '800', marginTop: 2 },
  stepPill: {
    backgroundColor: 'rgba(249,115,22,0.18)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs - 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.35)',
  },
  stepText: { color: colors.brandPrimary, fontSize: 11, fontWeight: '700' },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  otpBox: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    textAlign: 'center',
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
  },
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
  ctaDisabled: { opacity: 0.4 },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  resendText: { color: colors.textSecondary, fontSize: 12 },
  resendLink: { color: colors.brandPrimary, fontSize: 12, fontWeight: '700' },
  errorText: {
    color: colors.danger,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
