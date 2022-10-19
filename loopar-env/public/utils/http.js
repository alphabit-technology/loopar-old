import {modal_dialog} from '/utils/modal-dialog.js';
import {loopar} from '/loopar.js';

class HTTP {
   #action = "";
   #params = {};
   #body = null;
   #json_params = {};
   #success = null;
   #error = null;
   #always = null;
   #method = "POST";

   /*constructor(options) {
       Object.assign(this, options);
   }*/

   send(options) {
      Object.assign(this, options);
      this.#send_petition();
   }

   set body(body) {
      this.#body = body
   }

   get body() {
      return this.#body || {}/* ? JSON.stringify(this.#body) : null */
   }

   set method(method) {
      this.#method = method
   }

   get method() {
      return this.#method
   }

   set action(url) {
      this.#action = url
   }

   get action() {
      return this.#action
   }

   set params(params) {
      this.#params = params
   }

   get params() {
      if (this.if_json(this.#params)) {
         this.#json_params = this.json_parse(this.#params);
      } else {
         this.#json_params = this.#params;
      }

      if (typeof this.#json_params == "object") {
         return "?" + Object.keys(this.#params).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(this.#params[k])}`).join('&');
      } else {
         return this.#json_params;
      }
   }

   get url() {
      return `${this.action}${this.params}`;
   }

   get options() {
      const body = this.body;
      this.body = null;

      return {
         method: this.method, // *GET, POST, PUT, DELETE, etc.
         mode: 'same-origin', // no-cors, *cors, same-origin
         cache: 'default', // *default, no-cache, reload, force-cache, only-if-cached
         credentials: 'include', // include, *same-origin, omit
         headers: {
            'Content-Type': 'application/json',
            //'x-xsrf-token':  "someCsrfToken",
            // 'Content-Type': 'application/x-www-form-urlencoded',
         },
         redirect: 'follow', // manual, *follow, error
         referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
         body: JSON.stringify(body), // body data type must match "Content-Type" header),
      };
   }

   #send_petition() {
      const self = this;
      loopar.body.add_class("loading-action");
      fetch(self.url, self.options)
         .then(async response => {
            loopar.body.remove_class("loading-action");

            if (response.redirected) {
               window.location.href = response.url;
            }
            const isJson = response.headers.get('content-type')?.includes('application/json');
            const data = isJson ? await response.json() : null;

            // check for error response
            if (!response.ok) {
               // get error message from body or default to response status
               const error = data || {error: response.status, message: response.statusText};
               return Promise.reject(error);
            }

            self.response(data, 'success');
         })
         .catch(error => {
            modal_dialog({title: error.error || 'Undefined Error', message: error.message});
            self.response(error, 'error');
            console.error('There was an error!', error);
         }).finally(() => {
         loopar.body.remove_class("loading-action");

         self.response(null, 'always');
         //self.always;
      });
   }

   set success(success) {
      this.#success = success
   }

   set error(error) {
      this.#error = error
   }

   set always(always) {
      this.#always = always
   }

   get success() {
      return this.#success
   }

   get error() {
      return this.#error
   }

   get always() {
      return this.#always
   }

   response(data, action) {
      this.body = null;
      if (this[action]) this[action](data);
   }

   json_parse(json) {
      if (this.if_json(json)) {
         return JSON.parse(json);
      } else {
         return json;
      }
   }

   if_json(json) {
      try {
         JSON.parse(json);
         return true;
      } catch (e) {
         return false;
      }
   }
}

export const http = new HTTP();

/*fetch(self.url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'no-cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(this.#params.data) // body data type must match "Content-Type" header),
})*/