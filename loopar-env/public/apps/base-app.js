import {ImplementClass} from "/apps/implement-class.js";

import {object_manage} from "/utils/object-manage.js";
import {elements} from "/components/elements.js";
import {loopar} from '/loopar.js';
import {Sidebar} from "/plugins/sidebar.js";
import {Header} from "/plugins/header.js";
import {http} from "/utils/http.js";
import {modal_dialog} from '/utils/modal-dialog.js';
import {value_is_true} from "/utils/helper.js";

import {element_definition} from "/element-definition.js";

export class BaseApp extends ImplementClass {
   has_header = false;
   has_sidebar = true;
   has_footer = false;
   is_desk_app = true;
   has_options = true;

   #header_wrapper = null;
   #body_wrapper = null;
   #footer_wrapper = null;
   reload_from_owner_url = false;

   constructor(options) {
      super(options);
      request_data = null;

      this.#set_global_name();

      setTimeout(() => {
         this.trigger('load');
      }, 0);
   }

   make_footer() {
      this.#footer_wrapper = elements({
         wrapper: this.container, props: {class: 'message-footer'}
      }).tag("div");
   }

   make() {
      if (this.is_desk_app) {
         this.wrapper = elements({
            wrapper: loopar.wrapper,
            props: {class: 'page'}
         }).tag("div");

         if (this.has_sidebar) this.sidebar = new Sidebar(this);

         this.make_container();
         this.make_footer();
      } else {
         this.wrapper = elements({
            wrapper: loopar.wrapper,
         }).tag("div");
      }

      this.container = elements({wrapper: this.body_wrapper}).tag("div");

      setTimeout(() => {
         this.show();
      }, 0);
   }

   render() {
      this.container.fields = {};

      const render_element = (element, wrapper) => {
         if (element.element) {
            Object.assign(element, {props: element.props || {}}, {wrapper: wrapper, title: element.element});

            const e = element.element.split('.')[0];
            const el = elements(element)[e]();

            if (el) {
               if (element.data) {
                  const data = clone(element.data);

                  if (el.is_writeable || el.element === TABLE) {
                     if (el.element === TABLE) {
                        this.container.fields[data.name] = el.rows_inputs;
                     } else {
                        /*if (data.name === "module") {
                            this[data.name] = el;
                        }*/

                        this.container.fields[data.name] = el;
                     }
                  } else {
                     this[data.name] = el;
                     if (el.element === BUTTON && el.data.action) {
                        if (this[el.data.action] && typeof this[el.data.action] === 'function') {

                           el.on('click', (obj, event) => {
                              event.preventDefault();
                              event.stopPropagation();

                              this[el.data.action](this);
                           });
                        }
                     }
                  }

                  if (element.element === 'card') {
                     el.toggle_hide(value_is_true(data.collapsed));
                  }
               }

               if (el.elements) object_manage.in_object(el.elements, e => {
                  render_element(e, el);
               });

               el.apply_properties();
            }
         }
      }

      /** RENDER DOCTYPE */
      const data = this.__DOCTYPE__.STRUCTURE;
      data.forEach(element => {
         render_element(element, this.container);
      });

      if (this.doc_designer) {
         this.doc_designer.add_class("element").body.add_class("element droppable").droppable().droppable_actions();
         this.doc_designer.parentWrapper = this;
      }
      /** RENDER DOCTYPE */

      if (this.__DOCUMENT__ && Object.keys(this.__DOCUMENT__).length > 0) {
         this.load_document();
      }
   }

   make_container() {
      const container = elements({
         wrapper: this.wrapper,
         props: {
            class: 'page-inner page-inner-fill',
            style: 'margin-right: unset;'
         }
      }).tag("div");

      const body = elements({
         wrapper: container,
         props: {class: 'message'}
      }).tag("div");

      this.#header_wrapper = elements({
         wrapper: body,
         props: {
            class: 'message-header',
            style: 'width: 200%;'
            //style: 'height: auto;'
         }
      }).tag("div");

      this.header = new Header(this);

      this.#body_wrapper = elements({
         wrapper: body,
         props: {class: 'message-body'}
      }).tag("div");
   }

   make_header() {

   }

   showError(error) {
      modal_dialog({
         title: error.title || 'Error',
         message: error.message || 'Unknown error',
      });
   }

   showMessage(message) {
      this.#footer_wrapper.innerHTML = message;
   }

   get header_wrapper() {
      return this.#header_wrapper || this.wrapper;
   }

   get body_wrapper() {
      return this.#body_wrapper || this.wrapper;
   }

   get footer_wrapper() {
      return this.#footer_wrapper || this.wrapper;
   }

   #set_global_name() {
      const name = loopar.current_page(this.url);
      if (name) loopar[name] = this;
   }

   show() {
      if (loopar.last_document_loaded) {
         loopar.last_document_loaded.hide();
      }
      loopar.last_document_loaded = this;

      this.wrapper.show();

      this.trigger('show');
   }

   hide() {
      this.wrapper.hide();
      this.trigger('hide');
   }

   clear() {
      this.wrapper.empty();
      this.trigger('clear');
   }

   reload() {
      const url = this.reload_from_owner_url && this.source_url ? this.source_url : window.location;
      http.send({
         action: url.pathname || window.location.pathname,
         params: url.search || window.location.search,
         success: r => {
            super.reload_data(r.content);
            this.show();
         },
         error: r => {
            //reject(r);
         }
      });
   }
}