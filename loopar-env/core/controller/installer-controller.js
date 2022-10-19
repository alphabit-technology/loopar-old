'use strict'

import Installer from "../../modules/core/installer/installer.js";
import CoreController from "./core-controller.js";
import {loopar} from "../loopar.js";


export default class InstallerController extends CoreController {
   layout = "installer";
   default_action = 'install';
   context = "installer";
   has_sidebar = false;

   constructor(props) {
      super(props);
   }

   async action_connect() {
      const model = new Installer();

      if (this.has_data()) {
         Object.assign(model, this.data);

         if (await model.connect()) {
            this.res.redirect('/desk');
         }
      } else {
         const response = await model.__data_connect__();

         response.app = "form";
         await this.render(response);
      }
   }

   async action_install() {
      const model = new Installer();

      if (this.has_data()) {
         Object.assign(model, this.data);

         if(loopar.framework_installed && await loopar.app_status(model.app_name) === 'installed') {
            loopar.throw("App already installed please refresh page");
         }

         if (await model.install()) {
            await loopar.make_config();
            if(model.app_name === "loopar") {
               this.res.redirect('/desk');
            }else{
               await this.render({success: true, data: 'App installed successfully'});
            }
         }
      } else {
         const response = await model.__data_install__();

         response.app = "form";
         await this.render(response);
      }
   }

   async action_update() {
      const model = new Installer();

      if (this.has_data()) {
         Object.assign(model, this.data);

         if (await model.update()) {
            await loopar.make_config();
            await this.render({success: true, data: 'App updated successfully'});
         }
      } else {
         const response = await model.__data_install__();

         response.app = "form";
         await this.render(response);
      }
   }

   async action_uninstall() {
      const app_name = this.data.app_name;
      loopar.installing = true;

      if(app_name === "loopar") {
         loopar.throw("You can't uninstall app Loopar");
      }

      if(await loopar.app_status(app_name) === 'uninstalled') {
         loopar.throw("App already uninstalled please refresh page");
      }

      await loopar.delete_document("App", app_name, false);

      const modules = await loopar.get_list("Module",
      {
         fields: ['name'],
         filters: {'=': {app_name}}
      });

      for(const module of modules.rows) {
         await loopar.delete_document("Module", module.name, false);

         const documents = await loopar.get_list("Document",
         {
            fields: ['name'],
            filters: {'=': {module: module.name}}
         });

         for(const document of documents.rows) {
            await loopar.delete_document("Document", document.name, false);
         }
      }

      await loopar.make_config();

      return this.render({success: true, data: 'App uninstalled successfully'});
   }
}