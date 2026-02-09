<script setup lang="ts">
import BalanceComponent from '@/components/HomeApp/BalanceComponent.vue';
import CardComponent from '@/components/HomeApp/CardComponent.vue';
import TopNav from '@/components/TopNav.vue';


const getCurrentDayOfWeek = (): number => {
  const today = new Date();
  const day = today.getDay(); 
  return day === 0 ? 6 : day - 1;
};


</script>


<template>

<TopNav></TopNav>

<CardComponent></CardComponent>
<BalanceComponent
:weekly-budget="160"
:current-week-expenses="80"
:today-day-of-week="5"
></BalanceComponent>


</template>