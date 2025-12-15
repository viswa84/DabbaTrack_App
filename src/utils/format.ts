import dayjs from 'dayjs';

export const formatShortDate = (date: string) => dayjs(date).format('DD MMM');

export const formatLongDate = (date: string) => dayjs(date).format('dddd, MMM D');

export const formatTime = (time: string) => dayjs(time, 'HH:mm').format('h:mm A');

export const formatCurrency = (value: number) => `₹ ${Math.round(value).toLocaleString('en-IN')}`;
