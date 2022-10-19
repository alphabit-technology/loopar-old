import FormContext from '/context/form-context.js';

export default class DocumentForm extends FormContext {
   constructor(props) {
      super(props);
   }

   onLoad() {
      /*this.get_field('type').on('change', () => {
         console.log('type changed');
      });*/
   }
}