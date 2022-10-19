import {element_manage} from "/components/element-manage.js";
import {object_manage} from "/utils/object-manage.js";
import {elements} from "/components/elements.js";
import {BaseApp} from "/apps/base-app.js";
import {modal_dialog} from '/utils/modal-dialog.js';
import {http} from '/utils/http.js';

export class BaseForm extends BaseApp {
   #document_name = null;
   designElements = [];

   constructor(options) {
      super(options);
   }

   make() {
      super.make();

      this.form = elements({
         wrapper: this.body_wrapper
      }).tag('form');

      this.body = elements({
         wrapper: this.form,
         props: {class: 'card-body'},
         content: elements({
            props: {class: 'row'},
            content: elements({
               props: {class: 'col-md-12'},
               content: this.container
            }).tag("div")
         }).tag("div")
      }).tag("div");

      this.make_form_actions();
   }

   render() {
      super.render();

      if (this.#designer_container) {
         this.#designer_container.add_class("element").body.add_class("element");
         this.#designer_container.parentWrapper = this;
      }
   }

   save() {
      this.send(this.action);
   }

   send(action = this.action) {
      this.validate();
      return new Promise((resolve, reject) => {
         http.send({
            action: action,
            params: this.params,
            body: this.values,
            success: r => {
               resolve(r);
            },
            error: r => {
               reject(r);
            }
         });
      });
   }

   make_form_actions() {
      this.form.on('submit', (obj, event) => {
         event.preventDefault();

         this.save();
      });
   }

   load_document() {
      this.data = clone(this.__DOCUMENT__);

      /**RENDER DESIGNED ELEMENTS */
      if (this.#designer_container) {
         const doc_structure = JSON.parse(this.__doc_structure.val());

         if (doc_structure.length > 0) {
            JSON.parse(doc_structure).forEach(el => {
               element_manage.render_element(el, this.#designer_container, true, this);
            });
         }
      }
   }

   set data(data) {
      object_manage.in_object(data, (value, field) => {
         if (this.container.fields[field] && this.container.fields[field].is_writeable) {
            const val = ['doc_structure', 'form_structure'].includes(field) ?
               JSON.stringify(value) : (typeof value == 'object' ? value : value.toString());

            if (field === 'name') {
               this.#document_name = val;
            }

            this.container.fields[field].val(val);
         }
      });
   }

   get params() {
      return {
         //document: this.document,
         document_name: this.__DOCUMENT_NAME__,
      }
   }

   get values() {
      const values = this.#values();

      if (this.is_designer && this.__doc_structure) {
         const data = Object.freeze(this.#designer_container.field_data());
         values[this.__doc_structure.data.name] = JSON.stringify(data);
      }

      return values;
   }

   get data() {
      const values = this.#values();

      if (this.#designer_container && this.__doc_structure) {
         values[this.__doc_structure.data.name] = JSON.stringify(this.#designer_container.field_data());
      }

      return {
         document: this.document,
         document_name: this.#document_name,
         values: values
      };
   }

   get is_designer() {
      return !!this.#designer_container;
   }

   #values() {
      const data = {};

      const set_field = (obj, key, field) => {
         if ((field.element === MARKDOWN && this.is_designer) || field.element != MARKDOWN) {
            obj[key] = field.val();
         }
      }

      object_manage.in_object(this.container.fields, (field, key) => {
         if (object_manage.is_obj(field)) {
            if (field.typeof === "JSHtml") {
               set_field(data, key, field);
            } else if (Array.isArray(field)) {
               data[key] = JSON.stringify(field.map(el => {
                  const _data = {};
                  object_manage.in_object(el, e => {
                     set_field(_data, e.data.name, e);
                  });

                  return _data;
               }));
            }
         }
      });

      return data;
   }

   get #designer_container() {
      return this.doc_designer || this.form_designer || null;
   }

   get __doc_structure() {
      return this.container && this.container.fields ? (this.container.fields['doc_structure'] || this.container.fields['form_structure'] || null) : null;
   }

   value_is_valid(value) {
      return typeof value != null && typeof value != "undefined" && value.toString().length > 0;
   }

   validate() {
      const errors = [];

      const _validate = (fields) => {
         object_manage.in_object(fields, field => {
            if (object_manage.is_obj(field)) {
               if (field.typeof === "JSHtml") {
                  const valid = field.validate();

                  if (!valid.valid) {
                     errors.push(valid.message);
                  }
               } else {
                  _validate(field);
               }
            }
         });
      }

      _validate(this.container.fields);

      if (errors.length > 0) {
         modal_dialog({
            title: 'Validation error',
            message: errors.join('<br/>')
         });

         throw errors.join('<br>');
      }
   }

   get_field(name) {
      return this.container.fields[name] || null;
   }
}