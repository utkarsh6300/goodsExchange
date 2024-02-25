import axios from 'axios';
import { api_url } from './constants/url';

const verifyToken = async(token) => {
    // Implement your token verification logic here
    // Return true if token is valid, false otherwise
    try {
        const config = {
            headers: {
              'token': token,
            },
          };
        const response= await axios.get(`${api_url}/verify_token`,config);
        if(response.status==200) return true;
        else return false;
    } catch (error) {
        console.log(error);
        return false;
    }
  };

  export default verifyToken;
