<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();

const formData = ref({
    email: '',
    password: ''
});

const loading = ref(false);
const error = ref('');

const login = async () => {
    loading.value = true;
    error.value = '';
    
    try {
        const response = await axios.post('http://localhost:8000/api/auth/login', {
            email: formData.value.email,
            password: formData.value.password
        });
        
        // Stocker le token
        localStorage.setItem('auth_token', response.data.token);
        
        // Rediriger vers /ui/cards au lieu de '/'
        router.push('/ui/cards');
    } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
            error.value = err.response.data.error || 'Email ou mot de passe incorrect';
        } else {
            error.value = 'Erreur de connexion au serveur';
        }
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="d-flex align-center text-center mb-6">
        <div class="text-h6 w-100 px-5 font-weight-regular auth-divider position-relative">
            <span class="bg-surface px-5 py-3 position-relative text-subtitle-1 text-grey100">Your Social Campaigns</span>
        </div>
    </div>
    <div>
        <v-row class="mb-3">
            <v-col cols="12">
                <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
                <v-label class="font-weight-medium mb-1">Email</v-label>
                <v-text-field 
                    v-model="formData.email" 
                    variant="outlined" 
                    class="pwdInput" 
                    hide-details 
                    color="primary"
                    type="email"
                ></v-text-field>
            </v-col>
            <v-col cols="12">
                <v-label class="font-weight-medium mb-1">Password</v-label>
                <v-text-field 
                    v-model="formData.password" 
                    variant="outlined" 
                    class="border-borderColor" 
                    type="password" 
                    hide-details
                    color="primary"
                ></v-text-field>
            </v-col>
            <v-col cols="12 " class="py-0">
                <div class="d-flex flex-wrap align-center w-100 ">
                    <v-checkbox hide-details color="primary">
                        <template v-slot:label class="">Remember this Device</template>
                    </v-checkbox>
                    <div class="ml-sm-auto">
                        <RouterLink to=""
                            class="text-primary text-decoration-none text-body-1 opacity-1 font-weight-medium">
                            Forgot Password ?</RouterLink>
                    </div>
                </div>
            </v-col>
            <v-col cols="12">
                <v-btn 
                    @click="login"
                    size="large" 
                    rounded="pill" 
                    color="primary" 
                    class="rounded-pill" 
                    block 
                    :loading="loading"
                    flat
                >
                    Sign In
                </v-btn>
            </v-col>
        </v-row>
    </div>
</template>