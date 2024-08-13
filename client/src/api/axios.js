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
   console.log('checking if access token is valid');
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

   // if refresh token exists and client needs a new access use the refresh api
   try {
      if(cookies.get('refreshToken') && !checkAccessToken()) await axiosInstance.post(`user/refresh`); // get new access token
   }
   catch (error) {
      console.error('failed to fetch refresh token');
      throw error;
   }


   try {
      console.log('calling api:', configuration)
      // process the request
      const response = axiosInstance( configuration );
      return response.data;
   }
   catch (error) {
      console.error('issue processing request')
      throw error;
   }

}