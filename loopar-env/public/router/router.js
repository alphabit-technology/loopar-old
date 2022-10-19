export class Router {
   workspaces = ["app", "web", "desk"];
   re_route = {"#login": ""};
   route_history = [];
   route_options = null;
   current_route = null;
   current_complete_route = null;

   routes = {};
   factory_views = ['form', 'list', 'report', 'tree', 'print', 'dashboard'];

   constructor() {
   }

   get_route() {
      return this.current_route
   }

   get_route_str() {
      return this.current_complete_route
   }

   set_route() {
      return this.#set_route.apply(this, arguments);
   }

   get_prev_route() {
      if (this.route_history && this.route_history.length > 1) {
         return this.route_history[this.route_history.length - 2];
      } else {
         return [];
      }
   }

   set_re_route() {
      var tmp = this.get_sub_path();
      this.#set_route.apply(null, arguments);
      this.re_route[tmp] = this.get_sub_path();
   }

   has_route_options() {
      return Boolean(Object.keys(this.route_options || {}).length);
   }

   is_app_route(path) {
      if (path.substr(0, 1) === '/') path = path.substr(1);
      path = path.split('/');
      if (path[0]) {
         //return path[0]==='';
         return path[0] === 'app';
      }
   }

   setup() {
      for (let doctype of this.boot.user.can_read) {
         this.routes[this.slug(doctype)] = {doctype: doctype};
      }
      if (this.boot.doctype_layouts) {
         for (let doctype_layout of this.boot.doctype_layouts) {
            this.routes[this.slug(doctype_layout.name)] = {
               doctype: doctype_layout.document_type,
               doctype_layout: doctype_layout.name
            };
         }
      }
   }

   _route() {
      let sub_path = this.get_sub_path();
      if (this.#re_route(sub_path)) return;

      this.current_sub_path = sub_path;
      this.current_route = this.parse();
      this.set_history(sub_path);
      this.change();
   }

   parse(route) {
      route = this.get_sub_path_string(route).split('/');
      if (!route) return [];
      route = $.map(route, this.decode_component);
      this.set_route_options_from_url(route);
      return this.convert_to_standard_route(route);
   }

   convert_to_standard_route(route) {
      if (this.workspaces[route[0]]) {
         route = ['Workspaces', this.workspaces[route[0]].name];
      } else if (this.routes[route[0]]) {
         route = this.set_doctype_route(route);
      }

      return route;
   }

   set_doctype_route(route) {
      let doctype_route = this.routes[route[0]];
      if (route[1]) {
         if (route[2] && route[1] === 'view') {
            route = this.get_standard_route_for_list(route, doctype_route);
         } else {
            let docname = route[1];
            if (route.length > 2) {
               docname = route.slice(1).join('/');
            }
            route = ['Form', doctype_route.doctype, docname];
         }
      } else if (this.model.is_single(doctype_route.doctype)) {
         route = ['Form', doctype_route.doctype, doctype_route.doctype];
      } else {
         route = ['List', doctype_route.doctype, 'List'];
      }

      if (doctype_route.doctype_layout) {
         this.doctype_layout = doctype_route.doctype_layout;
      }

      return route;
   }

   get_standard_route_for_list(route, doctype_route) { }

   set_history() {
      this.route_history.push(this.current_route);
   }

   render() {
      if (this.current_route[0]) {
         this.render_page();
      } else {
         // Show home
         this.views.pageview.show('');
      }
   }

   render_page() {   }

   #re_route(sub_path) {
      if (this.re_route[sub_path] !== undefined) {
         const re_route_val = this.get_sub_path(this.re_route[sub_path]);
         if (re_route_val === this.current_sub_path) {
            window.history.back();
         } else {
            this.#set_route(re_route_val);
         }

         return true;
      }
   }

   set_title(sub_path) {   }

   #set_route() {
      let route = arguments;
      route = this.get_route_from_arguments(route);
      route = this.convert_from_standard_route(route);
      const sub_path = this.make_url(route);

      this.push_state(sub_path);
   }

   get_route_from_arguments(route) {

      if (route.length === 1 && $.isArray(route[0])) {
         route = route[0];
      }

      if (route.length === 1 && route[0] && route[0].includes('/')) {
         route = $.map(route[0].split('/'), this.decode_component);
      }

      if (route && route[0] == '') { }

      if (route && ['desk', 'app'].includes(route[0])) {
         route.shift();
      }

      return route;

   }

   convert_from_standard_route(route) {
      return route;

      const view = route[0] ? route[0].toLowerCase() : '';
      let new_route = route;
      if (view === 'list') {
         if (route[2] && route[2] !== 'list' && !$.isPlainObject(route[2])) {
            new_route = [this.slug(route[1]), 'view', route[2].toLowerCase()];

            if (route[3]) new_route.push(route[3]);
         } else {
            if ($.isPlainObject(route[2])) {
               this.route_options = route[2];
            }
            new_route = [this.slug(route[1])];
         }
      } else if (view === 'form') {
         new_route = [this.slug(route[1])];
         if (route[2]) {
            new_route.push(route[2]);
         }
      } else if (view === 'tree') {
         new_route = [this.slug(route[1]), 'view', 'tree'];
      }
      return new_route;
   }

   slug_parts(route) {
      if (route[0] && this.factory_views.includes(route[0].toLowerCase())) {
         route[0] = route[0].toLowerCase();
         route[1] = this.slug(route[1]);
      }
      return route;
   }

   make_url(params) {
      let path_string = $.map(params, a => {
         if ($.isPlainObject(a)) {
            this.route_options = a;
            return null;
         } else {
            a = String(a);
            if (a && a.match(/[%'"\s\t]/)) {}
            return a;
         }
      }).join('/');

      return (path_string || 'home');
   }

   push_state(url) {
      if (window.location.pathname !== url) {
         window.location.hash = '';

         history.pushState(null, null, url);
      }
      this._route();
   }

   get_sub_path_string(route) {
      if (!route) {
         route = window.location.hash || (window.location.pathname + window.location.search);
      }

      return this.strip_prefix(route);
   }

   strip_prefix(route) {
      if (route.substr(0, 1) == '/') route = route.substr(1); // for /app/sub
      if (route.startsWith('app')) route = route.substr(4); // for desk/sub
      if (route.substr(0, 1) == '/') route = route.substr(1);
      if (route.substr(0, 1) == '#') route = route.substr(1);
      if (route.substr(0, 1) == '!') route = route.substr(1);
      return route;
   }

   get_sub_path(route) {
      var sub_path = this.get_sub_path_string(route);
      route = $.map(sub_path.split('/'), this.decode_component).join('/');

      return route;
   }

   set_route_options_from_url(route) {
      var last_part = route[route.length - 1];
      if (last_part.indexOf("?") < last_part.indexOf("=")) {
         let parts = last_part.split("?");
         route[route.length - 1] = parts[0];
      }
   }

   decode_component(r) {
      try {
         return decodeURIComponent(r);
      } catch (e) {
         if (e instanceof URIError) {
            // legacy: not sure why URIError is ignored.
            return r;
         } else {
            throw e;
         }
      }
   }

   slug(name) {
      return name.toLowerCase().replace(/ /g, '-');
   }
}