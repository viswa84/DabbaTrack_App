import dayjs from 'dayjs';

export type AttendanceStatus = 'DELIVERED' | 'SKIPPED' | 'PAUSED';

export interface AttendanceDay {
  date: string;
  status: AttendanceStatus;
  note?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  vegType: 'VEG' | 'NON_VEG' | 'JAIN';
  planName: string;
  planPrice: number;
  mealsPerDay: number;
  address: string;
  avatarColor: string;
  boxesThisMonth: number;
  status: 'ACTIVE' | 'PAUSED';
  isPaid: boolean;
  lastPaymentDate: string;
}

export interface BillingStatement {
  id: string;
  month: string;
  totalBoxes: number;
  amountDue: number;
  amountPaid: number;
  status: 'PENDING' | 'PAID' | 'PARTIAL';
  dueDate: string;
}

export interface PauseWindow {
  id: string;
  from: string;
  to: string;
  reason: string;
}

export interface MonthlyRecap {
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
}

export interface PlanBreakdownItem {
  label: string;
  customers: number;
  percentage: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  boxesThisMonth: number;
  status: 'ACTIVE' | 'PAUSED';
  streak: number;
}

export interface MealWindow {
  meal: 'LUNCH' | 'DINNER';
  cutoffTime: string;
  price: number;
}

const today = dayjs();
const startOfMonth = today.startOf('month');

const attendanceRecords: AttendanceDay[] = Array.from({ length: today.daysInMonth() }, (_, idx) => {
  const date = startOfMonth.add(idx, 'day');
  const formatted = date.format('YYYY-MM-DD');
  if (date.isAfter(today)) {
    return { date: formatted, status: 'DELIVERED' };
  }

  if (idx % 9 === 0) {
    return { date: formatted, status: 'SKIPPED', note: 'Customer requested skip' };
  }

  if (idx % 13 === 0) {
    return { date: formatted, status: 'PAUSED', note: 'Festival break' };
  }

  return {
    date: formatted,
    status: 'DELIVERED',
  };
});

const customers: Customer[] = [
  {
    id: 'CUST-101',
    name: 'Aarav Patel',
    phone: '9876543210',
    vegType: 'VEG',
    planName: 'Classic Veg',
    planPrice: 4500,
    mealsPerDay: 2,
    address: 'Powai, Mumbai',
    avatarColor: '#F97316',
    boxesThisMonth: 52,
    status: 'ACTIVE',
    isPaid: false,
    lastPaymentDate: today.subtract(1, 'month').endOf('month').format('YYYY-MM-DD'),
  },
  {
    id: 'CUST-102',
    name: 'Diya Nair',
    phone: '9876501234',
    vegType: 'NON_VEG',
    planName: 'Protein Pro',
    planPrice: 5200,
    mealsPerDay: 2,
    address: 'HSR Layout, Bengaluru',
    avatarColor: '#22C55E',
    boxesThisMonth: 48,
    status: 'ACTIVE',
    isPaid: true,
    lastPaymentDate: today.startOf('month').format('YYYY-MM-DD'),
  },
  {
    id: 'CUST-103',
    name: 'Kabir Khatri',
    phone: '9988776655',
    vegType: 'VEG',
    planName: 'Office Hustle',
    planPrice: 3800,
    mealsPerDay: 1,
    address: 'Bandra, Mumbai',
    avatarColor: '#3B82F6',
    boxesThisMonth: 35,
    status: 'PAUSED',
    isPaid: true,
    lastPaymentDate: today.subtract(2, 'month').endOf('month').format('YYYY-MM-DD'),
  },
  {
    id: 'CUST-104',
    name: 'Saanvi Rao',
    phone: '9191919191',
    vegType: 'JAIN',
    planName: 'Balance Jain',
    planPrice: 5000,
    mealsPerDay: 2,
    address: 'Kondapur, Hyderabad',
    avatarColor: '#A855F7',
    boxesThisMonth: 46,
    status: 'ACTIVE',
    isPaid: false,
    lastPaymentDate: today.subtract(1, 'month').format('YYYY-MM-DD'),
  },
];

const billingStatements: BillingStatement[] = [
  {
    id: 'BILL-2024-12',
    month: today.format('MMMM YYYY'),
    totalBoxes: 112,
    amountDue: 7200,
    amountPaid: 3500,
    status: 'PARTIAL',
    dueDate: today.endOf('month').format('YYYY-MM-DD'),
  },
  {
    id: 'BILL-2024-11',
    month: today.subtract(1, 'month').format('MMMM YYYY'),
    totalBoxes: 118,
    amountDue: 7100,
    amountPaid: 7100,
    status: 'PAID',
    dueDate: today.subtract(1, 'month').endOf('month').format('YYYY-MM-DD'),
  },
  {
    id: 'BILL-2024-10',
    month: today.subtract(2, 'month').format('MMMM YYYY'),
    totalBoxes: 124,
    amountDue: 7450,
    amountPaid: 7450,
    status: 'PAID',
    dueDate: today.subtract(2, 'month').endOf('month').format('YYYY-MM-DD'),
  },
];

const pauseWindows: PauseWindow[] = [
  {
    id: 'PAUSE-1',
    from: today.add(5, 'day').format('YYYY-MM-DD'),
    to: today.add(7, 'day').format('YYYY-MM-DD'),
    reason: 'Business trip',
  },
];

const notifications = [
  {
    id: 'NOTIF-1',
    title: 'Cutoff reminder',
    body: 'Skip window closes at 10:00 AM',
    time: '08:30 AM',
  },
  {
    id: 'NOTIF-2',
    title: 'Delivery updated',
    body: 'Chef confirmed today’s menu - Paneer Lababdar, Phulka.',
    time: '09:15 AM',
  },
];

const dashboardMetrics = {
  totalActive: customers.filter((c) => c.status === 'ACTIVE').length,
  paused: customers.filter((c) => c.status === 'PAUSED').length,
  pendingPayments: customers.filter((c) => !c.isPaid).length,
  todayBoxes: 126,
  skipped: attendanceRecords.filter((a) => a.status === 'SKIPPED').length,
};

const totalBoxesThisMonth = customers.reduce((acc, customer) => acc + customer.boxesThisMonth, 0);
const amountPaidThisMonth = billingStatements.reduce((acc, bill) => acc + bill.amountPaid, 0);
const amountDueThisMonth = billingStatements.reduce((acc, bill) => acc + bill.amountDue, 0);
const skipDays = attendanceRecords.filter((record) => record.status === 'SKIPPED').length;
const pauseDays = attendanceRecords.filter((record) => record.status === 'PAUSED').length;

const monthlyRecap: MonthlyRecap = {
  monthLabel: today.format('MMMM YYYY'),
  totalBoxes: totalBoxesThisMonth,
  amountDue: amountDueThisMonth,
  amountPaid: amountPaidThisMonth,
  amountPending: Math.max(amountDueThisMonth - amountPaidThisMonth, 0),
  skippingCustomers: Math.max(3, Math.round(skipDays / 2)),
  pauseDays,
  onTimeRate: 0.94,
  avgDeliveryRating: 4.6,
  highlights: [
    '45 pre-cutoff skips recorded via app',
    'UPI collections up 32% vs last month',
  ],
};

const vegFriendlyLabel: Record<Customer['vegType'], string> = {
  VEG: 'Veg',
  NON_VEG: 'Non-veg',
  JAIN: 'Jain',
};

const planCounts = customers.reduce(
  (acc, customer) => ({
    ...acc,
    [customer.vegType]: (acc[customer.vegType] ?? 0) + 1,
  }),
  {} as Record<Customer['vegType'], number>,
);

const planBreakdown: PlanBreakdownItem[] = Object.entries(planCounts).map(([vegType, count]) => ({
  label: vegFriendlyLabel[vegType as Customer['vegType']],
  customers: count,
  percentage: Number(((count / customers.length) * 100).toFixed(1)),
}));

const leaderboard: LeaderboardEntry[] = [...customers]
  .sort((a, b) => b.boxesThisMonth - a.boxesThisMonth)
  .map((customer, index) => ({
    id: customer.id,
    name: customer.name,
    boxesThisMonth: customer.boxesThisMonth,
    status: customer.status,
    streak: 5 + index * 2,
  }));

const mealWindows: MealWindow[] = [
  { meal: 'LUNCH', cutoffTime: '11:00', price: 120 },
  { meal: 'DINNER', cutoffTime: '19:00', price: 140 },
];

export const mockDb = {
  todaySummary: {
    date: today.format('YYYY-MM-DD'),
    mealsPlanned: 132,
    mealsSkipped: attendanceRecords.filter(
      (record) => record.date === today.format('YYYY-MM-DD') && record.status === 'SKIPPED',
    ).length,
    mealsPaused: pauseWindows.length,
    remindersSent: 42,
    cutoffTime: '10:00',
    todaysMenu: {
      veg: 'Paneer Lababdar + Multigrain Phulka',
      nonVeg: 'Chicken Chettinad + Ajwain Roti',
      special: 'Sabudana Khichdi (Fasting)',
    },
    hydration: 'Fresh Jaljeera',
  },
  attendanceRecords,
  customers,
  billingStatements,
  pauseWindows,
  notifications,
  dashboardMetrics,
  monthlyRecap,
  planBreakdown,
  leaderboard,
  mealWindows,
};

export type MockDb = typeof mockDb;
