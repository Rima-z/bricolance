<script setup lang="ts">
import { ref } from 'vue';
import { CircleIcon } from 'vue-tabler-icons';
import { recentTransaction } from '@/data/dashboard/dashboardData';

// Données du profil (exemple)
const profile = ref({
  name: 'John Doe',
  email: 'john.doe@example.com',
  bio: 'Développeur passionné par Vue.js et les nouvelles technologies.',
  profilePicture: null as File | null, // Pour stocker la photo de profil
});

// Fonction pour gérer la soumission du formulaire
const submitForm = () => {
  console.log('Profil mis à jour :', profile.value);
  // Ici, vous pouvez ajouter la logique pour envoyer les données à un backend
};

// Fonction pour gérer le téléchargement de la photo de profil
const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    profile.value.profilePicture = target.files[0];
  }
};
</script>

<template>
  <v-card elevation="10"> <!-- Suppression de la classe withbg -->
    <v-card-item class="pb-0">
      <v-card-title class="text-h5 pt-sm-2">Mon Profil</v-card-title>
      <div class="recent-transaction mt-10 px-3">
        <!-- Formulaire de modification de profil -->
        <v-form @submit.prevent="submitForm">
          <!-- Photo de profil -->
          <v-row>
            <v-col cols="12" class="d-flex justify-center">
              <v-avatar size="120" class="mb-4">
                <v-img
                  v-if="profile.profilePicture"
                  :src="URL.createObjectURL(profile.profilePicture)"
                  alt="Photo de profil"
                />
                <v-icon v-else size="120" color="grey">mdi-account-circle</v-icon>
              </v-avatar>
            </v-col>
            <v-col cols="12" class="d-flex justify-center">
              <v-file-input
                label="Changer la photo de profil"
                accept="image/*"
                prepend-icon="mdi-camera"
                @change="handleFileUpload"
                hide-details
              ></v-file-input>
            </v-col>
          </v-row>

          <!-- Nom -->
          <v-text-field
            v-model="profile.name"
            label="Nom"
            outlined
            dense
            class="mt-4"
          ></v-text-field>

          <!-- Email -->
          <v-text-field
            v-model="profile.email"
            label="Email"
            outlined
            dense
            type="email"
          ></v-text-field>

          <!-- Bio -->
          <v-textarea
            v-model="profile.bio"
            label="Bio"
            outlined
            dense
            rows="3"
          ></v-textarea>

          <!-- Bouton de soumission -->
          <v-btn type="submit" color="primary" class="mt-4">
            Enregistrer les modifications
          </v-btn>
        </v-form>
      </div>
    </v-card-item>
  </v-card>
</template>

<style lang="scss">
.v-avatar {
  border: 2px solid #ddd;
}

.v-file-input {
  max-width: 300px;
}

.recent-transaction {
  .line {
    width: 2px;
    height: 35px;
  }
}
</style>