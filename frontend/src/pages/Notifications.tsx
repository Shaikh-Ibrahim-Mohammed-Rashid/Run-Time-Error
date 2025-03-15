import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Heart, 
  Calendar, 
  MessageSquare, 
  AlertCircle, 
  Check, 
  X,
  ChevronDown,
  FileText,
  Clock
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'appointment' | 'health' | 'message' | 'report' | 'reminder';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'appointment',
    title: 'Upcoming Appointment',
    description: 'Your annual health checkup is scheduled for tomorrow at 10:00 AM',
    timestamp: '2 hours ago',
    isRead: false,
    priority: 'high'
  },
  {
    id: '2',
    type: 'health',
    title: 'Health Alert',
    description: 'Your heart rate was above normal during your last workout session',
    timestamp: '4 hours ago',
    isRead: false,
    priority: 'high'
  },
  {
    id: '3',
    type: 'message',
    title: 'New Message from Dr. Smith',
    description: 'Your test results have been reviewed. Everything looks good!',
    timestamp: '1 day ago',
    isRead: true,
    priority: 'medium'
  },
  {
    id: '4',
    type: 'report',
    title: 'Lab Results Available',
    description: 'Your recent blood work results are now available for review',
    timestamp: '2 days ago',
    isRead: true,
    priority: 'medium'
  },
  {
    id: '5',
    type: 'reminder',
    title: 'Medication Reminder',
    description: 'Don\'t forget to take your evening medication',
    timestamp: '3 days ago',
    isRead: true,
    priority: 'low'
  }
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'appointment':
      return Calendar;
    case 'health':
      return Heart;
    case 'message':
      return MessageSquare;
    case 'report':
      return FileText;
    case 'reminder':
      return Clock;
    default:
      return Bell;
  }
};

const getPriorityStyles = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-50 text-red-600 border-red-100';
    case 'medium':
      return 'bg-yellow-50 text-yellow-600 border-yellow-100';
    case 'low':
      return 'bg-green-50 text-green-600 border-green-100';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-100';
  }
};

const NotificationItem = ({ notification, onMarkAsRead, onDelete }: { 
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const Icon = getNotificationIcon(notification.type);
  const priorityStyle = getPriorityStyles(notification.priority);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 
        ${!notification.isRead ? 'ring-2 ring-blue-100' : ''}`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-lg ${notification.isRead ? 'bg-gray-50' : 'bg-blue-50'}`}>
          <Icon className={`w-5 h-5 ${notification.isRead ? 'text-gray-500' : 'text-blue-500'}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-medium text-gray-900">{notification.title}</h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityStyle}`}>
              {notification.priority}
            </span>
          </div>
          
          <p className="mt-1 text-sm text-gray-600">{notification.description}</p>
          
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-500">{notification.timestamp}</span>
            
            <div className="flex items-center gap-2">
              {!notification.isRead && (
                <button
                  onClick={() => onMarkAsRead(notification.id)}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => onDelete(notification.id)}
                className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'priority'>('newest');

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, isRead: true } : notif
    ));
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.isRead;
    if (filter === 'read') return notif.isRead;
    return true;
  });

  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    // Sort by newest
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              Notifications
              {unreadCount > 0 && (
                <span className="px-2 py-1 text-sm bg-blue-100 text-blue-600 rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </h1>
            <p className="text-gray-600 mt-1">Stay updated with your health journey</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'read')}
              className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'priority')}
              className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm"
            >
              <option value="newest">Newest</option>
              <option value="priority">Priority</option>
            </select>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          <AnimatePresence>
            {sortedNotifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>

          {sortedNotifications.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">You're all caught up!</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications; 