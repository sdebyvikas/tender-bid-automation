import axios from "axios";
import { store } from "../redux/store";
import { setUserData } from "../redux/user.slice";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  withCredentials: true
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Session expired or unauthorized. Resetting user state.");
      store.dispatch(setUserData(null));
    }
    return Promise.reject(error);
  }
);

export default api;