const BASE_URL = process.env.PUBLIC_API_URL;

interface SendServerRequestProps {
   method: string;
   url: string;
   body?: Record<string, any> | FormData;
}

async function request<T>(config: SendServerRequestProps): Promise<T> {
   const isGet = config.method.toLowerCase() === 'get';
   const isFormData = config.body instanceof FormData;

   let url = `${BASE_URL}${config.url}`;
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

   if (!response.ok) throw { status: response.status, ...(await response.json().catch(() => ({}))) };

   const jsonResponse = await response.json();
   return jsonResponse.payload;
}

export default async function sendServerRequest<T>(config: SendServerRequestProps): Promise<T> {
   try {
      return await request(config);
   } catch (error: any) {
      const skipRefresh = config.url === '/auth/login' || config.url === '/auth/register';
      if (error.status === 401 && !skipRefresh) {
         console.warn('accessToken rejected, requesting new accessToken');
         await request({ method: 'POST', url: 'authentication/refresh' });
         return await request(config);
      }

      throw error;
   }
}