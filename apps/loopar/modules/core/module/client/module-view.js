'use strict';

import ViewContext from '/context/view-context.js';
import {elements} from '/components/elements.js';
import {Capitalize, avatar} from '/utils/helper.js';

export default class ModuleView extends ViewContext {
   constructor(props) {
      super(props);

      this.#render();
   }

   #render() {
      this.wrapper_container = elements({
         wrapper: this.body_wrapper,
         props: {class: 'row'}
      }).tag("div");

      this.#make_links();
   }

   #make_links() {
      this.rows.forEach(row => {
         const colors = ['pink', 'purple', 'indigo', 'blue', 'cyan', 'teal', 'green', 'orange', 'red', 'gray'];
         const color = colors[Math.floor(Math.random() * colors.length)];
         const action = row.is_single ? (row.type === 'Page' ? 'view' : 'update') : 'index';

         elements({
            wrapper: this.wrapper_container,
            props: {class: "col-lg-4"},
            content: `
                  <div class="card">
                    <div class="card-header border-0">
                      <div class="d-flex justify-content-between align-items-center">
                        <span class="badge bg-muted" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Enabled">
                            <span class="sr-only">Enabled</span>
                            <i class="fa fa-fw fa-check-circle text-teal"></i>
                        </span>
                        <div class="dropdown"  style="display: none;">
                          <button type="button" class="btn btn-icon btn-light" data-toggle="dropdown" aria-expanded="false"><i class="fa fa-ellipsis-v"></i></button>
                          <div class="dropdown-menu dropdown-menu-right">
                            <div class="dropdown-arrow"></div>
                            <a href="#" element="view-list" class="dropdown-item">View List</a>
                            <a href="#" element="add-document" class="dropdown-item">Add ${row.name}</a>
                            <a href="#" element="edit-document" class="dropdown-item">Edit ${row.name}</a>
                            <a href="#" element="delete-document" class="dropdown-item">Remove ${row.name}</a>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="card-body text-center">
                      <a href="/${row.module}/${row.name}/${action}" element="element-${action}" class="tile tile-lg bg-${color} mb-2">${avatar(row.name)}</a>
                      <h5 class="card-title">
                        <a href="page-project.html">${row.name}</a>
                      </h5>
                      
                      <div class="my-3">
                        <div class="avatar-group">
                        </div>
                      </div>
                    </div>
                    <div class="card-footer">
                        <a element="view_list" href="/${row.module}/${row.name}/${action}" class="card-footer-item card-footer-item-bordered card-link">${Capitalize(action === 'index' ? 'View List' : action)}</a>
                        <a element="add" href="/${row.module}/${row.name}/create" class="card-footer-item card-footer-item-bordered card-link" style="${row.is_single ? 'display:none;' : ''}">Add</a>
                    </div>
                  </div>
                `
         }).tag('div');
      });
   }
}