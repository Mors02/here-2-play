// First we need to import axios.js
import axios from 'axios';

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function getToken(withJWT=true) {
  const token = localStorage.getItem('access_token');
  if (withJWT)
    return `JWT ${token}`;
  return token;
}

function getRefreshToken() {
  return localStorage.getItem('refresh_token');
}

// Next we make an 'instance' of it
const axiosConfig = axios.create({
// .. where we make our configurations
    baseURL: `${process.env.REACT_APP_BASE_URL}`,
    withCredentials: true,
    headers: {'Content-Type': 'application/json'}
});

// Where you would set stuff like your 'Authorization' header, etc ...
//instance.defaults.headers.common['Authorization'] = 'AUTH TOKEN FROM INSTANCE';
/*axiosConfig.defaults.xsrfCookieName = "csrftoken";
axiosConfig.defaults.xsrfHeaderName = "X-CSRFToken";
axiosConfig.defaults.withCredentials = false;
axiosConfig.defaults.withXSRFToken = true;
axiosConfig.defaults.headers['X-CSRFToken'] = getCookie('csrftoken');*/

/*
axiosConfig.interceptors.request.use(
  config => {
    console.log(config)
    if (!config.headers["X-CSRFToken"]) {
      const token = getCookie('csrftoken');

      if (token) {
        config.headers['X-CSRFToken'] = `${token}`;
      }
    }

    return config;
  },
  error => Promise.reject(error)
);
*/
let refresh = false;
axiosConfig.interceptors.response.use(resp => resp, async error => {
  if (error.response.status === 401 && !refresh) {
     refresh = true;
     console.log(localStorage.getItem('refresh_token'))
     console.log("FETCHING NEW ACCESS TOKEN...")
     const response = await   
           axios.post(`${process.env.REACT_APP_BASE_URL}/token/refresh/`, {      
                      refresh:localStorage.getItem('refresh_token')
                      }, { headers: {'Content-Type': 'application/json'}},
                      {withCredentials: true});
    if (response.status === 200) {
       axiosConfig.defaults.headers.common['Authorization'] = `JWT ${response.data['access']}`;
       console.log("ACCESS TOKEN FOUND")
       localStorage.setItem('access_token', response.data.access);
       localStorage.setItem('refresh_token', response.data.refresh);
       return axios(error.config);
    }
  }
refresh = false;
return error;
});

export {axiosConfig, getCookie, getToken, getRefreshToken};