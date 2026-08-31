import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markAsRead, markAllAsRead } from '@/api/notification.api';
import toast from 'react-hot-toast';

export function useNotifications() {
    const queryClient = useQueryClient();

    const notificationsQuery = useQuery({
        queryKey: ['notifications'],
        queryFn: getNotifications,
        refetchInterval: 60000, // Poll every minute
    });

    const markAsReadMutation = useMutation({
        mutationFn: markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
        onError: (error: Error) => {
            toast.error('Failed to mark notification as read: ' + error.message);
        }
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
        onError: (error: Error) => {
            toast.error('Failed to mark all as read: ' + error.message);
        }
    });

    return {
        notifications: notificationsQuery.data || [],
        isLoading: notificationsQuery.isLoading,
        error: notificationsQuery.error,
        unreadCount: (notificationsQuery.data || []).filter(n => !n.isRead).length,
        markAsRead: markAsReadMutation.mutate,
        markAllAsRead: markAllAsReadMutation.mutate,
    };
}
