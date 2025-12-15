import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card } from '../../components/Card';
import { ProgressBar } from '../../components/ProgressBar';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/layout';
import { formatCurrency } from '../../utils/format';

type BillingQueryData = {
  billingStatements: {
    id: string;
    month: string;
    totalBoxes: number;
    amountDue: number;
    amountPaid: number;
    status: string;
    dueDate: string;
  }[];
  monthlyRecap: {
    monthLabel: string;
    totalBoxes: number;
    amountDue: number;
    amountPaid: number;
    amountPending: number;
  };
};

const BILLING_QUERY = gql`
  query BillingStatements {
    billingStatements {
      id
      month
      totalBoxes
      amountDue
      amountPaid
      status
      dueDate
    }
    monthlyRecap {
      monthLabel
      totalBoxes
      amountDue
      amountPaid
      amountPending
    }
  }
`;

const BILLING_MUTATION = gql`
  mutation MarkBillingPaid($id: ID!) {
    markBillingPaid(id: $id) {
      id
      status
      amountPaid
    }
  }
`;

const statusColors: Record<string, string> = {
  PAID: colors.success,
  PARTIAL: colors.warning,
  PENDING: colors.danger,
};

export const BillingScreen = () => {
  const { data } = useQuery<BillingQueryData>(BILLING_QUERY);
  const [markPaid] = useMutation(BILLING_MUTATION, {
    refetchQueries: [{ query: BILLING_QUERY }],
  });

  const handleMarkPaid = async (id: string) => {
    try {
      await markPaid({ variables: { id } });
      Alert.alert('Done', 'Invoice marked as paid');
    } catch (error) {
      Alert.alert('Error', 'Unable to update payment');
    }
  };

  const recap = data?.monthlyRecap;

  return (
    <Screen>
      <SectionHeader title="Billing history" />
      {recap && (
        <Card style={styles.summaryCard}>
          <SectionHeader title={`${recap.monthLabel} invoices`} />
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>Boxes delivered</Text>
              <Text style={styles.summaryValue}>{recap.totalBoxes}</Text>
            </View>
            <View>
              <Text style={styles.summaryLabel}>Paid</Text>
              <Text style={styles.summaryValue}>{formatCurrency(recap.amountPaid)}</Text>
            </View>
            <View>
              <Text style={styles.summaryLabel}>Pending</Text>
              <Text style={[styles.summaryValue, { color: colors.warning }]}>{formatCurrency(recap.amountPending)}</Text>
            </View>
          </View>
          <ProgressBar value={recap.amountPaid} max={recap.amountDue} color={colors.success} />
          <Text style={styles.summaryHelper}>
            {formatCurrency(recap.amountPaid)} / {formatCurrency(recap.amountDue)} cleared this month
          </Text>
        </Card>
      )}
      {data?.billingStatements?.map((bill) => (
        <Card key={bill.id} style={styles.billCard}>
          <View style={styles.billHeader}>
            <View>
              <Text style={styles.billMonth}>{bill.month}</Text>
              <Text style={styles.billDue}>Due {bill.dueDate}</Text>
            </View>
            <Text style={[styles.statusPill, { color: statusColors[bill.status] || colors.textSecondary }]}>
              {bill.status}
            </Text>
          </View>
          <View style={styles.billMetrics}>
            <View>
              <Text style={styles.billLabel}>Boxes</Text>
              <Text style={styles.billValue}>{bill.totalBoxes}</Text>
            </View>
            <View>
              <Text style={styles.billLabel}>Amount due</Text>
              <Text style={styles.billValue}>{formatCurrency(bill.amountDue)}</Text>
            </View>
            <View>
              <Text style={styles.billLabel}>Paid</Text>
              <Text style={styles.billValue}>{formatCurrency(bill.amountPaid)}</Text>
            </View>
          </View>
          {bill.status !== 'PAID' && (
            <TouchableOpacity style={styles.payButton} onPress={() => handleMarkPaid(bill.id)}>
              <Text style={styles.payButtonText}>Mark paid</Text>
            </TouchableOpacity>
          )}
        </Card>
      ))}
    </Screen>
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    gap: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  summaryValue: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
  summaryHelper: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  billCard: {
    gap: spacing.sm,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billMonth: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '600',
  },
  billDue: {
    color: colors.textSecondary,
  },
  statusPill: {
    fontWeight: '700',
  },
  billMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  billLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  billValue: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
  payButton: {
    borderRadius: spacing.md,
    padding: spacing.sm,
    borderColor: colors.border,
    borderWidth: 1,
    alignItems: 'center',
  },
  payButtonText: {
    color: colors.info,
    fontWeight: '600',
  },
});
