<script setup lang="ts">
import { ref, computed } from 'vue';
import { productsCard } from '@/data/dashboard/dashboardData';

// Références pour les filtres
const selectedCategory = ref('');
const searchQuery = ref('');

// Liste des catégories disponibles
const categories = computed(() => {
  return [...new Set(productsCard.map(product => product.category))];
});

// Produits filtrés
const filteredProducts = computed(() => {
  return productsCard.filter(product => {
    const matchesCategory = selectedCategory.value ? product.category === selectedCategory.value : true;
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchesCategory && matchesSearch;
  });
});
</script>

<template>
  <v-row>
    <!-- Filtres -->
    <v-col cols="12">
      <v-row>
        <v-col cols="12" sm="6">
          <v-select
            v-model="selectedCategory"
            :items="categories"
            label="Filtrer par catégorie"
            clearable
          ></v-select>
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="searchQuery"
            label="Rechercher par nom"
            clearable
          ></v-text-field>
        </v-col>
      </v-row>
    </v-col>

    <!-- Liste des produits filtrés -->
    <v-col cols="12" lg="3" sm="6" v-for="card in filteredProducts" :key="card.title">
      <v-card elevation="10" class="withbg">
        <RouterLink :to="card.link">
          <v-img :src="card.photo" height="100%" class="rounded-t-md"></v-img>
        </RouterLink>
        <div class="d-flex justify-end mr-4 mt-n5">
          <v-btn size="30" icon class="bg-primary d-flex">
            <v-avatar size="20" class="text-surface">
              <BasketIcon size="15" />
            </v-avatar>
            <v-tooltip activator="parent" location="bottom">Add To Cart</v-tooltip>
          </v-btn>
        </div>
        <v-card-item class="pt-0">
          <h6 class="text-h6" v-text="card.title"></h6>
          <div class="d-flex align-center justify-space-between mt-1">
            <div>
              <span class="text-h6" v-text="'$'+ card.price"></span>
              <span class="text-body-1 ml-2 text-medium-emphasis text-decoration-line-through" v-text="'$'+ card.salesPrice"></span>
            </div>
            <v-rating density="compact" color="warning" size="small" v-model="card.rating" readonly></v-rating>
          </div>
        </v-card-item>
      </v-card>
    </v-col>
  </v-row>
</template>