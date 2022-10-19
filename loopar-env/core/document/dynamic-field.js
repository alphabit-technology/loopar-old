'use strict'
import {data_interface, element_definition} from '../global/element-definition.js';

export default class DynamicField {
   #value = null;

   constructor(props, value) {
      this.#make(props, value);
      this.value = value;
   }

   #data_type(type) {
      return element_definition[type] || element_definition[INPUT];
   }

   get #datatype() {
      return (this.element === INPUT ? (this.format || this.element) : this.element).toLowerCase();
   }

   debug_text(text) {
      return (text || "").toString().replace(/ /g, "");
   }

   #make(props) {
      const data = props.data || {};
      delete props.data;

      Object.assign(this, data, props);
   }

   set value(value) {
      this.#value = value;
   }

   get raw_value() {
      return this.#value;
   }

   get is_parsed() {
      return this.element === 'text_editor' || ['__DOCTYPE__', 'doc_structure', 'form_structure'].includes(this.name);
   }

   get value() {
      return this.is_parsed ? this.#parse() : this.#value;
   }

   get stringify_value() {
      return typeof this.#value == 'object' ? JSON.stringify(this.#value) : this.#value;
   }

   get parse_value() {
      return this.is_parsed ? this.#parse() : this.#value;
   }

   #parse() {
      return this.if_json() ? JSON.parse(this.#value) : this.#value;
   }

   get valueToString() {
      return this.#value == null || typeof this.#value == "undefined" ? "" : (this.is_parsed ? this.#value : this.#value.toString());
   }

   get formatted_value() {
      /*if(this.#datatype === "date"){
          return DATE_FORMATTER(new Date(), "yyyy-mm-dd HH:MM:ss");
      }*/
      return this.#value;
   }

   validate() {
      const validation = () => {
         const valid = data_interface(this).validate();

         if (!valid.valid) {
            return {error: `<strong><i class="fa fa-solid fa-angle-right mr-1" style="color: var(--red);"></i><strong>${valid.message}</strong>`};
         }

         return true;
      }

      return validation();
   }

   if_json() {
      try {
         JSON.parse(this.#value);
         return true;
      } catch (error) {
         return false;
      }
   }
}
