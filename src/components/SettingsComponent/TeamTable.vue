<template>
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="member in members" :key="member.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="text-sm font-medium text-gray-900">{{ member.name }}</div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ member.email }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ member.role }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="statusClasses(member.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                {{ member.status === 'active' ? 'Actif' : 'Inactif' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button @click="$emit('edit', member.id)" class="text-olive-600 hover:text-olive-900 mr-3">Éditer</button>
              <button @click="$emit('remove', member.id)" class="text-red-600 hover:text-red-900">Supprimer</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script setup>
  defineProps({
    members: Array
  })
  
  defineEmits(['edit', 'remove'])
  
  function statusClasses(status) {
    return {
      'bg-green-100 text-green-800': status === 'active',
      'bg-red-100 text-red-800': status === 'inactive'
    }
  }
  </script>