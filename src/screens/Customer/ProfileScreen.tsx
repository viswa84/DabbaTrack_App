import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card } from '../../components/Card';
import { ProgressBar } from '../../components/ProgressBar';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { useAppContext } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/layout';
import { formatCurrency } from '../../utils/format';

type ProfileQueryData = {
  customers: {
    id: string;
    name: string;
    phone: string;
    planName: string;
    planPrice: number;
    mealsPerDay: number;
    vegType: string;
    address: string;
    boxesThisMonth: number;
    status: string;
  }[];
  todaySummary: {
    cutoffTime: string;
  };
  monthlyRecap: {
    monthLabel: string;
    totalBoxes: number;
    amountPaid: number;
  };
};

const PROFILE_QUERY = gql`
  query CustomerProfile {
    customers {
      id
      name
      phone
      planName
      planPrice
      mealsPerDay
      vegType
      address
      boxesThisMonth
      status
    }
    todaySummary {
      cutoffTime
    }
    monthlyRecap {
      monthLabel
      totalBoxes
      amountPaid
    }
  }
`;

export const ProfileScreen = () => {
  const { logout, switchRole, role } = useAppContext();
  const { data } = useQuery<ProfileQueryData>(PROFILE_QUERY);
  const customer = data?.customers?.[0];
  const recap = data?.monthlyRecap;

  return (
    <Screen scrollable={false}>
      <View style={styles.container}>
        {customer && (
          <Card style={styles.hero}>
            <Text style={styles.name}>{customer.name}</Text>
            <Text style={styles.phone}>+91 {customer.phone}</Text>
            <View style={styles.planRow}>
              <View>
                <Text style={styles.planName}>{customer.planName}</Text>
                <Text style={styles.planDetail}>{customer.vegType} · {customer.mealsPerDay} meals/day</Text>
              </View>
              <Text style={styles.planPrice}>₹ {customer.planPrice}/mo</Text>
            </View>
          </Card>
        )}
        <Card>
          <SectionHeader title="Preferences" />
          <Text style={styles.itemLabel}>Cutoff time</Text>
          <Text style={styles.itemValue}>{data?.todaySummary?.cutoffTime} AM</Text>
          <Text style={styles.itemLabel}>Address</Text>
          <Text style={styles.itemValue}>{customer?.address}</Text>
        </Card>
        <Card>
          <SectionHeader title="Role switcher" />
          <TouchableOpacity style={styles.roleButton} onPress={() => switchRole(role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN')}>
            <Text style={styles.roleButtonText}>
              Switch to {role === 'ADMIN' ? 'Customer view' : 'Admin dashboard'}
            </Text>
          </TouchableOpacity>
        </Card>
        <Card>
          <SectionHeader title="Support" />
          <Text style={styles.supportText}>Need help? WhatsApp +91 93200 12345 or email hello@dabbatrack.in</Text>
        </Card>
        {recap && (
          <Card>
            <SectionHeader title={`${recap.monthLabel} usage`} />
            <View style={styles.usageRow}>
              <View>
                <Text style={styles.itemLabel}>Boxes this month</Text>
                <Text style={styles.usageValue}>{recap.totalBoxes}</Text>
              </View>
              <View>
                <Text style={styles.itemLabel}>Payments</Text>
                <Text style={styles.usageValue}>{formatCurrency(recap.amountPaid)}</Text>
              </View>
            </View>
            <ProgressBar value={customer?.boxesThisMonth ?? 0} max={60} />
            <Text style={styles.itemValue}>
              {customer?.boxesThisMonth ?? 0} / 60 deliveries (goal resets monthly)
            </Text>
          </Card>
        )}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  hero: {
    gap: spacing.sm,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  phone: {
    color: colors.textSecondary,
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  planName: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  planDetail: {
    color: colors.textSecondary,
  },
  planPrice: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  itemLabel: {
    color: colors.textSecondary,
    textTransform: 'uppercase',
    fontSize: 12,
    marginTop: spacing.sm,
  },
  itemValue: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  roleButton: {
    backgroundColor: colors.card,
    borderRadius: spacing.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleButtonText: {
    color: colors.info,
    fontWeight: '600',
  },
  supportText: {
    color: colors.textSecondary,
  },
  logoutButton: {
    borderRadius: spacing.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.danger,
  },
  logoutButtonText: {
    color: colors.danger,
    fontWeight: '600',
  },
  usageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  usageValue: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 18,
  },
});
