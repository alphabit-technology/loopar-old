'use strict';

import {BaseDocument, file_manage, loopar} from 'loopar-env';
import path from "path";

export default class App extends BaseDocument {
   constructor(props) {
      super(props);
   }

   async save() {
      this.autor = !this.autor || this.autor === '' ? loopar.current_user.email : this.autor;
      this.version = !this.version || this.version === '' ? '0.0.1' : this.version;

      await super.save();
      await this.make_app_structure();
   }

   async make_app_structure() {
      if(loopar.installing) return;
      await file_manage.make_folder('apps', this.name);
      await file_manage.make_folder(path.join('apps', this.name), 'modules');

      if(!file_manage.exist_file_sync(path.join('apps', this.name, 'installer.json'))) {
         await file_manage.set_config_file('installer', {}, 'apps/' + this.name);
      }

      await loopar.update_installer(path.join("apps", this.name), this.__DOCTYPE__.name, this.name, this.values);
   }

   async set_apps(){
      await file_manage.set_config_file('apps', {}, 'apps');
      const apps = file_manage.get_config_file('apps', "apps") || {};

      apps[this.name] = apps[this.name] || {};

      await file_manage.set_config_file('apps', apps, "apps")
   }
}