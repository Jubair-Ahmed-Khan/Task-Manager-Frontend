<script setup>
import AppSidebar from '@/components/AppSidebar.vue'
import AppNavbar from '@/components/AppNavbar.vue'

</script>

<template>
    <div class="flex min-h-screen bg-gray-100">

        <AppSidebar />

        <div class="flex-1 flex flex-col">

            <AppNavbar />

            <main class="flex-1 p-6">
                <router-view />
            </main>

        </div>

    </div>
</template>