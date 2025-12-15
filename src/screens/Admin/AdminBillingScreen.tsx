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

type AdminBillingData = {
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
  query AdminBilling {
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
  mutation AdminMarkBillingPaid($id: ID!) {
    markBillingPaid(id: $id) {
      id
      status
      amountPaid
    }
  }
`;

export const AdminBillingScreen = () => {
  const { data } = useQuery<AdminBillingData>(BILLING_QUERY);
  const [markPaid] = useMutation(BILLING_MUTATION, { refetchQueries: [{ query: BILLING_QUERY }] });

  const outstanding = (data?.billingStatements ?? []).filter((bill) => bill.status !== 'PAID');
  const collected = (data?.billingStatements ?? []).reduce((acc, bill) => acc + bill.amountPaid, 0);
  const recap = data?.monthlyRecap;

  const handleMarkPaid = async (id: string) => {
    try {
      await markPaid({ variables: { id } });
      Alert.alert('Updated', 'Payment captured');
    } catch (error) {
      Alert.alert('Error', 'Unable to update invoice');
    }
  };

  return (
    <Screen>
      <SectionHeader title="Billing (Admin)" />
      <View style={styles.summary}>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Outstanding invoices</Text>
          <Text style={styles.summaryValue}>{outstanding.length}</Text>
        </Card>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Collected this quarter</Text>
          <Text style={styles.summaryValue}>{formatCurrency(collected)}</Text>
        </Card>
      </View>
      {recap && (
        <Card style={styles.summaryCard}>
          <SectionHeader title={`${recap.monthLabel} performance`} />
          <View style={styles.rowBetween}>
            <Text style={styles.detail}>Boxes delivered</Text>
            <Text style={styles.value}>{recap.totalBoxes}</Text>
          </View>
          <ProgressBar value={recap.amountPaid} max={recap.amountDue} color={colors.success} />
          <Text style={styles.detail}>
            {formatCurrency(recap.amountPaid)} / {formatCurrency(recap.amountDue)} · Pending {formatCurrency(recap.amountPending)}
          </Text>
        </Card>
      )}
      {data?.billingStatements?.map((bill) => (
        <Card key={bill.id}>
          <View style={styles.rowBetween}>
            <Text style={styles.month}>{bill.month}</Text>
            <Text style={[styles.status, { color: bill.status === 'PAID' ? colors.success : colors.warning }]}>
              {bill.status}
            </Text>
          </View>
          <Text style={styles.detail}>Due {bill.dueDate}</Text>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.detail}>Boxes</Text>
              <Text style={styles.value}>{bill.totalBoxes}</Text>
            </View>
            <View>
              <Text style={styles.detail}>Amount due</Text>
              <Text style={styles.value}>{formatCurrency(bill.amountDue)}</Text>
            </View>
            <View>
              <Text style={styles.detail}>Paid</Text>
              <Text style={styles.value}>{formatCurrency(bill.amountPaid)}</Text>
            </View>
          </View>
          {bill.status !== 'PAID' && (
            <TouchableOpacity style={styles.button} onPress={() => handleMarkPaid(bill.id)}>
              <Text style={styles.buttonText}>Mark as paid</Text>
            </TouchableOpacity>
          )}
        </Card>
      ))}
    </Screen>
  );
};

const styles = StyleSheet.create({
  summary: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  summaryCard: {
    flex: 1,
    gap: spacing.xs,
  },
  summaryLabel: {
    color: colors.textSecondary,
  },
  summaryValue: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '600',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  month: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  detail: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  value: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  status: {
    fontWeight: '700',
  },
  button: {
    borderWidth: 1,
    borderColor: colors.info,
    borderRadius: spacing.md,
    padding: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonText: {
    color: colors.info,
    fontWeight: '600',
  },
});
