/*
example api call:

import axios from '../api/axios';

const response = await axios({
   method: 'get',
   url: 'user/id'
});
*/


import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import cookies from 'js-cookie';

const axiosInstance =  axios.create({
   baseURL: 'http://localhost:4000',
   withCredentials: true
});

function checkAccessToken() {
   try {
      const accessToken = cookies.get('accessToken');
      if (!accessToken) return false;
      const decodedToken = jwtDecode(accessToken);
      const validToken = decodedToken.exp > Date.now() / 1000;
      return validToken;
   } 
   catch (error) {
      console.error('Invalid token:', error);
      return false;
   }
}

export default async function sendRequest( configuration ) {
   return new Promise(async (resolve, reject) => {

      // if refresh token exists and client needs a new access use the refresh api
      try {
         if(cookies.get('refreshToken') && !checkAccessToken()) await axiosInstance.post(`user/refresh`); // get new access token
      }
      catch (error) {
         console.error('failed to fetch refresh token');
         return reject(error);
      }

      try {
         // process the request
         console.log("sending request to server:", configuration)
         const response = await axiosInstance( configuration );
         console.log("response from server:", response)
         return resolve(response.data);
      }
      catch (error) {
         console.error('issue processing request:', error);
         return reject(error);
      }
   })
}