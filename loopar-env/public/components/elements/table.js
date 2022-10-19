import {Pagination} from "/plugins/pagination.js";
import {elements} from "/components/elements.js";
import {Div} from "/components/elements/div.js";
import {loopar} from "/loopar.js";
import {object_manage} from "/utils/object-manage.js";
import {http} from "/utils/http.js";
import {modal_dialog} from '/utils/modal-dialog.js';

export class Table extends Div {
   #rows_inputs = [];
   rows = {};

   selector_rows = elements({without_label: true}).checkbox().on('change', () => {
      this.select_all_visible_rows();
   });

   data_example = {
      columns_title: [
         {col: 'name', title: 'Name', element: 'input', data: {required: true}},
         {col: 'description', title: 'Description', element: 'input'},
         {col: 'disabled', title: 'Disabled', element: 'switch'}
      ],
      rows: [
         {name: 'Raquel', description: 'Acosta', disabled: true},
         {name: 'Alfredo', description: 'Ramirez', disabled: true}
      ]
   };

   constructor(options) {
      super(options, false);

      this.make();
   }

   make() {
      super.make();

      this.add_class('table-responsive');
      this.css('height', '100%');

      this.table = elements({
         wrapper: this,
         props: {class: 'table table-condensed table-hover'}
      }).tag('table');

      this.head = elements({wrapper: this.table, props: {style: 'color: var(--dark);'}}).tag('thead');
      this.body = elements({wrapper: this.table}).tag('tbody');

      this.pagination_wrapper = elements({
         wrapper: this.pagination_wrapper,
         props: {style: 'width: 100%;'}
      }).tag('div');

      this.pagination_manage = new Pagination(this);

      this.make_columns_title();

      this._render();
   }

   get rows_inputs() {
      return this.#rows_inputs;
   }

   get _data_table() {
      return this.data_table || this.data_example;
   }

   /*get template() {
      return super.tag("div");
   }*/

   get _editable() {
      return true;
      return !this.editable === false;
   }

   get _has_title() {
      return !this.has_title === false;
   }

   make_head() {
      this.head = elements({wrapper: this.table}).tag('thead');
   }

   make_body() {
      this.body = elements().tag('tbody');
   }

   make_columns_title() {
      this._data_table.columns_title = [{
         is_added: true,
         col: 'bull_action',
         title: this.selector_rows,
         element: 'checkbox',
         props: {style: "min-width:10px; max-width:10px;"},
         row_props: {class: "align-middle col-checker"},
         value: (row) => {
            this.rows[row.name] = elements({
               without_label: true
            }).checkbox().on('click', () => {
               return;
            });
            return this.rows[row.name];
         }
      }].concat(this._data_table.columns_title);

      this._data_table.columns_title.forEach(column => {
         elements({
            wrapper: this.head,
            content: column.title,
            props: column.props || {}
         }).tag('th');
      });
   }

   _render() {
      this.body.empty();

      this.#rows_inputs = this._data_table.rows.map(row => {
         const tr = elements({wrapper: this.body}).tag('tr');

         return this._data_table.columns_title.map(column => {
            if (column.action_row) {
               tr.on(column.action_row.action_name, (obj, e) => {
                  e.preventDefault();

                  column.action_row.action(row);
                  return false;
               });
            }

            const td = elements({
               wrapper: tr,
               props: Object.assign({class: this._editable ? 'td-like-input' : ''}, column.row_props || {})
            }).tag('td');

            if (this._editable && !column.is_added) {
               return {
                  [column.col]: elements({
                     props: {
                        class: this._editable ? 'input-like-div' : ''
                     },
                     without_label: true,
                     wrapper: td,
                     content: row[column.col],
                     data: column.data || {}
                  })[column.element]()
               };
            } else {
               if (column.value) {
                  if (typeof column.value == 'function') {
                     td.append(column.value(row));
                  } else {
                     td.val(column.value);
                  }
               } else {
                  td.val(row[column.col]);
               }
            }
         }).reduce((key, col) => ({...key, ...col}), {});
      });
   }

   get_table_values() {
      return this.rows_inputs;
   }

   select_all_visible_rows() {
      object_manage.in_object(this.rows, row => {
         row.val(this.selector_rows.val());
      });
   }
}

export class ListGrid {
   constructor(options) {
      Object.assign(this, options);

      this.make_columns();
      this.table = new Table(this);
   }

   make_columns() {
      this.data_table.columns_title.forEach(column => {
         if (column.col === 'name') {
            column.value = (row) => {
               return elements({
                  props: {
                     class: "list-group-item-title",
                     href: `update?document_name=${row[column.col]}`
                  },
                  content: () => {
                     return row[column.col]
                  }
               }).tag('a');
            }

            column.action_row = {
               action_name: "click",
               action: (row) => {
                  loopar.route = `update?document_name=${row.name}`;
               }
            }
         }
      });

      this.data_table.columns_title.push({
         props: {style: "text-align: center; max-width: 20px;"},
         row_props: {style: "text-align: center;"},
         is_added: true,
         col: 'bull_action',
         element: 'div',
         title: '...',
         value: (row) => {
            return elements({
               props: {
                  class: "btn btn-outline-danger btn-sm"
               },
               content: elements({
                  props: {
                     class: "fas fa-trash-alt"
                  }
               }).tag('i')
            }).button().primary().on('click', () => {
               this.delete_row(row);
               return;
            });
         }
      });

   }

   delete_row(row) {
      modal_dialog({
         title: "Confirm",
         message: `Are you sure you want to delete ${row.name}?`,
         ok: () => {
            http.send({
               action: 'delete',
               params: {document_name: row.name},
               success: (data) => {
                  window.location.reload();
               }
            });
         }
      });
   }

   render() {
      this.table._render();
   }
}