import {hash} from '/utils/helper.js';
import {Router} from '/router/router.js';
import {elements} from '/components/elements.js';
import {http} from './utils/http.js';
import {UiManage} from "./components/uui.js";

class Loopar extends Router {
   #route = {};
   ui = new UiManage();
   http = http;

   constructor() {
      super();

      this.#bind_events();
   }

   change() {
      this.#route = window.location;
      return this.#load_document();
   }

   current_page(route = window.location) {
      if (!this.#route.pathname) this.#route = route;

      const query = this.#route.search ? this.#route.search.split('?') : '';
      this.#route.query = query[1] || '';

      const id = this.#route.query.split('&').map(q => q.split('=')).filter(q => q[0] === 'document_name').join();

      return hash(this.#route.pathname + id);
   }

   #bind_events() {
      window.addEventListener('popstate', (e) => {
         e.preventDefault();

         this._route();
         return false;
      });
   }

   set route(route) {
      this.set_route(route || "desk");
   }

   async #load_document() {
      const current_app = this[this.current_page()];

      if (current_app && !this.reload) {
         current_app.reload();
      } else {
         const data = request_data ? request_data : await this.#get_url_data();

         import(data.client_importer).then(module => {
            new module.default(data.content);
            this.reload = false;
         });
      }
   }

   initialize() {
      return new Promise(resolve => {
         document.docReady(() => {
            this.make_html_elements();
            resolve();
         });
      });
   }

   make_html_elements(base = document, context = null) {
      base.querySelectorAll("[element]").forEach(el => {
         elements({obj: el, from_html: true, context: context});
      });
   }

   click_event(e) {
      let override = (route) => {
         e.preventDefault();
         this.set_route(route);
         return false;
      };

      const href = e.currentTarget.getAttribute('href');

      override(href);
   }

   #get_url_data() {
      return new Promise((resolve, reject) => {
         http.send({
            action: this.#route.pathname,
            params: this.#route.search,
            success: r => {
               resolve(r);
            },
            error: r => {
               reject(r);
            }
         });
      });
   }
}

export const loopar = new Loopar();