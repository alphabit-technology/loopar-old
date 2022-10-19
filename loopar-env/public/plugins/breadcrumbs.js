import {Capitalize} from "/utils/helper.js";
import {loopar} from "/loopar.js";
import {elements} from "/components/elements.js";

export class Breadcrumbs {
   constructor(header) {
      this.header = header;
      this.__DOCTYPE__ = header.__DOCTYPE__;
      this.context = header.context;

      this.make();
   }

   make() {
      this.title = elements({
         wrapper: this.header.breadcrumbs_wrapper,
         props: {
            class: "breadcrumb"
         }
      }).tag('ol');

      const make_link = (text, link = null, has_icon = false) => {
         const item = elements({
            wrapper: this.title,
            props: {
               class: "breadcrumb-item"
            },
            content: `<a href="javascript:void(0)">${has_icon ? '<i class="breadcrumb-icon fa fa-angle-left mr-2 disabled"></i>' : ''}${text}</a>`
         }).tag('li');

         if (link) {
            item.on('click', () => {
               if (link) {
                  loopar.route = link
               }
            });
         }
      }

      if (this.__DOCTYPE__.module) {
         const text = Capitalize(this.context === 'module' ? 'Home' : this.__DOCTYPE__.module);
         const link = this.context === 'module' ? '/' : `/${this.__DOCTYPE__.module}`;

         make_link(text, link, true);
      }

      if (this.__DOCTYPE__.name && this.context !== 'module' && !this.__DOCTYPE__.is_single) {
         make_link(Capitalize(this.__DOCTYPE__.name), `/${this.__DOCTYPE__.module}/${this.__DOCTYPE__.name}/index`);
      }

      if (this.header.parent.action) {
         make_link(this.context === 'module' ? this.header.parent.module_group : this.header.parent.action);
      }
   }
}