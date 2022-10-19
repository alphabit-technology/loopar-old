'use strict'

import {BaseDocument, file_manage, loopar} from "loopar-env";
import path from "path";

export default class Module extends BaseDocument {
   constructor(props) {
      super(props);
   }

   async save() {
      await super.save();
      await this.make_module_route();
      await this.update_installer();
      await loopar.make_config();
   }

   app_path() {
      return path.join('apps', this.app_name);
   }

   module_path() {
      return path.join(this.app_path(), 'modules');
   }

   async make_module_route() {
      await file_manage.make_folder(this.module_path(), this.name);
   }

   async update_installer(delete_module = false) {
      await loopar.update_installer(this.app_path(), this.__DOCTYPE__.name, this.name, this.values, delete_module);
   }
}