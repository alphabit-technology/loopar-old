import {col} from "/components/elements/col.js";
import {input} from "/components/elements/input.js";
import {select} from "/components/elements/select.js";
import {icon} from "/components/elements/icon.js";
import {button} from "/components/elements/button.js";
import {text_editor} from "/components/elements/text-editor.js";
import {markdown} from "/components/elements/markdown.js";
import {row} from "/components/elements/row.js";
import {card} from "/components/elements/card.js";
import {panel} from "/components/elements/panel.js";
import {Elements} from "./elements";

export class DesignedElements extends Elements {
   constructor(options) {
      super(options);
   }

   [ICON]() {
      this.element = ICON;
      return icon;
   }

   [BUTTON]() {
      this.element = BUTTON;
      return button(this);
   }

   [COL]() {
      this.element = COL;
      return col(this);
   }

   [ROW]() {
      this.element = ROW;
      return row(this);
   }

   [CARD](container = null) {
      this.element = CARD;
      return card(this, container);
   }

   [PANEL](container = null) {
      this.element = PANEL;
      return panel(this, container);
   }

   [FORM]() {
      this.element = FORM;
      return form(this.make_element({
         content: {
            header: elements({
               content: '<h5 class="card-title">Form</h5>'
            }).div(),
            footer: elements({
               props: {class: "card-footer"},
               content: new Button({
                  props: {
                     type: "submit"
                  },
                  content: "Submit"
               }).primary()
            }).div()
         }
      }).card(this));
   }

   [TABLE](data = null) {
      this.element = TABLE;
      this.data_table = data;
      return new Table(this);
   }

   [CHECKBOX]() {
      this.element = CHECKBOX;
      return input(this, 'input', 'checkbox');
   }

   [SELECT]() {
      this.element = SELECT;
      return select(this, 'select', 'select');
   }

   [SWITCH]() {
      this.element = SWITCH;
      return input(this, 'input', 'switch');
   }

   [PASSWORD]() {
      this.element = PASSWORD;
      return input(this, 'input', 'password');
   }

   [DATE]() {
      this.element = DATE;
      return input(this, 'input', 'input');
   }

   [DATE_TIME]() {
      this.element = DATE_TIME;
      return input(this, 'input', 'input');
   }

   [TIME]() {
      this.element = TIME;
      return input(this, 'input', 'input');
   }

   [INPUT]() {
      this.element = INPUT;
      return input(this, 'input');
   }

   [CURRENCY]() {
      return input(this, 'input');
   }

   [INTEGER]() {
      this.element = INTEGER;
      return input(this, 'input');
   }

   [DECIMAL]() {
      this.element = DECIMAL;
      return input(this, 'input');
   }

   [TEXTAREA]() {
      this.element = TEXTAREA;
      return input(this, 'textarea', 'input');
   }

   [TEXT_EDITOR]() {
      this.element = TEXT_EDITOR;
      return text_editor(this);
   }

   [MARKDOWN]() {
      this.element = MARKDOWN;
      return markdown(this);
   }
}

export const designed_elements = (element) => {
   return new Elements(element);
}