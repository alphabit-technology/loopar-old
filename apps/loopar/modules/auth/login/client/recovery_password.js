//import {loopar} from '/loopar.js';
//const context = await import(`/context/${window['context']}-context.js`);
import LoginContext from '/context/login-context.js';

export default class RecoveryPassword extends LoginContext {
   constructor(props) {
      super(props).implements(this);
   }

   onLogin() {
      console.log("Login");
      this.trigger("onLogin");
   }

   onSave() {
      console.log("sub onSave");
   }

   onShow() {
      console.log("sub Show");
   }

   onLoad() {
      //this.wrapper.css("background-color", "red");
      console.log("sub Load");
   }
}

/*if (request_data) {
    new RecoveryPassword(request_data);
}*/