<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';

const router = useRouter();
const authStore = useAuthStore();

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
    // 1. First debug: Check if request is being sent
    console.log('Sending login request...', formData.value);

    const response = await axios.post('http://localhost:8000/api/auth/login', {
      email: formData.value.email,
      password: formData.value.password
    });

    // 2. Debug: Check server response
    console.log('Login response:', response.data);

    if (!response.data.token) {
      throw new Error('No token received');
    }

    authStore.setToken(response.data.token);
    
    // 3. Debug: Verify token is stored
    console.log('Token set, redirecting...', authStore.token);
    
    router.push('/ui/cards');
  } catch (err: any) {
    // 4. Debug: Detailed error logging
    console.error('Login error:', err);
    
    if (err.response) {
      error.value = err.response.data?.message || 
                   err.response.data?.error || 
                   'Email or password incorrect';
    } else if (err.request) {
      error.value = 'Server not responding. Check your connection.';
    } else {
      error.value = err.message || 'Login failed';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <v-alert 
      v-if="error" 
      type="error" 
      class="mb-4"
      closable
      @click:close="error = ''"
    >
      {{ error }}
    </v-alert>

    <!-- Fixed email field with proper labels -->
    <v-text-field 
      v-model="formData.email"
      label="Email address"
      variant="outlined"
      type="email"
      :disabled="loading"
      placeholder="your@email.com"
      @keyup.enter="login"
      aria-label="Email address"
      class="mb-4"
    ></v-text-field>

    <!-- Fixed password field with proper labels -->
    <v-text-field 
      v-model="formData.password"
      label="Password"
      variant="outlined"
      type="password"
      :disabled="loading"
      placeholder="Your password"
      @keyup.enter="login"
      aria-label="Password"
      class="mb-4"
    ></v-text-field>

    <v-btn 
      @click="login"
      size="large"
      color="primary"
      block
      :loading="loading"
      :disabled="loading"
    >
      {{ loading ? 'Logging in...' : 'Login' }}
    </v-btn>
  </div>
</template>