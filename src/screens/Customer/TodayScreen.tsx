import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import dayjs from 'dayjs';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card } from '../../components/Card';
import { ProgressBar } from '../../components/ProgressBar';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { StatCard } from '../../components/StatCard';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/layout';
import { formatCurrency, formatLongDate, formatTime } from '../../utils/format';

type TodayQueryData = {
  todaySummary: {
    date: string;
    mealsPlanned: number;
    mealsSkipped: number;
    mealsPaused: number;
    remindersSent: number;
    cutoffTime: string;
    todaysMenu: {
      veg: string;
      nonVeg: string;
      special?: string;
    };
    hydration?: string;
  };
  notifications: { id: string; title: string; body: string; time: string }[];
  pauseWindows: { id: string; from: string; to: string; reason: string }[];
  monthlyRecap: {
    monthLabel: string;
    totalBoxes: number;
    amountDue: number;
    amountPaid: number;
    amountPending: number;
    skippingCustomers: number;
    pauseDays: number;
    onTimeRate: number;
    avgDeliveryRating: number;
    highlights: string[];
  };
  mealWindows: { meal: string; cutoffTime: string; price: number }[];
};

const TODAY_QUERY = gql`
  query TodayOverview {
    todaySummary {
      date
      mealsPlanned
      mealsSkipped
      mealsPaused
      remindersSent
      cutoffTime
      todaysMenu {
        veg
        nonVeg
        special
      }
      hydration
    }
    notifications {
      id
      title
      body
      time
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
      amountDue
      amountPaid
      amountPending
      skippingCustomers
      pauseDays
      onTimeRate
      avgDeliveryRating
      highlights
    }
    mealWindows {
      meal
      cutoffTime
      price
    }
  }
`;

const SKIP_MUTATION = gql`
  mutation MarkSkip($date: String!) {
    markSkip(date: $date) {
      date
      status
      note
    }
  }
`;

const PAUSE_MUTATION = gql`
  mutation SchedulePause($from: String!, $to: String!, $reason: String!) {
    schedulePause(from: $from, to: $to, reason: $reason) {
      id
      from
      to
      reason
    }
  }
`;

export const TodayScreen = () => {
  const { data } = useQuery<TodayQueryData>(TODAY_QUERY);
  const [markSkip, { loading: skipLoading }] = useMutation(SKIP_MUTATION, {
    refetchQueries: [{ query: TODAY_QUERY }],
  });
  const [schedulePause, { loading: pauseLoading }] = useMutation(PAUSE_MUTATION, {
    refetchQueries: [{ query: TODAY_QUERY }],
  });

  const summary = data?.todaySummary;
  const recap = data?.monthlyRecap;
  const pauseWindows = data?.pauseWindows ?? [];
  const notifications = data?.notifications ?? [];
  const mealWindows = data?.mealWindows ?? [];

  const handleSkip = async () => {
    try {
      await markSkip({ variables: { date: summary?.date ?? dayjs().format('YYYY-MM-DD') } });
      Alert.alert('Marked', 'Skip recorded for today');
    } catch (error) {
      Alert.alert('Error', 'Unable to mark skip right now.');
    }
  };

  const handlePausePreset = async () => {
    const from = dayjs().add(2, 'day').format('YYYY-MM-DD');
    const to = dayjs().add(5, 'day').format('YYYY-MM-DD');
    try {
      await schedulePause({ variables: { from, to, reason: 'Short trip' } });
      Alert.alert('Scheduled', `Paused meals from ${formatLongDate(from)} to ${formatLongDate(to)}`);
    } catch (error) {
      Alert.alert('Error', 'Unable to pause right now.');
    }
  };

  return (
    <Screen>
      {recap && (
        <>
          <Text style={styles.sectionTitle}>{recap.monthLabel} snapshot</Text>
          <View style={styles.statsRow}>
            <StatCard label="Boxes" value={recap.totalBoxes} hint="Delivered this month" color={colors.brandSecondary} />
            <StatCard label="Amount paid" value={formatCurrency(recap.amountPaid)} color={colors.success} hint="Received" />
          </View>
          <Card>
            <SectionHeader title="Billing progress" />
            <ProgressBar value={recap.amountPaid} max={recap.amountDue} color={colors.success} />
            <Text style={styles.progressLabel}>
              {formatCurrency(recap.amountPaid)} / {formatCurrency(recap.amountDue)} paid · {formatCurrency(recap.amountPending)} pending
            </Text>
            <View style={styles.chipRow}>
              <Text style={styles.chip}>On-time {Math.round(recap.onTimeRate * 100)}%</Text>
              <Text style={styles.chip}>Avg rating {recap.avgDeliveryRating.toFixed(1)}</Text>
              <Text style={styles.chip}>{recap.pauseDays} pause days</Text>
            </View>
          </Card>
        </>
      )}
      {summary && (
        <>
          <Text style={styles.title}>Today · {formatLongDate(summary.date)}</Text>
          <View style={styles.statsRow}>
            <StatCard label="Planned" value={summary.mealsPlanned} hint={`Cutoff ${formatTime(summary.cutoffTime)}`} />
            <StatCard label="Skipped" value={summary.mealsSkipped} color={colors.warning} hint="Auto-updated" />
          </View>
          <View style={styles.statsRow}>
            <StatCard label="Paused" value={summary.mealsPaused} color={colors.info} hint="Upcoming breaks" />
            <StatCard label="Reminders" value={summary.remindersSent} color={colors.success} hint="Sent today" />
          </View>
          {mealWindows.length > 0 && (
            <Card>
              <SectionHeader title="Meals today" />
              {mealWindows.map((meal) => (
                <View key={meal.meal} style={styles.mealRow}>
                  <View>
                    <Text style={styles.menuLabel}>{meal.meal}</Text>
                    <Text style={styles.menuValue}>Cutoff {formatTime(meal.cutoffTime)}</Text>
                  </View>
                  <Text style={styles.menuValue}>{formatCurrency(meal.price)}</Text>
                </View>
              ))}
            </Card>
          )}
          <Card>
            <SectionHeader title="Today's Menu" />
            <View style={styles.menuRow}>
              <View style={styles.menu}>
                <Text style={styles.menuLabel}>Veg</Text>
                <Text style={styles.menuValue}>{summary.todaysMenu.veg}</Text>
              </View>
              <View style={styles.menu}>
                <Text style={styles.menuLabel}>Non-veg</Text>
                <Text style={styles.menuValue}>{summary.todaysMenu.nonVeg}</Text>
              </View>
            </View>
            {summary.todaysMenu.special && (
              <View style={[styles.menu, styles.special]}>
                <Text style={styles.menuLabel}>Special</Text>
                <Text style={styles.menuValue}>{summary.todaysMenu.special}</Text>
              </View>
            )}
            <Text style={styles.hydration}>Hydration: {summary.hydration}</Text>
          </Card>
        </>
      )}
      {recap?.highlights?.length ? (
        <Card>
          <SectionHeader title="Highlights" />
          {recap.highlights.map((item) => (
            <Text key={item} style={styles.highlight}>
              • {item}
            </Text>
          ))}
        </Card>
      ) : null}
      <Card>
        <SectionHeader title="Quick actions" />
        <TouchableOpacity style={styles.primaryButton} onPress={handleSkip} disabled={skipLoading}>
          <Text style={styles.primaryButtonText}>{skipLoading ? 'Marking...' : 'Skip today'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.outlineButton} onPress={handlePausePreset} disabled={pauseLoading}>
          <Text style={styles.outlineButtonText}>{pauseLoading ? 'Scheduling...' : 'Pause 3 days'}</Text>
        </TouchableOpacity>
      </Card>
      <Card>
        <SectionHeader title="Upcoming pauses" actionLabel="View calendar" />
        {pauseWindows.length ? (
          pauseWindows.map((window) => (
            <View key={window.id} style={styles.pauseRow}>
              <View>
                <Text style={styles.pauseDate}>
                  {formatLongDate(window.from)} → {formatLongDate(window.to)}
                </Text>
                <Text style={styles.pauseReason}>{window.reason}</Text>
              </View>
              <Text style={styles.statusBadge}>Approved</Text>
            </View>
          ))
        ) : (
          <Text style={styles.pauseReason}>No pauses scheduled.</Text>
        )}
      </Card>
      <Card>
        <SectionHeader title="Notifications" actionLabel="View all" />
        {notifications.map((notif) => (
          <View key={notif.id} style={styles.notification}>
            <View style={{ flex: 1 }}>
              <Text style={styles.notificationTitle}>{notif.title}</Text>
              <Text style={styles.notificationBody}>{notif.body}</Text>
            </View>
            <Text style={styles.notificationTime}>{notif.time}</Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  menuRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  menu: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: spacing.md,
    backgroundColor: colors.card,
  },
  special: {
    marginTop: spacing.sm,
    backgroundColor: '#2E1C34',
  },
  menuLabel: {
    color: colors.textSecondary,
    textTransform: 'uppercase',
    fontSize: 12,
  },
  menuValue: {
    color: colors.textPrimary,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  mealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  hydration: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
  },
  progressLabel: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  chip: {
    borderRadius: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    color: colors.textSecondary,
    fontSize: 12,
  },
  highlight: {
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  primaryButton: {
    backgroundColor: colors.brandPrimary,
    borderRadius: spacing.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  outlineButton: {
    borderRadius: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  outlineButtonText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  pauseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: spacing.md,
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
  statusBadge: {
    color: colors.success,
    fontWeight: '700',
  },
  notification: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
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
