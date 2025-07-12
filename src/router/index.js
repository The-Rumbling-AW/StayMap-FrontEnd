import {createRouter, createWebHistory} from "vue-router";
import CommunityManagementComponent from "@/community/pages/community-management.component.vue";
import ConcertManagementComponent from "@/concerts/pages/concert-management.component.vue";
import LoginManamegent from "@/users/pages/login-manamegent.vue";
import RegisterManagement from "@/users/pages/register-management.vue";
import ConcertMapComponent from "@/concerts/pages/concert-map-component.vue";
import ProfileManagement from "@/users/pages/profile-management.vue";
import CommunityDetailsComponent from "@/community/pages/community-details.component.vue";
import SignIn from '../iam/pages/sign-in.component.vue'
import SignUp from '../iam/pages/sign-up.component.vue'

const routes = [

    {   path: '/communities', name: 'communities', component: CommunityManagementComponent, meta: {title: 'Communities'}},
    {  path: '/',                      name: 'default',    redirect: {name: 'concerts'}},

    { path: '/concerts', name: 'concerts', component: ConcertManagementComponent, meta: {title: 'Concerts'}},
    //{ path: '/login', name: 'login', component: LoginManamegent, meta: { title: 'Login' } },
   // { path: '/register', name: 'register', component: RegisterManagement, meta: { title: 'Register' } },
    {   path: '/sign-in',               name: 'sign-in',    component: SignIn,             meta: { title: 'Sign-In' } },
    {   path: '/sign-up',               name: 'sign-up',    component: SignUp,             meta: { title: 'Sign-Up' } },
    { path: '/concerts-map', name: 'concerts-map', component: ConcertMapComponent, meta: {title: 'Concerts Map'} },
    { path: '/profile', name: 'profile', component: ProfileManagement, meta: {title: 'Profile'} },
    {path: '/concerts/:id', name: 'ConcertDetails', component: () => import('@/concerts/pages/concert-page-details.component.vue')},
    {path: '/communities/:id', name: 'CommunityDetails', component: CommunityDetailsComponent, meta: {title: 'Community Details'}},


]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routes,

});

router.beforeEach((to, from, next) => {
    console.log(`Navigating from ${from.name} to ${to.name}`);
    // Set the page title
    let baseTitle = 'StayMap';
    document.title = `${baseTitle} | ${to.meta['title']}`;
    next();
});

export default router;