import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../../components/Card';
import { ProgressBar } from '../../components/ProgressBar';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { StatCard } from '../../components/StatCard';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/layout';
import { formatCurrency } from '../../utils/format';

type DashboardQueryData = {
  dashboard: {
    totalActive: number;
    paused: number;
    pendingPayments: number;
    todayBoxes: number;
    skipped: number;
  };
  todaySummary: {
    date: string;
    mealsPlanned: number;
    mealsSkipped: number;
    mealsPaused: number;
    todaysMenu: { veg: string; nonVeg: string };
  };
  notifications: { id: string; title: string; body: string; time: string }[];
  monthlyRecap: {
    monthLabel: string;
    totalBoxes: number;
    amountPaid: number;
    amountDue: number;
    highlights: string[];
  };
  planBreakdown: { label: string; customers: number; percentage: number }[];
  leaderboard: { id: string; name: string; boxesThisMonth: number; status: string; streak: number }[];
};

const DASHBOARD_QUERY = gql`
  query DashboardData {
    dashboard {
      totalActive
      paused
      pendingPayments
      todayBoxes
      skipped
    }
    todaySummary {
      date
      mealsPlanned
      mealsSkipped
      mealsPaused
      todaysMenu {
        veg
        nonVeg
      }
    }
    notifications {
      id
      title
      body
      time
    }
    monthlyRecap {
      monthLabel
      totalBoxes
      amountPaid
      amountDue
      highlights
    }
    planBreakdown {
      label
      customers
      percentage
    }
    leaderboard {
      id
      name
      boxesThisMonth
      status
      streak
    }
  }
`;

export const DashboardScreen = () => {
  const { data } = useQuery<DashboardQueryData>(DASHBOARD_QUERY, { pollInterval: 5000 });
  const metrics = data?.dashboard;
  const recap = data?.monthlyRecap;

  return (
    <Screen>
      <Text style={styles.title}>Admin overview</Text>
      {metrics && (
        <>
          <View style={styles.row}>
            <StatCard label="Active" value={metrics.totalActive} color={colors.success} />
            <StatCard label="Paused" value={metrics.paused} color={colors.info} />
          </View>
          <View style={styles.row}>
            <StatCard label="Pending pay" value={metrics.pendingPayments} color={colors.warning} />
            <StatCard label="Today boxes" value={metrics.todayBoxes} color={colors.brandPrimary} />
          </View>
        </>
      )}
      {recap && (
        <Card>
          <SectionHeader title={`${recap.monthLabel} recap`} />
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.body}>Monthly boxes</Text>
              <Text style={styles.summaryValue}>{recap.totalBoxes}</Text>
            </View>
            <View>
              <Text style={styles.body}>Revenue</Text>
              <Text style={styles.summaryValue}>{formatCurrency(recap.amountPaid)}</Text>
            </View>
          </View>
          <ProgressBar value={recap.amountPaid} max={recap.amountDue} color={colors.success} />
          <Text style={styles.body}>
            {formatCurrency(recap.amountPaid)} / {formatCurrency(recap.amountDue)} collected
          </Text>
          {recap.highlights.map((note) => (
            <Text key={note} style={styles.highlight}>
              • {note}
            </Text>
          ))}
        </Card>
      )}
      <Card>
        <SectionHeader title="Kitchen snapshot" />
        <Text style={styles.body}>Orders planned: {data?.todaySummary?.mealsPlanned}</Text>
        <Text style={styles.body}>Skipped via app: {data?.todaySummary?.mealsSkipped}</Text>
        <Text style={styles.body}>Paused customers: {data?.todaySummary?.mealsPaused}</Text>
        <Text style={styles.body}>Veg menu: {data?.todaySummary?.todaysMenu?.veg}</Text>
        <Text style={styles.body}>Non-veg menu: {data?.todaySummary?.todaysMenu?.nonVeg}</Text>
      </Card>
      {data?.planBreakdown && (
        <Card>
          <SectionHeader title="Plan mix" />
          {data.planBreakdown.map((plan) => (
            <View key={plan.label} style={styles.planRow}>
              <Text style={styles.body}>{plan.label}</Text>
              <Text style={styles.body}>
                {plan.customers} customers · {plan.percentage}%
              </Text>
            </View>
          ))}
        </Card>
      )}
      {data?.leaderboard && (
        <Card>
          <SectionHeader title="Top customers" />
          {data.leaderboard.map((entry) => (
            <View key={entry.id} style={styles.leaderRow}>
              <View>
                <Text style={styles.notificationTitle}>{entry.name}</Text>
                <Text style={styles.notificationBody}>
                  {entry.boxesThisMonth} boxes · {entry.status}
                </Text>
              </View>
              <Text style={styles.notificationTime}>{entry.streak} day streak</Text>
            </View>
          ))}
        </Card>
      )}
      <Card>
        <SectionHeader title="Latest activity" />
        {data?.notifications?.map((notification) => (
          <View key={notification.id} style={styles.notification}>
            <View style={{ flex: 1 }}>
              <Text style={styles.notificationTitle}>{notification.title}</Text>
              <Text style={styles.notificationBody}>{notification.body}</Text>
            </View>
            <Text style={styles.notificationTime}>{notification.time}</Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  body: {
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryValue: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  highlight: {
    color: colors.textSecondary,
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  leaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  notification: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
  },
  notificationTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  notificationBody: {
    color: colors.textSecondary,
  },
  notificationTime: {
    color: colors.textSecondary,
    fontSize: 12,
  },
});
