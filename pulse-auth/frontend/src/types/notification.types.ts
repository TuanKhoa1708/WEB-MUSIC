export interface AppNotification {
    _id: string;
    userId: string;
    title: string;
    message: string;
    type: 'success' | 'warning' | 'info' | 'error';
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
}
