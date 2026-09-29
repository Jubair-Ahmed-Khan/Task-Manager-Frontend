
import api from '@/services/api'

const TimeTrackingService = {
    // Get tasks visible to the logged-in user
    getTasks(params = {}) {
        return api.get('/tasks', { params })
    },

    // Start timer for a task
    startTimer(taskId) {
        return api.post(`/time-tracking/${taskId}/start`)
    },

    // Stop timer for a task
    stopTimer(taskId) {
        return api.post(`/time-tracking/${taskId}/stop`)
    },

    // Get time entries for a task
    getEntries(taskId, params = {}) {
        return api.get(`/time-tracking/${taskId}/entries`, {
            params,
        })
    },

    // Get total tracked time and active timer for a task
    getSummary(taskId) {
        return api.get(`/time-tracking/${taskId}/summary`)
    },
}

export default TimeTrackingService