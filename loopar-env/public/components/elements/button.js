import {object_manage} from "/utils/object-manage.js";
import {elements} from "/components/elements.js";
import {HTML} from "/components/base/html.js";

const buttons = {
   link: "btn btn-link",
   info: "btn btn-info",
   default: "btn btn-default",
   primary: "btn btn-primary",
   secondary: "btn btn-secondary",
   success: "btn btn-success"
}

export class Button extends HTML {
   constructor(options) {
      super(options);

      this.make();
      return this.set_type(this.data.type);
   }

   make() {
      const label = this.content ? this.content.label || null : null;
      this.data.label = this.data.label || "Button";

      if (!label) {
         object_manage.assign(this, {
            content: {
               label: elements({content: this.data.label}).tag('span')
            }
         });
      }

      if (this.designer) {
         this.has_title = false;
         super.tag('div');
      } else {
         super.tag('a');
      }

      this.add_class('btn');
   }

   set_type(type='default') {
      this.remove_class(`btn-${this.data.type}`).add_class(`btn-${type}`);
      this.data.type = type;

      return this;
   }

   set_size(size='md') {
      this.remove_class(`btn-${this.data.size}`).add_class(`btn-${size}`);
      this.data.size = size;

      return this;
   }
}

Object.keys(buttons).forEach(button => {
   Object.defineProperties(Button.prototype, {
      [button]: {
         value: function (props) {
            return this.set_type(button);
         }
      }
   });
});

export const button = (options) => {
   options.data = options.data || {};

   return new Button(options);
}