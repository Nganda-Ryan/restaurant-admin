<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeMount, ref } from 'vue'
import ButtonAction from '@/components/Buttons/ButtonAction.vue';
import TableOne from '@/components/Tables/TableOne.vue';
import { fetchOrder, updateOrder } from '@/services/database';
import EventBus from '@/EventBus';
import type ToastPayload from '@/types/Toast';  
import { useAuthStore } from '@/stores/auth';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const SpinnerOverPage = defineAsyncComponent(() => import('@/components/Utilities/SpinnerOverPage.vue'));

const authStore = useAuthStore();
const _token = authStore.jwt;
const restaurantCode = authStore.restaurantCode;

const isloading = ref(false);
const ORANGE = 'bg-orange-300 rounded';
const BLUE = 'bg-blue-300 rounded';
const GREEN = 'bg-green-300 rounded';
const RED = 'bg-red-300 rounded';
const NONE = 'p-[2px]';
const selectedTicket = ref<any>();
const titles = ref([
    {
        name: 'code',
        label: t('tabless.headers.code'),
        type: 'url',
        event: "view",
        filterable: true,
    },
    {
        name: 'plate',
        type: "text",
        label: t('tabless.headers.plates'),
        filterable: false,
    },
    {
        name: 'CreatedDate',
        type: "text",
        label: t('tabless.headers.date'),
        filterable: false,
    },
]);

const filterOptions = ref([
    {
        name: t('filters.all'),
        api: '',
    },
    {
        name: t('filters.today'),
        api: 'today',
    },
    {
        name: t('filters.this_week'),
        api: 'thisweek',
    },
    {
        name: t('filters.last_week'),
        api: 'lastweek',
    },
    {
        name: t('filters.this_month'),
        api: 'thismonth',
    }
]);

const tickets = ref([]);
const computedTickets = computed(() => {
  return tickets.value
})
const rawTickets = ref([]);

const fetchTicket = async () => {
  isloading.value = true;
  try {
    const result = await fetchOrder(_token, restaurantCode);
    const ticketList = result.map((ticket: any) => {
      let color = '';
      let event = 'kitchen';
      if (ticket.StatusCode == 'DRAFT'){
        color = ORANGE;
        event = 'kitchen';
      } else if(ticket.StatusCode == 'IN PROGRESS') {
        color = BLUE;
        event = 'progress';
      } else if (ticket.StatusCode == 'COMPLETED'){
        color = GREEN;
        event = 'completed';
      }else if(ticket.StatusCode == 'CANCELED') {
        color = RED;
        event = 'canceled';
      }

      return {
        code: ticket.Code,
        table: ticket.Code.split('_')[0],
        plate: `${ticket.items.length} ($${ticket.items.reduce((sum: any, item: any) => (sum + (item.Price * item.Quantity)), 0).toFixed(2)})`,
        CreatedDate: new Date(ticket.CreatedDate).toLocaleDateString(t('locale'), {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        class: color,
        event 
      }
    });

    tickets.value = ticketList;
    rawTickets.value = result;
  } catch (er) {
    console.error(t('error.fetch_tickets'), er);
    EventBus.emit('showToast', {
      type: 'error',
      message: t('error.fetch_tickets_message')
    });
  } finally {
    isloading.value = false
  }
}

const isViewing = ref(true)

const handleKitchen = async (ts: any) => {
  try {
    if(ts.event != 'kitchen') {
      isloading.value = true;
      const result = await updateOrder({
        "Code": ts.code,
        "StatusCode":"DRAFT"
      }, _token, restaurantCode);
      tickets.value.forEach((ticket: any) => {
        if (ticket.code === ts.code) {
          ticket.class = ORANGE;
          ticket.event = 'kitchen';
        }
      })
    }
    
    const payload: ToastPayload = {
        type: "info",
        message: t('messages.order_sent_to_kitchen', { code: ts.code })
    }
    EventBus.emit('showToast', payload);
  } catch (e: any) {
    console.error(t('error.kitchen_process'), e);
    const payload: ToastPayload = {
        type: "warning",
        message: t('error.general_error')
    }
    EventBus.emit('showToast', payload);
  } finally {
    isloading.value = false;
  }
}

const handleProgress = async (ts: any) => {
  try {
    if(ts.event != 'progress') {
      isloading.value = true;
      const result = await updateOrder({
        "Code": ts.code,
        "StatusCode":"IN PROGRESS"
      }, _token, restaurantCode);
      tickets.value.forEach((ticket: any) => {
        if (ticket.code === ts.code) {
          ticket.class = BLUE;
          ticket.event = 'progress';
        }
      })
    }
    
    const payload: ToastPayload = {
        type: "info",
        message: t('messages.order_processed', { code: ts.code })
    }
    EventBus.emit('showToast', payload);
  } catch (e: any) {
    console.error(t('error.progress_process'), e);
    const payload: ToastPayload = {
        type: "warning",
        message: t('error.general_error')
    }
    EventBus.emit('showToast', payload);
  } finally {
    isloading.value = false;
  }
}

const handleCompleted = async (ts: any) => {
  try {
    if(ts.event != 'completed') {
      isloading.value = true;
      const result = await updateOrder({
        "Code": ts.code,
        "StatusCode":"COMPLETED"
      }, _token, restaurantCode);
      tickets.value.forEach((ticket: any) => {
        if (ticket.code === ts.code) {
          ticket.class = GREEN;
          ticket.event = 'completed';
        }
      })
    }
    
    const payload: ToastPayload = {
        type: "success",
        message: t('messages.order_completed', { code: ts.code })
    }
    EventBus.emit('showToast', payload);
  } catch (e: any) {
    console.error(t('error.complete_process'), e);
    const payload: ToastPayload = {
        type: "warning",
        message: t('error.general_error')
    }
    EventBus.emit('showToast', payload);
  } finally {
    isloading.value = false;
  }
}

const handleCanceled = async (ts: any) => {
  try {
    if(ts.event != 'canceled') {
      isloading.value = true;
      const result = await updateOrder({
        "Code": ts.code,
        "StatusCode":"CANCELED"
      }, _token, restaurantCode);
      tickets.value.forEach((ticket: any) => {
        if (ticket.code === ts.code) {
          ticket.class = RED;
          ticket.event = 'canceled';
        }
      })
    }
    
    const payload: ToastPayload = {
        type: "success",
        message: t('messages.order_canceled', { code: ts.code })
    }
    EventBus.emit('showToast', payload);
  } catch (e: any) {
    console.error(t('error.cancel_process'), e);
    const payload: ToastPayload = {
        type: "warning",
        message: t('error.general_error')
    }
    EventBus.emit('showToast', payload);
  } finally {
    isloading.value = false;
  }
}

onBeforeMount(async () => {
  isloading.value = true
  await fetchTicket();
});

const cancel = (payload: any) => {
  isViewing.value = true;
  location.reload()
}

const viewTicket = (ts: any) => {
  isViewing.value = true;
  selectedTicket.value = rawTickets.value.filter((item:any) => item.Code == ts.code)[0];
  window.location.href = `/tickets/${selectedTicket.value.Code}/view`
}
</script>

<template>
  <div>
    <div class="flex flex-col gap-10" v-if="isViewing">
      <TableOne 
        @view="viewTicket" 
        :items="titles" 
        :datas="computedTickets" 
        :options="filterOptions" 
        @kitchen="handleKitchen" 
        @progress="handleProgress" 
        @completed="handleCompleted" 
        @canceled="handleCanceled" 
        :filterable="true" 
        :pagination="true"
      />
    </div>
    <SpinnerOverPage v-if="isloading" />
  </div>
</template>