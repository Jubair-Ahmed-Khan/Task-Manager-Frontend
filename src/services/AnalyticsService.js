import api from '@/services/api'

const AnalyticsService = {
    getDashboard() {
        return api.get('/analytics/dashboard')
    }
}

export default AnalyticsService