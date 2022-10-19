import {elements} from "/components/elements.js";
import {ListGrid} from "/components/elements/table.js";
import {BaseApp} from "/apps/base-app.js";

export default class ListContext extends BaseApp {
   has_header = true;
   context = 'index';

   constructor(options) {
      super(options);

      super.make();
      this.make_table();
   }

   make_columns_title() {
      this.columns_title = this.fields.map((value, index) => {
         return {col: value, title: this.labels[index], element: "div"}
      });
   }

   make_table() {
      this.make_columns_title();

      const page_section = elements({
         wrapper: this.body_wrapper,
         props: {class: 'card', style: 'height: 95%;'},
         content: {
            body: elements({props: {class: 'card-body'}}).tag("div"),
            footer: elements({props: {class: 'card-footer'}}).tag("div")
         }
      }).tag("div");

      this.list_grid = new ListGrid({
         wrapper: page_section.body,
         data_table: {
            columns_title: this.columns_title,
            rows: this.rows
         },
         editable: false,
         pagination: this.pagination,
         pagination_wrapper: page_section.footer,
      });
   }

   render() {
      if (this.list_grid) {
         this.list_grid.data_table.rows = this.rows
         this.list_grid.pagination = this.pagination;

         this.list_grid.render();
      }
   }

   onReload() {
      this.render();
   }

   onShow() {

   }

   reload(){
      this.reload_from_owner_url = true;
      this.source_url.query = `page=${this.list_grid.table.pagination.page || 1}`;
      this.source_url.search = `?${this.source_url.query}`;
      super.reload();
   }
}