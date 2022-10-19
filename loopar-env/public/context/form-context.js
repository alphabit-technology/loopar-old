import {BaseForm} from "/apps/base-form.js";

import {DesignerForm} from "/plugins/designer-form.js";
import {ElementEditor} from "/plugins/element-editor.js";

export default class FormContext extends BaseForm {
   has_header = true;
   context = 'form';

   constructor(options) {
      super(options);

      this.make();
      this.render();
   }

   get app_title() {
      return this.document ? this.document : this.module;
   }

   make() {
      super.make();
   }

   render() {
      super.render();

      if (this.is_designer) {
         this.designer_form = new DesignerForm(this);
         this.element_editor = new ElementEditor(this);
      }
   }

   edit_element(element) {
      if (this.element_editor) {
         this.designer_form.hide();
         this.element_editor.edit(element);
         this.element_editor.show();
      }
   }

   toggle(element) {
      if (element === this.element_editor) {
         this.designer_form.show();
         this.element_editor.hide();
      } else {
         this.designer_form.hide();
         this.element_editor.hide();
      }
   }

   value_is_valid(value) {
      return typeof value != null && typeof value != "undefined" && value.toString().length > 0;
   }
}