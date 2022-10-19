import {BaseForm} from '/apps/base-form.js';

export default class InstallerContext extends BaseForm {
   is_desk_app = false;
   context = 'form';

   constructor(options) {
      super(options);

      this.make();
   }

   make(){
      super.make();
      this.render();
   }

   render() {
      super.render();
   }

   async install() {
      await this.send("install");
   }

   async connect() {
      await this.send("connect");
   }
}