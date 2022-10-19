import {elements} from "/components/elements.js";
import {loopar} from "/loopar.js";
import {element_manage} from "/components/element-manage.js";

export class Pagination {
   constructor(parent) {
      this.parent = parent;

      this.make_wrapper();
      this.render();
   }

   make_wrapper() {
      this.wrapper = elements({
         props: {class: 'row col align-items-center'},
         wrapper: this.parent.pagination_wrapper,
         content: `
            <div class="col-sm-12 col-md-5">
                <div class="dataTables_info" element='pagination_info_wrapper'>

                </div>
            </div>
            <div class="col-sm-12 col-md-7 d-flex justify-content-end">
                <div class="dataTables_paginate paging_simple_numbers">
                    <ul class="pagination justify-content-center" element = 'pagination_options_wrapper' style="padding-top: 15px;">
                    
                    </ul>
                </div>
            </div>`
      }).div();

      element_manage.make_html_elements(this.wrapper.obj, this);

      this.pagination_previous = this.make_pagination_element('paginate_button page-item previous', 'Previous', () => {
         this.set_page(this.current_page - 1);
      });

      this.pagination_next = this.make_pagination_element('paginate_button page-item next', 'Next', () => {
         this.set_page(this.current_page + 1);
      });
   }

   make_pagination_element(_class, text, e) {
      return elements({
         props: {class: _class},
         content: `<a href="javascript:void(0)" aria-controls="dataTable" class="page-link">${text}</a>`
      }).tag('li').on('click', (obj, event) => {
         event.preventDefault();
         e();
         return false;
      });
   }

   render() {
      this.pagination_info_wrapper.val(this.pagination_info());

      this.pagination_options_wrapper.empty().append(this.pagination_previous);

      this.make_pagination_buttons();

      this.pagination_options_wrapper.append(this.pagination_next);

      this.set_state();
   }

   make_pagination_buttons() {
      for (let i = 1; i <= this.parent.pagination.total_pages; i++) {
         this[`page${i}`] = this.make_pagination_element('paginate_button page-item', i, () => {
            this.set_page(i);
         });
         this.pagination_options_wrapper.append(this[`page${i}`]);
      }
   }

   get current_page() {
      //return this.parent.pagination.current_page || 1
      return parseInt(localStorage.getItem(`${loopar.current_page()}_pagination`) || this.parent.pagination.current_page || 1);
   }

   set current_page(page) {
      if (page < 0) page = this.parent.pagination.total_pages;
      if (page > this.parent.pagination.total_pages) page = 1;

      this.parent.pagination.page = page;
      localStorage.setItem(`${loopar.current_page()}_pagination`, page);
   }

   set_state() {
      const page = this.current_page;

      this.pagination_previous.enable();
      this.pagination_next.enable();

      if (page === 1 || this.parent.pagination.total_pages <= 1) {
         this.pagination_previous.disable();
      }

      if (page >= this.parent.pagination.total_pages || this.parent.pagination.total_pages <= 1) {
         this.pagination_next.disable();
      }

      this[`page${page}`] ? this[`page${page}`].add_class('active') : null;
   }

   set_page(page=this.page || 1) {
      this.current_page = page;
      loopar.route = '?page=' + page;

      this.render();
   }

   pagination_info() {
      const [page, page_size, total_records] = [this.current_page, this.page_size, this.parent.pagination.total_records];
      const initial = (page - 1) * page_size + 1;
      const final = (page * page_size) > total_records ? total_records : (page * page_size);

      return `Showing ${initial} to ${final} of ${total_records} entries`;
   }

   get page_size() {
      return this.parent._data_table.rows.length < this.parent.pagination.page_size ? this.parent._data_table.rows.length : this.parent.pagination.page_size;
   }
}