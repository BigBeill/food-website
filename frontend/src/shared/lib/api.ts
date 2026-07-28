import { ErrorNotFound, ErrorUnauthorized } from "./errorClasses";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface SendServerRequestProps {
   method: string;
   url: string;
   body?: Record<string, any> | FormData;
}

async function request<T>(config: SendServerRequestProps): Promise<T> {
   const isGet = config.method.toLowerCase() === 'get';
   const isFormData = config.body instanceof FormData;

   let url = `${BASE_URL}/api/v1${config.url}`;
   if (isGet && config.body && !isFormData) {
      const query = new URLSearchParams(
         Object.entries(config.body).filter(([_, v]) => v != null)
      ).toString();
      if (query) url += `?${query}`;
   }

   const options: RequestInit = {
      method: config.method,
      credentials: 'include',
   };

   if (!isFormData) {
      options.headers = { 'Content-Type': 'application/json' };
   }

   if (!isGet && config.body) {
      if (config.body instanceof FormData) {
         options.body = config.body;
      } 
      else {
         options.body = JSON.stringify(config.body);
      }
   }
   const response = await fetch(url, options);

   if (response.status === 204) { return undefined as T };


   if (!response.ok) { 
      if (response.status === 401) { throw new ErrorUnauthorized(); }
      else if (response.status === 404) { throw new ErrorNotFound(); }
      else { 
         const responseContent = await response.json().catch(() => ({}))
         console.error("error response from server received:", responseContent );
         throw new Error(responseContent?.error?.message ?? responseContent?.message ?? 'Request failed');
      }
   }

   const jsonResponse = await response.json();
   console.log("Response from server received:", jsonResponse);
   return jsonResponse.data;
}

export default async function sendServerRequest<T>(config: SendServerRequestProps): Promise<T> {
   try {
      return await request<T>(config);
   } catch (error: any) {
      const skipRefresh = config.url === '/auth/login' || config.url === '/auth/register';
      if (error instanceof ErrorUnauthorized || skipRefresh) {
         console.warn('accessToken rejected, requesting new accessToken');
         await request<T>({ method: 'POST', url: '/auth/refresh' });
         return await request<T>(config);
      }
      throw error
   }
} 