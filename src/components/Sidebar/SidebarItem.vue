<script setup lang="ts">
import { useSidebarStore } from '@/stores/sidebar'
import { useRoute, useRouter } from 'vue-router'
import SidebarDropdown from './SidebarDropdown.vue'
import { useAuthStore } from '@/stores/auth'

const sidebarStore = useSidebarStore()
const authStore = useAuthStore()

const props = defineProps(['item', 'index'])
const currentPage = useRoute().name;
const router = useRouter();

interface SidebarItem {
  label: string
}

const handleItemClick = () => {
  const pageName = props.item.label
  sidebarStore.page = pageName
  // router.push(`${window.location.origin}${props.item.route}`);

  if (props.item.children) {
    return props.item.children.some((child: SidebarItem) => sidebarStore.selected === child.label)
  }
}
</script>

<template>
  <li class="">
    <router-link
      :to="item.route"
      class="group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-olive-900"
      @click.prevent="handleItemClick"
      :class="{
        'bg-olive-900 bg-opacity-90 dark:bg-meta-4': sidebarStore.page === item.label
      }"
    >
      <span v-html="item.icon"></span>

      {{ item.label }}

      <svg
        v-if="item.children"
        class="absolute right-4 top-1/2 -translate-y-1/2 fill-current"
        :class="{ 'rotate-180': sidebarStore.page === item.label }"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
          fill=""
        />
      </svg>
    </router-link>

    <!-- Dropdown Menu Start -->
    <div class="translate transform overflow-hidden" v-show="sidebarStore.page === item.label">
      <SidebarDropdown
        v-if="item.children"
        :items="item.children"
        :currentPage="currentPage"
        :page="item.label"
      />
      <!-- Dropdown Menu End -->
    </div>
  </li>
  
</template>
