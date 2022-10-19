'use strict'

import CoreDocument from './core-document.js';
import {loopar} from '../loopar.js';
import {lowercase} from '../helper.js';

export default class BaseDocument extends CoreDocument {
   constructor(props) {
      super(props);
   }

   get_field_properties(field_name) {
      const fields = Object.values(this.fields)
         .filter(k => k.name !== "__DOCTYPE__" && k.in_list_view).map(k => k[field_name]).filter(k => lowercase(k) !== 'id');

      return fields.length === 0 ? ['name'] : fields;
   }

   get_field_list_names() {
      const fields = this.get_field_properties('name');

      return fields.length === 0 ? ['name'] : fields;
   }

   get_field_list_labels() {
      const labels = this.get_field_properties('label');

      return labels.length === 0 ? ['Name'] : labels;
   }

   build_condition(q = null) {
      return Object.values(this.fields).filter(field => {
         return field.name !== '__DOCTYPE__' && typeof field.value != "undefined" && field.value != null;
      }).map(field => {
         const operator = field.element === SELECT ? "=" : "LIKE";

         return {[operator]: {[field.name]: field.value}};
      }).reduce((acc, cur) => {
         acc.AND = cur;

         return acc;
      }, {});
   }

   async get_list({fields = null, filters = {}, q = null} = {}) {
      this.pagination = {
         page: current_controller.page || 1,
         page_size: 10,
         total_pages: 4,
         total_records: 1,
         sort_by: "id",
         sort_order: "asc"
      };

      loopar.db.pagination = this.pagination;

      const list_fields = fields || this.get_field_list_names();
      //TODO: add filters on document is virtual deleted
      const filter_if_is_deleted = {};//{'<>': {'is_deleted': 1}};

      if (this.__DOCTYPE__.name === 'Document' && current_controller.document !== "Document") {
         list_fields.push('is_single');
      }

      const rows = await loopar.db.get_list(this.__DOCTYPE__.name, list_fields, {...this.build_condition(q), ...filters, ...filter_if_is_deleted});

      this.pagination.total_records = await this.records();
      this.pagination.total_pages = Math.ceil(this.pagination.total_records / this.pagination.page_size);

      return Object.assign(this.__data__, {
         labels: this.get_field_list_labels(),
         fields: list_fields,
         rows: rows,
         pagination: this.pagination

      });
   }

   build_condition_to_select(q = null) {
      return {'LIKE': {'CONCAT': this.get_field_select_names(), value: `%${q}%`}};
   }

   get_field_select_names() {
      return Array.from(new Set([...this.__DOCTYPE__.search_fields.split(',').filter(field => field !== ''), 'name']));
   }

   get_field_select_labels() {
      return Array.from(new Set([...this.__DOCTYPE__.title_fields.split(',').filter(field => field !== ''), 'name']));
   }

   async get_list_to_select_element(q = null) {
      this.pagination = {
         page: 1,
         page_size: 20,
         total_pages: 4,
         total_records: 1,
         sort_by: "id",
         sort_order: "asc"
      };

      loopar.db.pagination = this.pagination;

      const list_fields = this.get_field_select_labels();

      const rows = await loopar.db.get_list(this.__DOCTYPE__.name, list_fields, this.build_condition_to_select(q));

      this.pagination.total_records = await this.records();
      this.pagination.total_pages = Math.ceil(this.pagination.total_records / this.pagination.page_size);

      return Object.assign({
         title_fields: list_fields,
         rows: rows
      });
   }

   async records() {
      return await loopar.db._count(this.__DOCTYPE__.name);
   }
}