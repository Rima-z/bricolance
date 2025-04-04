<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

interface Categorie {
  id: number
  nom: string
}

interface SousCategorie {
  id: number
  nom: string
  categorie_id: number
}

const categories = ref<Categorie[]>([])
const sousCategories = ref<Record<number, SousCategorie[]>>({}) // Stockage par ID de catégorie
const selectedCategoryId = ref<number | null>(null)
const loading = ref(true)
const categoriesLoading = ref(true)
const sousCategoriesLoading = ref(false)
const error = ref(null)

// Fonction pour récupérer les catégories depuis l'API
const fetchCategories = async () => {
  categoriesLoading.value = true
  try {
    const response = await axios.get('http://localhost:8000/api/categories')
    categories.value = response.data
    categoriesLoading.value = false
  } catch (err) {
    error.value = err.message || 'Erreur lors du chargement des catégories'
    categoriesLoading.value = false
  }
}

// Fonction pour récupérer les sous-catégories d'une catégorie
const fetchSousCategories = async (categoryId: number) => {
  selectedCategoryId.value = categoryId
  sousCategoriesLoading.value = true
  
  // Si on a déjà chargé les sous-catégories pour cette catégorie, ne pas recharger
  if (sousCategories.value[categoryId]) {
    sousCategoriesLoading.value = false
    return
  }

  try {
    const response = await axios.get(`http://localhost:8000/api/souscategories`, {
      params: {
        categorie_id: categoryId
      }
    })
    // Stocker les sous-catégories avec l'ID de catégorie comme clé
    sousCategories.value = {
      ...sousCategories.value,
      [categoryId]: response.data
    }
  } catch (err) {
    error.value = err.message || 'Erreur lors du chargement des sous-catégories'
  } finally {
    sousCategoriesLoading.value = false
  }
}

// Charger les catégories au montage du composant
onMounted(() => {
  fetchCategories()
})
</script>

<template>
  <div class="main-container">
    <!-- Section des catégories -->
    <div class="categories-section">
      <div v-if="categoriesLoading" class="text-center py-4">
        Chargement des catégories...
      </div>
      
      <div v-if="error" class="text-center text-red py-4">
        {{ error }}
      </div>
      
      <div v-if="!categoriesLoading && !error" class="categories-container">
        <v-card
          v-for="categorie in categories"
          :key="categorie.id"
          elevation="2"
          class="mb-4 category-card"
          :class="{ 'selected': categorie.id === selectedCategoryId }"
          @click="fetchSousCategories(categorie.id)"
        >
          <v-card-title>{{ categorie.nom }}</v-card-title>
          <v-card-subtitle>ID: {{ categorie.id }}</v-card-subtitle>
        </v-card>
        
        <div v-if="categories.length === 0" class="text-center py-4">
          Aucune catégorie disponible
        </div>
      </div>
    </div>

    <!-- Section des sous-catégories -->
    <div class="sous-categories-section">
      <div v-if="sousCategoriesLoading" class="text-center py-4">
        Chargement des sous-catégories...
      </div>
      
      <div v-if="!sousCategoriesLoading && selectedCategoryId">
        <h3 class="text-h6 mb-4">Sous-catégories</h3>
        <template v-if="sousCategories[selectedCategoryId]">
          <v-card
            v-for="sousCategorie in sousCategories[selectedCategoryId]"
            :key="sousCategorie.id"
            elevation="2"
            class="mb-4"
          >
            <v-card-title>{{ sousCategorie.nom }}</v-card-title>
            <v-card-subtitle>ID: {{ sousCategorie.id }}</v-card-subtitle>
          </v-card>
          
          <div v-if="sousCategories[selectedCategoryId].length === 0" class="text-center py-4">
            Aucune sous-catégorie disponible pour cette catégorie
          </div>
        </template>
      </div>
      
      <div v-if="!selectedCategoryId" class="text-center py-4">
        Sélectionnez une catégorie pour voir ses sous-catégories
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-container {
  display: flex;
  gap: 24px;
  padding: 16px;
}

.categories-section {
  flex: 1;
}

.sous-categories-section {
  flex: 1;
  border-left: 1px solid #e0e0e0;
  padding-left: 24px;
}

.categories-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.category-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-card:hover {
  background-color: #f5f5f5;
}

.category-card.selected {
  background-color: #e3f2fd;
  border-left: 4px solid #1976d2;
}
</style>