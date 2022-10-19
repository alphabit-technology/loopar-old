import {Div} from "/components/elements/div.js";

export class Col extends Div {
   constructor(props) {
      super(props, false);

      this.make();
   }

   make() {
      super.make();

      this.add_class("col");
   }
}

export const col = (options) => {
   return new Col(options);
}