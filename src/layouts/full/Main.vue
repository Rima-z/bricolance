<script setup lang="ts">
import { ref, shallowRef, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import sidebarItems from './vertical-sidebar/sidebarItem';
import NavGroup from './vertical-sidebar/NavGroup/index.vue';
import NavItem from './vertical-sidebar/NavItem/index.vue';
import Logo from './logo/Logo.vue';
import { Menu2Icon } from 'vue-tabler-icons';
import NotificationDD from './vertical-header/NotificationDD.vue';
import ProfileDD from './vertical-header/ProfileDD.vue';

const authStore = useAuthStore();
const sDrawer = ref(true);

// Filtrer les éléments du menu selon l'authentification
const filteredSidebarItems = computed(() => {
  return sidebarItems.filter(item => {
    if (item.requiresAuth === undefined) return true;
    return item.requiresAuth === authStore.isAuthenticated;
  });
});

// Vérifier l'authentification au chargement
onMounted(() => {
  authStore.checkAuth();
});
</script>

<template>
  <v-navigation-drawer left v-model="sDrawer" app class="leftSidebar ml-sm-5 mt-sm-5 bg-containerBg" elevation="10"
      width="270">
      <div class="pa-5 pl-4">
          <Logo />
      </div>
      <perfect-scrollbar class="scrollnavbar bg-containerBg overflow-y-hidden">
          <v-list class="py-4 px-4 bg-containerBg">
              <template v-for="(item, i) in filteredSidebarItems" :key="item.title || item.header">
                  <NavGroup :item="item" v-if="item.header" />
                  <NavItem :item="item" v-else class="leftPadding" />
              </template>
          </v-list>
      </perfect-scrollbar>
  </v-navigation-drawer>
  
  <div class="container verticalLayout">
      <div class="maxWidth">
          <v-app-bar elevation="0" height="70">
              <div class="d-flex align-center justify-space-between w-100">
                  <div>
                      <v-btn class="hidden-lg-and-up text-muted" @click="sDrawer = !sDrawer" icon
                          variant="flat" size="small">
                          <Menu2Icon size="20" stroke-width="1.5" />
                      </v-btn>
                      <NotificationDD />
                  </div>
                  <div>
                      <ProfileDD />
                  </div>
              </div>
          </v-app-bar>
      </div>
  </div>
</template>