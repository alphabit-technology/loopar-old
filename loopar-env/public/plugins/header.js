import {Capitalize} from "/utils/helper.js";
import {elements} from "/components/elements.js";
import {loopar} from "/loopar.js";
import {Breadcrumbs} from "/plugins/breadcrumbs.js";

export class Header {
   constructor(parent) {
      this.parent = parent;
      this.__DOCTYPE__ = parent.__DOCTYPE__;
      this.__DOCUMENT__ = parent.__DOCUMENT__;
      this.context = parent.context;

      this.make();
   }

   make() {
      this.header = elements({
         wrapper: this.parent.header_wrapper,
         props: {
            class: "page-navs shadow-sm pr-3",
            style: "padding-left: 1rem; margin-bottom: unset;"
         }
      }).tag('header');

      this.make_title();
   }

   make_title() {
      this.title_wrapper = elements({
         wrapper: this.header,
         props: {
            class: "account-summary"
         }
      }).div();

      elements({
         wrapper: this.header,
         props: {
            class: "btn-account"
         },
         content: this.title_wrapper
      }).tag('div');

      const title = this.parent.title || this.context === 'module' ? this.parent.module_group :
         (['index', 'view'].includes(this.context) || this.parent.action === 'create') ? this.__DOCTYPE__.name : this.__DOCUMENT__.name;

      elements({
         wrapper: this.title_wrapper,
         props: {
            class: "card-title"
         },
         content: Capitalize(title || this.__DOCTYPE__.name)
      }).tag("h1");

      this.breadcrumbs_wrapper = elements({
         wrapper: this.title_wrapper,
         props: {
            class: "card-subtitle text-muted"
         }
      }).tag("h6");

      this.breadcrumbs = new Breadcrumbs(this);
      if (this.context !== 'module') this.make_actions();
   }

   make_actions() {
      this.actions_wrapper = elements({
         wrapper: this.header,
         props: {
            class: "ml-auto",
            style: "position: fixed; right: 0;"
         }
      }).div();

      if (this.context === 'form') {
         elements({
            wrapper: this.actions_wrapper,
            props: {
               class: "btn btn-primary",
               tabindex: "0",
               type: "button"
            },
            content: elements({content: `Save ${this.__DOCTYPE__.name}`}).tag('span')
         }).tag('button').on('click', () => {
            this.parent.save();
         });

         if (this.__DOCUMENT__.name && this.__DOCTYPE__.name === 'Document') {
            elements({
               wrapper: this.actions_wrapper,
               props: {
                  class: "btn btn-success",
                  tabindex: "0",
                  type: "button",
               },
               content: elements({content: `Go to ${Capitalize(this.__DOCUMENT__.name)}`}).tag('span')
            }).tag('button').on('click', () => {
               if (this.__DOCUMENT__.name) {
                  loopar.route = `/${this.__DOCUMENT__.module}/${this.__DOCUMENT__.name}/${this.__DOCUMENT__.is_single ? 'update' : 'index'}`;
               }
            });
         }
      }

      if (this.context === 'index') {
         elements({
            wrapper: this.actions_wrapper,
            props: {
               class: "btn btn-success",
               tabindex: "0",
               type: "button",
            },
            content: elements({content: `Create ${Capitalize(this.__DOCTYPE__.name)}`}).tag('span')
         }).tag('button').on('click', () => {
            loopar.route = 'create';
         });
      }

      if (this.parent.has_sidebar) {
         elements({
            wrapper: this.actions_wrapper,
            props: {
               class: "btn btn-secondary",
               tabindex: "0",
               type: "button"
            },
            content: '<span class="fa fa-bars"></span>'
         }).tag("button").on('click', () => {
            this.parent.sidebar.toggle();
         });
      }
   }
}