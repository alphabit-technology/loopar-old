'use strict'

import {loopar} from "../loopar.js";
import CoreController from './core-controller.js';

export default class BaseController extends CoreController {
   layout = "main";
   default_action = 'index';
   has_sidebar = true;

   constructor(props) {
      super(props);
   }

   async action_index() {
      const list = await loopar.get_list(this.document);

      list.app = 'list';
      this.context = 'list';

      return this.render(list);
   }

   async action_view_module() {
      const module = this.module;
      const list = await loopar.get_list(this.document, {
         fields: ['name', 'module', 'is_single', 'type'],
         filters: {'=': {module: module}}
      });

      list.app = 'view_module';
      this.context = 'module';
      list.module_group = module;

      return this.render(list);
   }

   async action_create() {
      this.context = 'form';
      const document = await loopar.new_document(this.document, this.data);

      if (this.has_data()) {
         await document.save();
         this.redirect('update?document_name=' + document.name);
         //this.render({success: true, data: 'Document saved successfully'});
      } else {
         Object.assign(this.response, document.__data__);
         this.response.app = 'form';

         return this.render(this.response);
      }
   }

   async action_update() {
      this.context ??= 'form';
      const document = await loopar.get_document(this.document, this.document_name, this.has_data() ? this.data : null);

      if (this.has_data()) {
         await document.save();
         this.redirect('update?document_name=' + document.name);
         //await this.render({success: true, data: 'Document saved successfully'});
      } else {
         Object.assign(this.response, document.__data__);
         this.response.app = 'form';

         return this.render(this.response);
      }
   }

   async action_view() {
      const document = await loopar.get_document(this.document, this.document_name);
      this.context = 'view';

      return this.render(document);
   }

   async action_delete() {
      const document = await loopar.get_document(this.document, this.document_name);
      const result = await document.delete();

      this.res.send(result);
   }
}