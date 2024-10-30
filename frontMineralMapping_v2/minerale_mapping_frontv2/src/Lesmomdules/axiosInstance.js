import axios from 'axios';

// Créer une instance Axios personnalisée
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000',
  // Autres options de configuration...
});

// Configurer withCredentials
axiosInstance.defaults.withCredentials = true;

export default axiosInstance;
