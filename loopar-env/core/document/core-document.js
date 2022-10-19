'use strict'

import DynamicField from './dynamic-field.js';
import {loopar} from '../loopar.js';

export default class CoreDocument {
   #fields = {};
   document_type = "Document";
   field_doc_structure = 'doc_structure';

   constructor(props) {
      Object.assign(this, props);

      this.make();
   }

   get fields() {
      return this.#fields;
   }

   on_load() {

   }

   trigger(event, ...args) {
      if(this[event] && typeof this[event] === 'function') {
         this[event](event, ...args);
      }
   }

   async make() {
      this.#make_fields(JSON.parse(this.__DOCTYPE__[this.field_doc_structure]));

      this.__DOCTYPE__.STRUCTURE = JSON.parse(this.__DOCTYPE__[this.field_doc_structure]).filter(field => field.data.name !== ID);

      if (this.__DOCUMENT__ && this.__DOCUMENT__[this.field_doc_structure]) {
         this.__DOCUMENT__[this.field_doc_structure] = JSON.stringify(JSON.parse(this.__DOCUMENT__[this.field_doc_structure]).filter(field => field.data.name !== ID));
      }

      this.on_load();
   }

   #make_field(field, field_name = field.data.name, value = null) {
      if (!this.#fields[field_name]) {
         this.#fields[field_name] = new DynamicField(field, value || this.__DOCUMENT__[field_name]);

         Object.defineProperty(this, `get_${field_name}`, {
            get: () => {
               return this.#fields[field_name];
            }
         });

         Object.defineProperty(this, field_name, {
            get: () => {
               return this.#fields[field_name].value;
            },
            set: (val) => {
               this.#fields[field_name].value = val;
            }
         });
      }
   }

   #make_fields(fields = this.__DOCTYPE__.STRUCTURE) {
      fields.map(field => {
         if (field.is_writeable) {
            this.#make_field(field);
         } else if (field.element === "table") {

         }

         this.#make_fields(field.elements || []);
      });
   }

   name_is_null() {
      return !this.name || this.name.length === 0;
   }

   set_unique_name(){
      if(this.name_is_null() && this.__IS_NEW__ && this.get_name.hidden === 1) {
         this.name = loopar.utils.random_string(10);
      }
   }

   async save() {
      return new Promise(async resolve => {
         this.set_unique_name();
         await this.validate();

         try {
            if (this.__IS_NEW__ || this.__DOCTYPE__.is_single) {
               await loopar.db.insert_row(this.__DOCTYPE__.name, this.stringify_values, this.__DOCTYPE__.is_single);
            } else {
               const data = this.values_to_set_data_base;

               if (Object.keys(data).length) {
                  await loopar.db.update_row(
                     this.__DOCTYPE__.name,
                     this.values_to_set_data_base,
                     this.__DOCUMENT_NAME__,
                     this.__DOCTYPE__.is_single
                  );
               }
            }

            resolve();
         } catch (error) {
            console.log(['save error', error]);
            loopar.throw(error.sqlMessage);
         }
      });
   }

   async validate() {
      return new Promise(resolve => {
         const validator = Object.values(this.#fields).filter(field => field.name !== ID).map(field => {
            const result = field.validate();

            return result.error ? result.error : null;
         }).filter(v => !!v);

         if (validator.length) {
            loopar.throw({
               error_type: VALIDATION_ERROR,
               message: validator.join('<br>')
            });
         } else {
            resolve();
         }
      });
   }

   async delete() {
      return new Promise(async resolve => {
         try {
            const result = await loopar.db.delete_row(this.__DOCTYPE__.name, this.__DOCUMENT_NAME__);

            if(this.update_installer && typeof this.update_installer === 'function') {
               await this.update_installer(true);
            }

            await this.trigger('after_delete', this);
            resolve({
               success: true,
               data: result
            });
         } catch (error) {
            resolve({
               success: false,
               errors: [{error: error.message}]
            });
         }
      });
   }

   get __data__() {
      return {
         __DOCTYPE__: this.__DOCTYPE__,
         __DOCUMENT_NAME__: this.__DOCUMENT_NAME__,
         __DOCUMENT__: this.values,
         //__DOCUMENT__: this.__DOCUMENT__,
         __IS_NEW__: this.__IS_NEW__,
      }
   }

   get values() {
      const value = (field) => {
         if (field.name === this.field_doc_structure && field.value) {
            return JSON.stringify(field.value.filter(field => field.data.name !== ID));
         } else {
            return field.stringify_value;
         }
      }

      return Object.values(this.#fields).reduce((acc, cur) => ({...acc, [cur.name]: value(cur)}), {});
   }

   get stringify_values() {
      return Object.values(this.#fields)
         .filter(field => field.name !== ID)
         .reduce((acc, cur) => ({...acc, [cur.name]: cur.stringify_value}), {});
   }

   get values_to_set_data_base() {
      return Object.values(this.#fields)
         .filter(field => field.name !== ID && (!this.__IS_NEW__ && !field.set_only_time))
         .reduce((acc, cur) => ({...acc, [cur.name]: cur.stringify_value}), {});
   }

   get formatted_values() {
      return Object.values(this.#fields)
         .filter(field => field.name !== ID)
         .reduce((acc, cur) => ({...acc, [cur.name]: cur.formatted_value}), {});
   }
}