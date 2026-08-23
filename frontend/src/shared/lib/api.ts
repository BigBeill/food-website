import { ErrorNotFound, ErrorUnauthorized } from "./errorClasses";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface SendServerRequestProps {
   method: string;
   url: string;
   body?: Record<string, any> | FormData;
}

async function request<T>(config: SendServerRequestProps): Promise<T> {

   // check what type of request is being made (is it a get request and/or send information as formData)
   const noBodyRequestTypes = new Set(['get', 'head', 'delete']);
   const hasBody = !noBodyRequestTypes.has(config.method.toLocaleLowerCase());
   const body = config.body;
   const isFormData = body instanceof FormData;

   let url = `${BASE_URL}${config.url}`;
   // attach the body to the url for get requests
   if (!hasBody && config.body && !isFormData) {
      const query = new URLSearchParams(
         Object.entries(config.body)
            .filter(([, value]) => value != null)
            .map(([key, value]) => [key, String(value)])
      ).toString();
      if (query) { url += `?${query}`; }
   }

   // apply API request options
   const options: RequestInit = {
      method: config.method,
      credentials: 'include',
   };
   if (!isFormData) {
      options.headers = { 'Content-Type': 'application/json' };
   }

   // configure the body for non get requests
   if (hasBody && body) {
      options.body = isFormData ? body : JSON.stringify(body)
   }

   // make the actual API request
   const response = await fetch(url, options);

   // check ir response was 204 and return nothing
   if (response.status === 204) { return undefined as T };

   //check if the request failed for any reason and set errors
   if (!response.ok) {
      const responseContent = await response.json().catch(() => ({}));
      console.warn(`API request {${config.url}} ran into an error:`, responseContent );
      
      if (response.status === 401) { throw new ErrorUnauthorized(responseContent.error.message); }
      else if (response.status === 404) { throw new ErrorNotFound(); }
      else { throw new Error('Request failed for unknown reasons'); }
   }

   // if nothing went wrong return the content of the response
   const jsonResponse = await response.json();
   console.log(`API request ${config.url} received a response:`, jsonResponse);
   return jsonResponse.data;
}

export default async function sendServerRequest<T>(config: SendServerRequestProps): Promise<T> {
   try {
      // attempt to make API call normally
      return await request<T>(config);
   }
   catch (error: any) {
      // on api call fail, check if requesting a refresh of the access token makes sense
      const skipRefresh = (config.url === '/auth/login' || config.url === '/auth/register');
      if (error instanceof ErrorUnauthorized && !skipRefresh) {
         // request a new access token
         console.warn('accessToken rejected, requesting new accessToken');
         try { await request<T>({ method: 'POST', url: '/auth/refresh' }); }
         catch { throw error; }
         return await request<T>(config);
      }
      else {
         // if no refetch attempt is being made, rethrow the error
         throw error
      }
   }
} 