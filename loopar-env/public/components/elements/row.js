import {Div} from "/components/elements/div.js";

export class Row extends Div {
   constructor(props) {
      super(props, false);

      this.make();
   }

   make() {
      super.make();

      this.add_class("card-body card-body-row border-top");

      this.body = new Div({wrapper: this, props: {class: 'row'}});

      this.container = this.body;

      this.set_default_class();
   }

   set_default_class() {
      this.designer && this.body.add_class("sub-element element");
   }
}

export const row = (options) => {
   return new Row(options);
}