import { API_GATEWAY } from "../utils/api";
const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || API_GATEWAY;
export default API_BASE_URL;
