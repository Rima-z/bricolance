<script setup lang="ts">
import { ref } from "vue";

import UiChildCard from '@/components/shared/UiChildCard.vue';

import CardsProps from "@/components/ui-components/cards/CardsProps.vue";
import CardsSlots from "@/components/ui-components/cards/CardsSlots.vue";
import CardsContentWrap from "@/components/ui-components/cards/CardsContentWrap.vue";
import CardsMedia from "@/components/ui-components/cards/CardsMedia.vue";
import CardsWeather from "@/components/ui-components/cards/CardsWeather.vue";
import CardsTwitter from "@/components/ui-components/cards/CardsTwitter.vue";
</script>

<template>
  <v-row>
    <v-col cols="12" sm="12" lg="12">
      <UiChildCard title="Catégories disponibles">
        <CardsProps />
      </UiChildCard>
    </v-col>
   
   

  </v-row>
</template>
