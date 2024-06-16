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

// Next we make an 'instance' of it
const axiosConfig = axios.create({
// .. where we make our configurations
    baseURL: `${process.env.REACT_APP_BASE_URL}`,
    xsrfCookieName: "csrftoken",
    xsrfHeaderName: "X-CSRFToken",
    withCredentials: false,
    withXSRFToken: true
});

// Where you would set stuff like your 'Authorization' header, etc ...
//instance.defaults.headers.common['Authorization'] = 'AUTH TOKEN FROM INSTANCE';
/*axiosConfig.defaults.xsrfCookieName = "csrftoken";
axiosConfig.defaults.xsrfHeaderName = "X-CSRFToken";
axiosConfig.defaults.withCredentials = false;
axiosConfig.defaults.withXSRFToken = true;
axiosConfig.defaults.headers.common['X-CSRF-TOKEN'] = getCookie('csrftoken');*/

export {axiosConfig, getCookie};