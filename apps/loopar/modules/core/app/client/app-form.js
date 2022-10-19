'use strict';

import FormContext from '/context/form-context.js';

export default class AppForm extends FormContext {
   constructor(props) {
      super(props);
   }

   async onLoad() {
      this.get_field('autor').disable();
      this.get_field('version').disable();
   }
}