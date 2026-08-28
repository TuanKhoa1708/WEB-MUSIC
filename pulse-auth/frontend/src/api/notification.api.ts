import axiosInstance from '@/api/axios';
import type { AppNotification } from '@/types/notification.types';

export const getNotifications = async (): Promise<AppNotification[]> => {
    const { data } = await axiosInstance.get('/notifications');
    return data.data;
};

export const markAsRead = async (id: string): Promise<AppNotification> => {
    const { data } = await axiosInstance.patch(`/notifications/${id}/read`);
    return data.data;
};

export const markAllAsRead = async (): Promise<void> => {
    await axiosInstance.patch('/notifications/read-all');
};
