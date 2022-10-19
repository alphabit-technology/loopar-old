'use strict'

import {BaseController, loopar} from 'loopar-env';

export default class ModuleController extends BaseController {
   constructor(props) {
      super(props);
   }

   async action_view(){
      const module = this.document_name || "core";
      const list = await loopar.get_list("Document", {
         fields: ['name', 'module', 'is_single', 'type'],
         filters: {'=': {module: module}}
      });

      list.__DOCTYPE__.doc_structure = null;
      list.__DOCTYPE__.STRUCTURE = [];
      list.title = module;

      this.context = 'view';
      list.module_group = this.document_name;

      return this.render(list);
   }
}