'use strict'

import {BaseController} from "loopar-env";
import {loopar} from "../../../../../loopar-env/index.js";

export default class UserController extends BaseController {
   constructor(props) {
      super(props);
   }

   async action_update() {
      this.context ??= 'form';
      const document = await loopar.get_document("User", this.document_name, this.has_data() ? this.data : null);

      if (this.has_data()) {
         await document.save();
         this.redirect('update?document_name=' + document.name);
         //await this.render({success: true, data: 'Document saved successfully'});
      } else {
         document.password = document.protected_password;
         document.confirm_password = document.protected_password;

         Object.assign(this.response, document.__data__);
         this.response.app = 'form';

         return this.render(this.response);
      }
   }
}