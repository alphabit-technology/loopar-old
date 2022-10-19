import {Div} from "/components/elements/div.js";
import {Col} from "/components/elements/col.js";
import {Row} from "/components/elements/row.js";
import {Card} from "/components/elements/card.js";
import {Panel} from "/components/elements/panel.js";
import {Switch, Checkbox, Date, DateTime, Input, Password, TextArea, Time} from "/components/elements/input.js";
import {Select} from "/components/elements/select.js";
import {Icon} from "/components/elements/icon.js";
import {Button} from "/components/elements/button.js";
import {TextEditor} from "/components/elements/text-editor.js";
import {Markdown} from "/components/elements/markdown.js";
import {HTML} from "/components/base/html.js";

export class Elements{
   constructor(options) {
      Object.assign(this, options);

      if(this.obj){
         return new HTML(this);
      }
   }

   tag(tag_name){
      return new HTML(this).tag(tag_name);
   }

   /**Only decorative**/
   div(){}
   col(){}
   row(){}
   card(){}
   panel(){}
   button(){}
   input(){}
   password(){}
   textarea(){}
   select(){}
   icon(){}
   text_editor(){}
   markdown(){}
   checkbox(){}
   switch(){}
   date(){}
   date_time(){}
   time(){}
   /**Only Decorative*/
}

const classes = {
   [DIV]: Div,
   [COL]: Col,
   [SWITCH]: Switch,
   [CHECKBOX]: Checkbox,
   [DATE]: Date,
   [DATE_TIME]: DateTime,
   [TIME]: Time,
   [INPUT]: Input,
   [PASSWORD]: Password,
   [TEXTAREA]: TextArea,
   [SELECT]: Select,
   [ICON]: Icon,
   [BUTTON]: Button,
   [TEXT_EDITOR]: TextEditor,
   [ROW]: Row,
   [CARD]: Card,
   [PANEL]: Panel,
   [MARKDOWN]: Markdown
}

Object.entries(classes).forEach(([element, classInstance]) => {
   Object.defineProperties(Elements.prototype, {
      [element]: {
         value: function () {
            this.element = element;
            return new classInstance(this);
         }
      }
   });
});


export const elements = (element) => {
   return new Elements(element);
}
