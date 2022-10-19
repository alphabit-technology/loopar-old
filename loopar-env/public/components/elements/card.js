import {elements} from "/components/elements.js";
import {Div} from "./div.js";

export class Card extends Div {
   constructor(props) {
      super(props, false);

      this.make();
   }

   make() {
      super.make()

      this.data = this.data || {};
      this.data.label = this.data.label || "Section";
      this.add_class("card card-fluid");

      this.collapse_icon = elements({
         props: {class: 'fas fa-chevron-up'}
      }).tag('i');

      this.title = elements({
         props: {class: 'mr-2'},
         content: this.data.label
      }).tag('span');

      this.header = elements({
         wrapper: this,
         props: {class: 'card-header'},
         content: elements({
            props: {
               class: 'btn btn-reset',
            },
            content: elements({
               content: {
                  title: this.title,
                  icon: elements({
                     props: {
                        class: 'collapse-indicator mr-2'
                     },
                     content: this.collapse_icon
                  }).tag('span')
               }
            }).tag('h6')
         }).tag('a').on('click', () => {
            this.toggle_hide();
         })
      }).tag('div');

      this.body = elements({
         wrapper: this,
         props: {class: "sub-element card-body collapse show"},
      }).tag("div")//.droppable(true).droppable_actions();

      this.container = this.body;

      this.set_default_class();
   }

   toggle_hide(hide = null) {
      this.is_hide = hide !== null ? hide : !this.is_hide;
      if (this.is_hide) {
         this.body.hide();
         this.collapse_icon.remove_class('fa-chevron-up', true).add_class('fa-chevron-down');
      } else {
         this.body.show();
         this.collapse_icon.remove_class('fa-chevron-down', true).add_class('fa-chevron-up');

      }
   }

   set_default_class() {
      if (this.designer) {
         this.body.add_class("sub-element element");
      }
   }
}

export const card = (options) => {
   return new Card(options);
}