<script setup lang="ts">
  import { computed, defineAsyncComponent, onBeforeMount, ref } from 'vue'
  import ButtonAction from '@/components/Buttons/ButtonAction.vue';
  import TableOne from '@/components/Tables/TableOne.vue';
  import { fetchOrder, updateOrder } from '@/services/database';
  import EventBus from '@/EventBus';
  import type ToastPayload from '@/types/Toast';  
  import { useAuthStore } from '@/stores/auth';

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
          label: 'Code',
          type: 'url',
          event: "view",
          filterable: true,
      },
      {
          name: 'plate',
          type: "text",
          label: 'Plate(s)',
          filterable: false,
      },
      {
          name: 'CreatedDate',
          type: "text",
          label: 'Date',
          filterable: false,
      },
/*       {
          name: 'Actions',
          type: 'action',
          label: 'Actions',
          colored: true,
          actions: [
            {
                name: "CANCELED",
                icone: `
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5">
                    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                  </svg>
                `,
                event: 'canceled',
                color: RED,
              },
              {
                  name: "IN KITCHEN",
                  icone: 
                  `
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5">
                      <path d="M5.75 3a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V3.75A.75.75 0 0 0 7.25 3h-1.5ZM12.75 3a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V3.75a.75.75 0 0 0-.75-.75h-1.5Z" />
                    </svg>
                  ` 
                  ,
                  event: 'kitchen',
                  color: ORANGE,
              },
              {
                  name: "IN PROGRESS",
                  icone: `
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5">
                      <path fill-rule="evenodd" d="M13.5 4.938a7 7 0 1 1-9.006 1.737c.202-.257.59-.218.793.039.278.352.594.672.943.954.332.269.786-.049.773-.476a5.977 5.977 0 0 1 .572-2.759 6.026 6.026 0 0 1 2.486-2.665c.247-.14.55-.016.677.238A6.967 6.967 0 0 0 13.5 4.938ZM14 12a4 4 0 0 1-4 4c-1.913 0-3.52-1.398-3.91-3.182-.093-.429.44-.643.814-.413a4.043 4.043 0 0 0 1.601.564c.303.038.531-.24.51-.544a5.975 5.975 0 0 1 1.315-4.192.447.447 0 0 1 .431-.16A4.001 4.001 0 0 1 14 12Z" clip-rule="evenodd" />
                    </svg>
                  `,
                  event: 'progress',
                  color: BLUE,
              },
              {
                name: "COMPLETED",
                icone: `
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5">
                    <path d="M15.98 1.804a1 1 0 0 0-1.96 0l-.24 1.192a1 1 0 0 1-.784.785l-1.192.238a1 1 0 0 0 0 1.962l1.192.238a1 1 0 0 1 .785.785l.238 1.192a1 1 0 0 0 1.962 0l.238-1.192a1 1 0 0 1 .785-.785l1.192-.238a1 1 0 0 0 0-1.962l-1.192-.238a1 1 0 0 1-.785-.785l-.238-1.192ZM6.949 5.684a1 1 0 0 0-1.898 0l-.683 2.051a1 1 0 0 1-.633.633l-2.051.683a1 1 0 0 0 0 1.898l2.051.684a1 1 0 0 1 .633.632l.683 2.051a1 1 0 0 0 1.898 0l.683-2.051a1 1 0 0 1 .633-.633l2.051-.683a1 1 0 0 0 0-1.898l-2.051-.683a1 1 0 0 1-.633-.633L6.95 5.684ZM13.949 13.684a1 1 0 0 0-1.898 0l-.184.551a1 1 0 0 1-.632.633l-.551.183a1 1 0 0 0 0 1.898l.551.183a1 1 0 0 1 .633.633l.183.551a1 1 0 0 0 1.898 0l.184-.551a1 1 0 0 1 .632-.633l.551-.183a1 1 0 0 0 0-1.898l-.551-.184a1 1 0 0 1-.633-.632l-.183-.551Z" />
                  </svg>
                `,
                event: 'completed',
                color: GREEN,
              }
          ]
      } */
  ]);
  const filterOptions = ref([
      {
          name: 'All',
          api: '',
      },
      {
          name: 'Today',
          api: 'today',
      },
      {
          name: 'This week',
          api: 'thisweek',
      },
      {
          name: 'Last Week',
          api: 'lastweek',
      },
      {
          name: 'This Month',
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
          CreatedDate: new Date(ticket.CreatedDate).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',  hour: '2-digit',
            minute: '2-digit'
          }),
          class: color,
          event 
        }
      });

      tickets.value = ticketList;
      rawTickets.value = result;
      console.log("result", result)
    } catch (er) {
      console.log('error', er);
    } finally {
      isloading.value = false
    }
  }

  const isViewing = ref(true)

  const handleKitchen = async (ts: any) => {
    try {
      if(ts.event != 'kitchen') {
        isloading.value = true;
        const result  = await updateOrder({
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
          message: `Order ${ts.code} sent in kitchen sucessfully`
      }
      EventBus.emit('showToast', payload);
      console.log('handleKitchen ts', ts);
    } catch (e: any) {
      console.error('Error while handling kitchen:', e);
      const payload: ToastPayload = {
          type: "warning",
          message: `Something went wrong during the process !`
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
        const result  = await updateOrder({
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
          message: `Order ${ts.code} sucessfully processed`
      }
      EventBus.emit('showToast', payload);
      console.log('handleKitchen ts', ts);
    } catch (e: any) {
      console.error('Error while handling kitchen:', e);
      const payload: ToastPayload = {
          type: "warning",
          message: `Something went wrong during the process !`
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
        const result  = await updateOrder({
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
          message: `Order ${ts.code} completed !`
      }
      EventBus.emit('showToast', payload);
      console.log('handleKitchen ts', ts);
    } catch (e: any) {
      console.error('Error while handling kitchen:', e);
      const payload: ToastPayload = {
          type: "warning",
          message: `Something went wrong during the process !`
      }
      EventBus.emit('showToast', payload);
    } finally {
      isloading.value = false;
    }
    console.log('handleCompleted ts', ts)
  }

  const handleCanceled = async (ts: any) => {
    try {
      if(ts.event != 'canceled') {
        isloading.value = true;
        const result  = await updateOrder({
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
          message: `Order ${ts.code} canceled !`
      }
      EventBus.emit('showToast', payload);
      console.log('handleKitchen ts', ts);
    } catch (e: any) {
      console.error('Error while handling kitchen:', e);
      const payload: ToastPayload = {
          type: "warning",
          message: `Something went wrong during the process !`
      }
      EventBus.emit('showToast', payload);
    } finally {
      isloading.value = false;
    }
    console.log('handleCanceled ts', ts)
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
    console.log('view', ts)
    isViewing.value = true;
    selectedTicket.value = rawTickets.value.filter((item:any) => item.Code == ts.code)[0];
    console.log("selectedTicket", `/tickets/${selectedTicket.value.Code}/view`)
    window.location.href = `/tickets/${selectedTicket.value.Code}/view`
  }

</script>

<template>
  <div>
    <div class="flex flex-col gap-10" v-if="isViewing">
        <TableOne @view="viewTicket" :items="titles" :datas="computedTickets" :options="filterOptions" @kitchen="handleKitchen" @progress="handleProgress" @completed="handleCompleted" @canceled="handleCanceled" :filterable="true" :pagination="true">
        </TableOne>
    </div>
    <SpinnerOverPage v-if="isloading" />
  </div>
</template>
