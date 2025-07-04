<template>
    <canvas ref="chartCanvas"></canvas>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue'
  import Chart from 'chart.js/auto'
  
  const props = defineProps({
    chartData: Object
  })
  
  const chartCanvas = ref(null)
  let chartInstance = null
  
  onMounted(() => {
    renderChart()
  })
  
  watch(() => props.chartData, () => {
    if (chartInstance) {
      chartInstance.destroy()
    }
    renderChart()
  }, { deep: true })
  
  function renderChart() {
    if (chartCanvas.value) {
      chartInstance = new Chart(chartCanvas.value, {
        type: 'line',
        data: props.chartData,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      })
    }
  }
  </script>