import {HTML} from "/components/base/html.js";

export class Div extends HTML {
   constructor(props, is_ready = true) {
      super(props);

      is_ready && this.make();
   }

   make() {
      super.tag("div");
   }
}

export const div = (options) => {
   return new Div(options)
}