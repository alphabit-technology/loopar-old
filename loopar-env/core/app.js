'use strict';
import path from "path";
import {Capitalize, decamelize} from './helper.js';
import {loopar} from './loopar.js';
import {file_manage} from "./file-manage.js";

export default class App {
   #route_structure = ["host", "module", "document", "action"];
   controller = 'base-controller';
   debugger = false;

   constructor(options) {
      Object.assign(this, options);

      this.#construct();
   }

   #construct() {
      Object.assign(this, this.req.query);

      this.#route_structure.forEach(prop => {
         if (prop.toString().length > 0) this[prop] = null;
      });

      this.url.pathname.split("/").forEach((prop, index) => {
         this[this.#route_structure[index]] = `${decodeURIComponent(this.#route_structure[index] === 'document' ? Capitalize(prop) : prop)}`;
      });

      if (!this.document) {
         this.document_name = this.module;
         this.module = 'core';
         this.document = 'Module';
         this.action = 'view';
      }

      const res = this.res;

      if (!loopar.database_server_initialized) {
         this.controller = 'installer-controller';

         if (this.document !== 'Loopar' || this.action !== 'connect') {
            return res.redirect('/core/loopar/connect');
         } else {
            this.module = "core";
            this.document = "Loopar";
            this.action = "connect";
         }
      } else if (!loopar.database_initialized || !loopar.framework_installed) {
         this.controller = 'installer-controller';

         if (this.document !== 'Loopar' || this.action !== 'install') {
            return res.redirect('/core/loopar/install');
         } else {
            this.module = "core";
            this.document = "Loopar";
            this.app_name = "loopar";
            this.action = "install";
         }
      } else {
         if(this.installing){
            this.controller = 'installer-controller';
         }

         if (this.document === 'Loopar' && !this.installing) {
            return res.redirect('/desk');
         }
      }

      this.method = this.req.method;
      this.#import_controller();
   }

   async #import_controller() {
      /**TODO: Check controllers */
      await this.#make();

      const importer_controller = await file_manage.import_file(this.controller_path_file);

      global.current_controller = new importer_controller.default(this);

      const action = `action_${this.action || current_controller.default_action}`;

      const execute_action = () => {
         if (current_controller[action] && typeof current_controller[action] === "function") {
            current_controller[action]();
         } else {
            current_controller.not_found();
         }
      }

      if (this.controller === 'installer-controller') {
         execute_action();
      } else {
         if (this.debugger) {
            execute_action();
         } else {
            current_controller.isAuthenticated().then(result => {
               if(result) current_controller.isAuthorized().then(result => {
                  if(result) execute_action();
               });
            });
         }
      }
   }

   async #make() {
      await this.#set_app_name();
      await this.#set_app_route();
      await this.#set_controller_name();
      await this.#set_module_path();
      await this.#set_controller_path();

      this.controller_path_file = path.join(this.controller_path, `${this.controller_name}-controller.js`);
      this.controller_path_file = await file_manage.exist_file(this.controller_path_file) ? this.controller_path_file : `./controller/${this.controller}.js`;
   }

   async #set_app_name() {
      if(this.controller === 'installer-controller'){
         this.app_name = null;
      }else {
         const module = await loopar.db.get_value("Document", "module", this.document);
         this.app_name = await loopar.db.get_value("Module", "app_name", module);
      }
   }

   async #set_app_route() {
      this.app_route = this.controller === 'installer-controller' ? '' : path.join("apps", this.app_name || "loopar");
   }

   async #set_controller_name() {
      this.controller_name = this.controller === 'installer-controller' ? 'installer' :
         decamelize(this.document.replaceAll(/\s/g, ''), {separator: '-'});
   }

   async #set_module_path() {
      this.module_path = path.join(this.app_route, "modules", this.module);
   }

   async #set_controller_path() {
      this.controller_path = path.join(this.module_path, this.controller_name);
   }
}