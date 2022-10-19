import {Div} from "/components/elements/div.js";

export class Panel extends Div {
   constructor(props) {
      super(props, false);

      this.make();
   }

   make() {
      super.make();
      this.add_class("card");
   }
}

export const panel = (options) => {
   return new Panel(options);
}