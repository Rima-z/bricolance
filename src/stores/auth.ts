import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();
  const isAuthenticated = ref(false);
  const user = ref(null);
  const token = ref(localStorage.getItem('auth_token') || null);

  function setToken(newToken: string) {
    token.value = newToken;
    localStorage.setItem('auth_token', newToken);
    isAuthenticated.value = true;
  }

  async function checkAuth() {
    if (!token.value) {
      isAuthenticated.value = false;
      return false;
    }

    try {
      const response = await axios.get('http://localhost:8000/api/auth/me', {
        headers: { Authorization: `Bearer ${token.value}` }
      });
      isAuthenticated.value = true;
      user.value = response.data.user;
      return true;
    } catch (error) {
      logout();
      return false;
    }
  }

  function logout() {
    localStorage.removeItem('auth_token');
    token.value = null;
    isAuthenticated.value = false;
    user.value = null;
    router.push('/auth/login');
  }

  return { token, isAuthenticated, user, setToken, checkAuth, logout };
});