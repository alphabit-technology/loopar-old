import {BaseForm} from '/apps/base-form.js';

export default class LoginContext extends BaseForm {
   is_desk_app = false;
   context = 'login';

   constructor(options) {
      super(options);

      this.make();
      this.render();
   }

   make(){
      super.make();
   }

   render() {
      super.render();
   }
}