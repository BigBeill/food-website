/*
example api call:

import axios from '../api/axios';

const response = await axios({
   method: 'get',
   url: 'user/id'
   data:{
      //anything you want included in the body
   }
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
      if (!accessToken) { return false; }
      const decodedToken = jwtDecode(accessToken);
      if (!decodedToken.exp) { return false; }
      const validToken = decodedToken.exp > Date.now() / 1000;
      return validToken;
   } 
   catch (error) {
      console.error('Invalid token:', error);
      return false;
   }
}

interface sendRequestProps {
   method: string;
   url: string;
   data?: { [key: string]: any };
}

export default async function sendRequest( configuration: sendRequestProps ) {
   return new Promise<any>(async (resolve, reject) => {

      // if refresh token exists and client needs a new access token, use the refresh api
      try {
         if(cookies.get('refreshToken') && !checkAccessToken()) await axiosInstance.post(`user/refresh`); // get new access token
      }
      catch (error) {
         console.error('failed to fetch refresh token');
      }

      try {
         // process the request
         const response = await axiosInstance(configuration);
         console.trace("Response from server:", response);
         return resolve(response.data.payload);
      }
      catch (error) {
         console.error('issue processing request:', error);
         
         if (axios.isAxiosError(error) && error.response) {
            return reject(error.response.data);
         } else {
            return reject(error);
         }
      }
   })
}