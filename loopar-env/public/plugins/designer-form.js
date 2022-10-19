import {elements} from "/components/elements.js";
import {DesignElement} from "/components/design-elements.js";
import {loopar} from "/loopar.js";
import {SidebarContainer} from "/plugins/base/sidebar-container.js";

export class DesignerForm extends SidebarContainer {
   preview = true;

   constructor(parent) {
      super(parent);

      this.make_wrapper();
      this.make_elements();
   }

   make_wrapper() {
      this.action.on('click', () => {
         this.toggle();
      }).val("<span class='oi oi-brush mr-1'></span>Design");

      this.layout_elements = elements({
         wrapper: this.body,
         content: elements({
            props: {style: "width: 90%;"},
            content: "Layout Elements"
         }).tag('h4')
      }).row();

      this.form_elements = elements({
         wrapper: this.body,
         content: elements({
            props: {style: "width: 90%;"},
            content: "Form Elements"
         }).tag('h4')
      }).row();
   }

   make_elements() {
      Object.entries({
         layout_elements: [CARD, PANEL, ROW, COL],
         form_elements: [INPUT, PASSWORD, TEXTAREA, TEXT_EDITOR, MARKDOWN, SELECT, DATE, DATE_TIME, TIME, CHECKBOX, SWITCH, BUTTON, TABLE]
      }).forEach(([layout, elements]) => {
         elements.forEach(el => {
            window['element' + el] = 0;
            new DesignElement({
               toElement: el,
               wrapper: this[layout],
            });
         });
      });
   }

   toggle() {
      this.preview = !this.preview;
      this.action.val(`<span class="oi oi-${!this.preview ? 'eye' : 'brush'} mr-1"></span>${!this.preview ? 'Preview' : 'Design'}`);

      if (this.preview) {
         loopar.body.remove_class("true");
      } else {
         loopar.body.add_class("true");
      }
   }
}