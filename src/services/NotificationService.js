
import api from '@/services/api'

const NotificationService = {
    // Get notifications with pagination
    getNotifications(params = {}) {
        return api.get('/notifications', {
            params,
        })
    },

    // Get unread notification count
    getUnreadCount() {
        return api.get('/notifications/unread-count')
    },

    // Mark one notification as read
    markAsRead(id) {
        return api.patch(`/notifications/${id}/read`)
    },

    // Mark all notifications as read
    markAllAsRead() {
        return api.patch('/notifications/read-all')
    },
}

export default NotificationService