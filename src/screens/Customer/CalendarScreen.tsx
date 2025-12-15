import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card } from '../../components/Card';
import { ProgressBar } from '../../components/ProgressBar';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/layout';
import { formatCurrency } from '../../utils/format';

type CalendarQueryData = {
  attendance: { date: string; status: 'DELIVERED' | 'SKIPPED' | 'PAUSED'; note?: string }[];
  pauseWindows: { id: string; from: string; to: string; reason: string }[];
  monthlyRecap: {
    monthLabel: string;
    totalBoxes: number;
    amountPaid: number;
    amountDue: number;
    skippingCustomers: number;
    pauseDays: number;
  };
};

const ATTENDANCE_QUERY = gql`
  query Attendance($month: String!) {
    attendance(month: $month) {
      date
      status
      note
    }
    pauseWindows {
      id
      from
      to
      reason
    }
    monthlyRecap {
      monthLabel
      totalBoxes
      amountPaid
      amountDue
      skippingCustomers
      pauseDays
    }
  }
`;

const statusStyles = {
  DELIVERED: { label: 'Delivered', color: colors.success },
  SKIPPED: { label: 'Skipped', color: colors.warning },
  PAUSED: { label: 'Paused', color: colors.info },
};

export const CalendarScreen = () => {
  const [cursor, setCursor] = useState(dayjs());
  const { data, loading } = useQuery<CalendarQueryData>(ATTENDANCE_QUERY, {
    variables: { month: cursor.format('YYYY-MM') },
  });

  const handleChangeMonth = (direction: 'prev' | 'next') => {
    setCursor((prev) => prev.add(direction === 'next' ? 1 : -1, 'month'));
  };

  const records = data?.attendance ?? [];

  return (
    <Screen>
      <SectionHeader title="Calendar & skips" />
      <Card>
        <View style={styles.monthHeader}>
          <TouchableOpacity onPress={() => handleChangeMonth('prev')}>
            <Text style={styles.chevron}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{cursor.format('MMMM YYYY')}</Text>
          <TouchableOpacity onPress={() => handleChangeMonth('next')}>
            <Text style={styles.chevron}>{'>'}</Text>
          </TouchableOpacity>
        </View>
        {loading && <Text style={styles.loading}>Loading...</Text>}
        <View style={styles.grid}>
          {records.map((record: any) => (
            <View key={record.date} style={[styles.day, { borderColor: statusStyles[record.status as keyof typeof statusStyles]?.color || colors.border }]}>
              <Text style={styles.dayDate}>{dayjs(record.date).format('DD')}</Text>
              <Text
                style={[
                  styles.dayStatus,
                  { color: statusStyles[record.status as keyof typeof statusStyles]?.color || colors.textSecondary },
                ]}
              >
                {statusStyles[record.status as keyof typeof statusStyles]?.label || record.status}
              </Text>
            </View>
          ))}
        </View>
      </Card>
      {data?.monthlyRecap && (
        <Card>
          <SectionHeader title={`${data.monthlyRecap.monthLabel} summary`} />
          <Text style={styles.summaryText}>Boxes delivered: {data.monthlyRecap.totalBoxes}</Text>
          <Text style={styles.summaryText}>Skips logged: {data.monthlyRecap.skippingCustomers}</Text>
          <Text style={styles.summaryText}>Pause days: {data.monthlyRecap.pauseDays}</Text>
          <ProgressBar value={data.monthlyRecap.amountPaid} max={data.monthlyRecap.amountDue} color={colors.success} />
          <Text style={styles.progressLabel}>
            {formatCurrency(data.monthlyRecap.amountPaid)} / {formatCurrency(data.monthlyRecap.amountDue)} paid
          </Text>
        </Card>
      )}
      <Card>
        <SectionHeader title="Pause windows" />
        {data?.pauseWindows?.map((pause: any) => (
          <View key={pause.id} style={styles.pauseCard}>
            <Text style={styles.pauseDate}>
              {dayjs(pause.from).format('DD MMM')} → {dayjs(pause.to).format('DD MMM')}
            </Text>
            <Text style={styles.pauseReason}>{pause.reason}</Text>
          </View>
        ))}
      </Card>
      <Card>
        <SectionHeader title="Legend" />
        <View style={styles.legendRow}>
          {Object.entries(statusStyles).map(([key, value]) => (
            <View key={key} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: value.color }]} />
              <Text style={styles.legendLabel}>{value.label}</Text>
            </View>
          ))}
        </View>
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chevron: {
    fontSize: 28,
    color: colors.textPrimary,
  },
  monthLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  loading: {
    color: colors.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  day: {
    width: '30%',
    borderWidth: 1,
    borderRadius: spacing.md,
    padding: spacing.sm,
  },
  dayDate: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  dayStatus: {
    marginTop: spacing.xs,
    fontSize: 12,
    fontWeight: '600',
  },
  summaryText: {
    color: colors.textSecondary,
  },
  progressLabel: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  pauseCard: {
    padding: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: spacing.md,
    marginBottom: spacing.sm,
  },
  pauseDate: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  pauseReason: {
    color: colors.textSecondary,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    color: colors.textSecondary,
  },
});
