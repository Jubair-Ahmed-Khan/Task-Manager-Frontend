<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import NotificationService from '@/services/NotificationService'

const router = useRouter()

const notifications = ref([])
const unreadCount = ref(0)
const isOpen = ref(false)
const loading = ref(false)

let pollingInterval = null

const loadUnreadCount = async () => {
    try {
        const response = await NotificationService.getUnreadCount()

        unreadCount.value =
            response.data.data?.unread_count ??
            response.data.unread_count ??
            0
    } catch (error) {
        console.error('Failed to load unread count:', error)
    }
}

const loadNotifications = async () => {
    loading.value = true

    try {
        const response = await NotificationService.getNotifications({
            per_page: 10
        })

        notifications.value =
            response.data.data?.data ??
            response.data.data ??
            []

        await loadUnreadCount()
    } catch (error) {
        console.error('Failed to load notifications:', error)
    } finally {
        loading.value = false
    }
}

const toggleDropdown = async () => {
    isOpen.value = !isOpen.value

    if (isOpen.value) {
        await loadNotifications()
    }
}

const markAsRead = async (notification) => {
    try {
        if (!notification.read_at) {
            await NotificationService.markAsRead(notification.id)

            notification.read_at = new Date().toISOString()

            unreadCount.value = Math.max(
                0,
                unreadCount.value - 1
            )
        }

        isOpen.value = false

        const taskId = notification.data?.task_id

        if (taskId) {
            router.push({
                name: 'task-details',
                params: { id: taskId }
            })
        }
    } catch (error) {
        console.error('Failed to mark notification as read:', error)
    }
}

const markAllAsRead = async () => {
    try {
        await NotificationService.markAllAsRead()

        notifications.value.forEach(notification => {
            notification.read_at = new Date().toISOString()
        })

        unreadCount.value = 0
    } catch (error) {
        console.error('Failed to mark all notifications as read:', error)
    }
}

onMounted(() => {
    loadUnreadCount()

    pollingInterval = setInterval(loadUnreadCount, 30000)
})

onUnmounted(() => {
    if (pollingInterval) {
        clearInterval(pollingInterval)
    }
})
</script>

<template>
    <div class="relative">
        <!-- Bell Button -->
        <button
            type="button"
            @click="toggleDropdown"
            class="relative flex items-center justify-center w-10 h-10
                   rounded-full text-gray-600 hover:bg-gray-100
                   focus:outline-none"
            aria-label="Notifications"
        >
            <span class="text-2xl">🔔</span>

            <!-- Unread Badge -->
            <span
                v-if="unreadCount > 0"
                class="absolute -top-1 -right-1 min-w-5 h-5
                       px-1 flex items-center justify-center
                       rounded-full bg-red-600 text-white
                       text-xs font-bold"
            >
                {{ unreadCount > 99 ? '99+' : unreadCount }}
            </span>
        </button>

        <!-- Dropdown -->
        <div
            v-if="isOpen"
            class="absolute right-0 mt-2 w-80 bg-white
                   rounded-lg shadow-lg border border-gray-200
                   z-50 overflow-hidden"
        >
            <div
                class="flex items-center justify-between
                       px-4 py-3 border-b"
            >
                <h3 class="font-semibold text-gray-800">
                    Notifications
                </h3>

                <button
                    v-if="unreadCount > 0"
                    type="button"
                    @click="markAllAsRead"
                    class="text-xs text-blue-600 hover:underline"
                >
                    Mark all read
                </button>
            </div>

            <div v-if="loading" class="p-4 text-center text-gray-500">
                Loading notifications...
            </div>

            <div
                v-else-if="notifications.length === 0"
                class="p-4 text-center text-gray-500 text-sm"
            >
                No notifications
            </div>

            <div v-else class="max-h-96 overflow-y-auto">
                <button
                    v-for="notification in notifications"
                    :key="notification.id"
                    type="button"
                    @click="markAsRead(notification)"
                    class="w-full text-left px-4 py-3 border-b
                           hover:bg-gray-50"
                    :class="{
                        'bg-blue-50': !notification.read_at
                    }"
                >
                    <p class="text-sm text-gray-800">
                        {{ notification.data?.message || 'New notification' }}
                    </p>

                    <p class="text-xs text-gray-500 mt-1">
                        {{ new Date(notification.created_at).toLocaleDateString('en-GB') }}
                    </p>
                </button>
            </div>
        </div>
    </div>
</template>