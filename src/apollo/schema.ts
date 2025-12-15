import { makeExecutableSchema } from '@graphql-tools/schema';
import { gql } from '@apollo/client';
import dayjs from 'dayjs';
import { AttendanceDay, Customer, MealWindow, mockDb } from '../data/mockData';

const typeDefs = gql`
  type MenuInfo {
    veg: String!
    nonVeg: String!
    special: String
  }

  type TodaySummary {
    date: String!
    mealsPlanned: Int!
    mealsSkipped: Int!
    mealsPaused: Int!
    remindersSent: Int!
    cutoffTime: String!
    todaysMenu: MenuInfo!
    hydration: String
  }

  type AttendanceDay {
    date: String!
    status: String!
    note: String
  }

  type BillingStatement {
    id: ID!
    month: String!
    totalBoxes: Int!
    amountDue: Float!
    amountPaid: Float!
    status: String!
    dueDate: String!
  }

  type Customer {
    id: ID!
    name: String!
    phone: String!
    vegType: String!
    planName: String!
    planPrice: Float!
    mealsPerDay: Int!
    address: String!
    avatarColor: String!
    boxesThisMonth: Int!
    status: String!
    isPaid: Boolean!
    lastPaymentDate: String!
  }

  type DashboardMetrics {
    totalActive: Int!
    paused: Int!
    pendingPayments: Int!
    todayBoxes: Int!
    skipped: Int!
  }

  type MonthlyRecap {
    monthLabel: String!
    totalBoxes: Int!
    amountDue: Float!
    amountPaid: Float!
    amountPending: Float!
    skippingCustomers: Int!
    pauseDays: Int!
    onTimeRate: Float!
    avgDeliveryRating: Float!
    highlights: [String!]!
  }

  type PlanBreakdownItem {
    label: String!
    customers: Int!
    percentage: Float!
  }

  type LeaderboardEntry {
    id: ID!
    name: String!
    boxesThisMonth: Int!
    status: String!
    streak: Int!
  }

  type MealWindow {
    meal: String!
    cutoffTime: String!
    price: Float!
  }

  type PauseWindow {
    id: ID!
    from: String!
    to: String!
    reason: String!
  }

  type Notification {
    id: ID!
    title: String!
    body: String!
    time: String!
  }

  type Query {
    todaySummary: TodaySummary!
    attendance(month: String!): [AttendanceDay!]!
    billingStatements: [BillingStatement!]!
    customers: [Customer!]!
    dashboard: DashboardMetrics!
    monthlyRecap: MonthlyRecap!
    planBreakdown: [PlanBreakdownItem!]!
    leaderboard: [LeaderboardEntry!]!
    mealWindows: [MealWindow!]!
    pauseWindows: [PauseWindow!]!
    notifications: [Notification!]!
  }

  type Mutation {
    markSkip(date: String!): AttendanceDay!
    schedulePause(from: String!, to: String!, reason: String!): PauseWindow!
    markBillingPaid(id: ID!): BillingStatement!
    updateMealWindow(meal: String!, cutoffTime: String!, price: Float!): MealWindow!
    createCustomer(name: String!, phone: String!, vegType: String!, planName: String!, planPrice: Float!): Customer!
  }
`;

const dbState = { ...mockDb };

const updateAttendance = (date: string, status: AttendanceDay['status'], note?: string) => {
  const idx = dbState.attendanceRecords.findIndex((record) => record.date === date);
  const updated: AttendanceDay = { date, status, note };

  if (idx >= 0) {
    dbState.attendanceRecords[idx] = updated;
  } else {
    dbState.attendanceRecords.push(updated);
  }

  return updated;
};

const resolvers = {
  Query: {
    todaySummary: () => dbState.todaySummary,
    attendance: (_: unknown, { month }: { month: string }) => {
      const parsed = dayjs(month, 'YYYY-MM');
      if (!parsed.isValid()) {
        return dbState.attendanceRecords;
      }
      return dbState.attendanceRecords.filter((record) => dayjs(record.date).format('YYYY-MM') === parsed.format('YYYY-MM'));
    },
    billingStatements: () => dbState.billingStatements,
    customers: () => dbState.customers,
    dashboard: () => dbState.dashboardMetrics,
    monthlyRecap: () => dbState.monthlyRecap,
    planBreakdown: () => dbState.planBreakdown,
    leaderboard: () => dbState.leaderboard,
    mealWindows: () => dbState.mealWindows,
    pauseWindows: () => dbState.pauseWindows,
    notifications: () => dbState.notifications,
  },
  Mutation: {
    markSkip: (_: unknown, { date }: { date: string }) => {
      const normalized = dayjs(date).format('YYYY-MM-DD');
      const updated = updateAttendance(normalized, 'SKIPPED', 'Marked via mobile app');
      if (dayjs(normalized).isSame(dbState.todaySummary.date, 'day')) {
        dbState.todaySummary.mealsSkipped += 1;
      }
      return updated;
    },
    schedulePause: (_: unknown, { from, to, reason }: { from: string; to: string; reason: string }) => {
      const pause = {
        id: `PAUSE-${dbState.pauseWindows.length + 1}`,
        from: dayjs(from).format('YYYY-MM-DD'),
        to: dayjs(to).format('YYYY-MM-DD'),
        reason,
      };
      dbState.pauseWindows.push(pause);
      const cursor = dayjs(from);
      const end = dayjs(to);
      while (cursor.isBefore(end) || cursor.isSame(end, 'day')) {
        updateAttendance(cursor.format('YYYY-MM-DD'), 'PAUSED', reason);
        cursor.add(1, 'day');
      }
      dbState.todaySummary.mealsPaused = dbState.pauseWindows.length;
      return pause;
    },
    markBillingPaid: (_: unknown, { id }: { id: string }) => {
      const statement = dbState.billingStatements.find((bill) => bill.id === id);
      if (!statement) {
        throw new Error('Bill not found');
      }
      statement.status = 'PAID';
      statement.amountPaid = statement.amountDue;
      return statement;
    },
    updateMealWindow: (_: unknown, { meal, cutoffTime, price }: { meal: string; cutoffTime: string; price: number }) => {
      const window = dbState.mealWindows.find((w) => w.meal === meal) as MealWindow | undefined;
      if (window) {
        window.cutoffTime = cutoffTime;
        window.price = price;
        return window;
      }
      const created: MealWindow = { meal: meal as MealWindow['meal'], cutoffTime, price };
      dbState.mealWindows.push(created);
      return created;
    },
    createCustomer: (
      _: unknown,
      { name, phone, vegType, planName, planPrice }: { name: string; phone: string; vegType: string; planName: string; planPrice: number },
    ) => {
      const newCustomer: Customer = {
        id: `CUST-${Math.floor(Math.random() * 900 + 100)}`,
        name,
        phone,
        vegType: vegType as Customer['vegType'],
        planName,
        planPrice,
        mealsPerDay: 2,
        address: 'New address pending',
        avatarColor: '#F97316',
        boxesThisMonth: 0,
        status: 'ACTIVE',
        isPaid: false,
        lastPaymentDate: dayjs().format('YYYY-MM-DD'),
      };
      dbState.customers.unshift(newCustomer);
      dbState.dashboardMetrics.totalActive = dbState.customers.filter((c) => c.status === 'ACTIVE').length;
      return newCustomer;
    },
  },
};

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
