<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const loading = ref(false);
const error = ref('');
const success = ref('');

const profile = ref({
  id: null,
  nom: '',
  prenom: '',
  email: '',
  num_tlf: '',
  region: '',
  adresse: ''
});

const fetchProfile = async () => {
  try {
    const response = await axios.get('http://localhost:8000/api/auth/me', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`
      }
    });

    if (response.data.client) {
      const client = response.data.client;
      profile.value = {
        id: client.id,
        nom: client.nom,
        prenom: client.prenom,
        email: client.email,
        num_tlf: client.num_tlf,
        region: client.region,
        adresse: client.adresse
      };
    }
  } catch (err) {
    error.value = 'Erreur lors du chargement du profil';
    console.error('Erreur fetchProfile:', err);
  }
};

const updateProfile = async () => {
  if (!profile.value.id) {
    error.value = "ID client manquant";
    return;
  }

  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    const response = await axios.put(
      `http://localhost:8000/api/clients/${profile.value.id}`,
      profile.value,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    success.value = 'Profil mis à jour avec succès';
    await fetchProfile();
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      error.value = err.response.data.message || 'Erreur lors de la mise à jour';
      if (err.response.data.errors) {
        error.value += ': ' + Object.values(err.response.data.errors).join(', ');
      }
    } else {
      error.value = 'Erreur de connexion au serveur';
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchProfile();
});
</script>

<template>
  <v-card elevation="10">
    <v-card-item class="pb-0">
      <v-card-title class="text-h5 pt-sm-2">Mon Profil</v-card-title>
      
      <div class="recent-transaction mt-10 px-3">
        <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
        <v-alert v-if="success" type="success" class="mb-4">{{ success }}</v-alert>

        <v-form @submit.prevent="updateProfile">
          <v-text-field
            v-model="profile.nom"
            label="Nom"
            outlined
            dense
            class="mt-4"
            required
          ></v-text-field>

          <v-text-field
            v-model="profile.prenom"
            label="Prénom"
            outlined
            dense
            required
          ></v-text-field>

          <v-text-field
            v-model="profile.email"
            label="Email"
            outlined
            dense
            type="email"
            required
          ></v-text-field>

          <v-text-field
            v-model="profile.num_tlf"
            label="Téléphone"
            outlined
            dense
          ></v-text-field>

          <v-text-field
            v-model="profile.region"
            label="Région"
            outlined
            dense
          ></v-text-field>

          <v-textarea
            v-model="profile.adresse"
            label="Adresse"
            outlined
            dense
            rows="2"
          ></v-textarea>

          <v-btn 
            type="submit" 
            color="primary" 
            class="mt-4"
            :loading="loading"
          >
            Enregistrer
          </v-btn>
        </v-form>
      </div>
    </v-card-item>
  </v-card>
</template>

<style lang="scss">
/* Styles simplifiés */
.v-card {
  max-width: 800px;
  margin: 0 auto;
}
</style>