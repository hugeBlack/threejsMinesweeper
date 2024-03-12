import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory("/minesweeperDemo/"),
    routes: [
        {
            path: '/',
            name: 'login',
            component: ()=>import("@/pages/PlayPage.vue"),
        },
        // { path: '/:pathMatch(.*)*', name: 'NotFound', component: ()=>import("@/pages/ErrorPage.vue") },

    ]
})

export default router
