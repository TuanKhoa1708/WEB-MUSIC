import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '@/hooks/useNotifications';
import type { AppNotification } from '@/types/notification.types';

function formatDistanceToNow(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

export function NotificationBell() {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getIconForType = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle size={16} className="text-[#3FD6FF]" />;
            case 'warning': return <AlertTriangle size={16} className="text-[#FFB900]" />;
            case 'error': return <AlertTriangle size={16} className="text-[#FF4444]" />;
            case 'info':
            default: return <Info size={16} className="text-[#888]" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2.5 text-[#b3b3b3] hover:text-white transition-all duration-300 rounded-full hover:bg-white/10 ${isOpen ? 'bg-white/10 text-white' : ''}`}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#3FD6FF] rounded-full border-2 border-[#121212] shadow-[0_0_10px_rgba(63,214,255,0.6)]" />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 top-[calc(100%+12px)] w-[360px] max-h-[480px] glass-strong rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col z-50 overflow-hidden"
                    >
                        <div className="border-b border-white/5 flex items-center justify-between bg-white/[0.02]" style={{ padding: '20px' }}>
                            <h3 className="font-bold text-lg text-white tracking-wide">Notifications</h3>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={() => markAllAsRead()}
                                    className="text-xs font-semibold text-[#3FD6FF] hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5"
                                >
                                    <Check size={14} /> Mark all read
                                </button>
                            )}
                        </div>

                        <div className="overflow-y-auto flex-1 custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center text-center" style={{ padding: '40px' }}>
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                        <Bell size={24} className="text-[#666]" />
                                    </div>
                                    <p className="text-[#888] font-medium">No notifications yet.</p>
                                    <p className="text-xs text-[#555] mt-1">When you get notifications, they'll show up here.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    {notifications.map((notification: AppNotification) => (
                                        <div 
                                            key={notification._id}
                                            onClick={() => {
                                                if (!notification.isRead) markAsRead(notification._id);
                                            }}
                                            className={`relative border-b border-white/5 cursor-pointer transition-all duration-200 flex gap-4 
                                                ${!notification.isRead ? 'bg-[#3FD6FF]/[0.03] hover:bg-[#3FD6FF]/[0.06]' : 'hover:bg-white/5'}
                                            `}
                                            style={{ padding: '20px' }}
                                        >
                                            {!notification.isRead && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#3FD6FF] shadow-[0_0_10px_rgba(63,214,255,0.5)]" />
                                            )}
                                            
                                            <div className={`mt-0.5 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${!notification.isRead ? 'bg-[#3FD6FF]/10' : 'bg-white/5'}`}>
                                                {getIconForType(notification.type)}
                                            </div>
                                            
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1.5 gap-2">
                                                    <h4 className={`text-sm ${!notification.isRead ? 'text-white font-bold' : 'text-[#ccc] font-semibold'}`}>
                                                        {notification.title}
                                                    </h4>
                                                </div>
                                                <p className={`text-[13px] leading-relaxed mb-2.5 ${!notification.isRead ? 'text-[#ddd]' : 'text-[#888]'}`}>
                                                    {notification.message}
                                                </p>
                                                <span className="text-[11px] font-medium text-[#666] flex items-center gap-1.5">
                                                    {formatDistanceToNow(notification.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
