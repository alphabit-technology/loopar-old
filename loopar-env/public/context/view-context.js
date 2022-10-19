import {BaseApp} from "/apps/base-app.js";

export default class ViewContext extends BaseApp {
   has_header = true;
   context = 'view';

   constructor(options, make = true) {
      super(options);

      make && this.make()
   }

   make() {
      super.make();
      super.render()
   }
}