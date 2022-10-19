'use-strict';

const common_props = ['draggable', 'draggable_actions'];
const droppable_props = ['droppable', 'droppable_actions'];

const varchar_len = '(255)';
const [text, long_text, varchar, decimal, int, longint, mediumint, date, date_time, time] =
   ['text', 'longtext', 'varchar', 'decimal', 'int', 'mediumint', 'longint', 'date', 'date_time', 'time'];

export const element_definition = Object.freeze(Object.entries({
   'button': {type: [varchar, varchar_len]},
   'input': {type: [varchar, varchar_len]},
   'password': {type: [varchar, varchar_len]},
   'date': {type: [date, '']},
   'date_time': {type: [date_time, '(6)'], className: 'DateTime'},
   'time': {type: [time, '6']},
   'currency': {type: [decimal, '(18,6)']},
   'integer': {type: [int, '(11)']},
   'decimal': {type: [decimal, '(18,6)']},
   'select': {type: [varchar, varchar_len]},
   'textarea': {type: [long_text, ''], element_name: 'textarea'},
   'text_editor': {type: [long_text, ''], className: 'TextEditor'},
   'markdown': {type: [long_text, '']},
   'checkbox': {type: [int, '(11)']},
   'switch': {element_name: 'switch', type: [int, '(11)']},
   'div': {props: droppable_props,},
   'row': {props: droppable_props},
   'col': {props: droppable_props},
   'table': {},
   'card': {props: droppable_props},
   'panel': {props: droppable_props},
   'form': {props: droppable_props},
   'icon': {},
   'id': {type: [int]}
}).reduce((acc, current) => {
   const props = {props: (current[1].props || []).concat(common_props)};
   const type = {type: current[1].type || []};
   acc[current[0]] = Object.assign({element_name: current[1].element_name || current[0]}, props, type);

   return acc;
}, {}));

export const elements_names = Object.freeze(Object.entries(element_definition).map(([key, value]) => {
   if (!global[key.toUpperCase()]) {
      Object.defineProperty(global, key.toUpperCase(), {
         get: () => value.element_name || key,
         set: () => {
            throw (key + ' is a Safe CONST and cannot be re-declared.')
         }
      });

      return value.name || key;
   }
}));

const manual_elements = Object.freeze({
   //[TAG]: TAG
});

class DataInterface {
   #element = null;

   constructor(element) {
      this.#element = element;
      this.data = Object.assign({}, (element.data || {}), element);
   }

   debug_text(text) {
      return text.replace(/_/g, ' ').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).replace(/\s/g, '');
   }

   /*function to replace underscore with space*/
   replace_underscore(text) {
      return text.replace(/_/g, ' ');
   }

   /*function to replace space with underscore*/
   replace_space(text) {
      return text.replace(/ /g, '_');
   }

   /**function to convert  */

   get value() {
      return this.#element.val ? this.#element.val() : this.#element.value;
   }

   validator_rules() {
      var type = this.#element.element === INPUT ? this.data.format || this.#element.element : this.#element.element;

      type = type.charAt(0).toUpperCase() + type.slice(1);

      if (this['is' + type]) {
         return this['is' + type]();
      }

      return {
         valid: true
      };
   }

   isCurrency() {
      var regex = /^[1-9]\d*(?:\.\d{0,2})?$/;
      return {
         valid: regex.test(this.value),
         message: 'Invalid Currency'
      }
   }

   isEmail() {
      var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return {
         valid: regex.test(this.value),
         message: 'Invalid email address'
      }
   }

   isUrl() {
      var regex = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
      return {
         valid: regex.test(this.value),
         message: 'Please enter a valid URL'
      }
   }

   isPassword() {
      var regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      return {
         valid: true,// regex.test(this.value),
         message: 'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character'
      }
   }

   isDate() {
      var regex = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;
      return {
         valid: regex.test(this.value),
         message: 'Please enter a valid date'
      }
   }

   isTime() {
      var regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      return {
         valid: regex.test(this.value),
         message: 'Please enter a valid time'
      }
   }

   isDateTime() {
      var regex = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;
      return {
         valid: regex.test(this.value),
         message: 'Please enter a valid date and time'
      }
   }

   isPhone() {
      var regex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
      return {
         valid: regex.test(this.value),
         message: 'Please enter a valid phone number'
      }
   }

   isPostalCode() {
      var regex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
      return {
         valid: regex.test(this.value),
         message: 'Please enter a valid postal code'
      }
   }

   isNumber() {
      var regex = /^[0-9]+$/;
      return {
         valid: regex.test(this.value),
         message: 'Please enter a valid number'
      }
   }

   isIn() {
      var regex = /^[0-9]+$/;
      return {
         valid: regex.test(this.value),
         message: 'Please enter a valid number'
      }
   }

   isFloat() {
      var regex = /^[0-9]+$/;
      return {
         valid: regex.test(this.value),
         message: 'Please enter a valid number'
      }
   }

   isAlpha() {
      var regex = /^[a-zA-Z]+$/;
      return {
         valid: regex.test(this.value),
         message: 'Please enter a valid number'
      }
   }

   isAlphaNumeric() {
      var regex = /^[a-zA-Z0-9]+$/;
      return {
         valid: regex.test(this.value),
         message: 'Please enter a valid number'
      }
   }

   isAlphaDash() {
      var regex = /^[a-zA-Z0-9_\-]+$/;
      return {
         valid: regex.test(this.value),
         message: 'Please enter a valid number'
      }
   }

   isAlphaDashSpace() {
      var regex = /^[a-zA-Z0-9_\-\s]+$/;
      return {
         valid: regex.test(this.value),
         message: 'Please enter a valid number'
      }
   }

   validator_required() {

      const required = [true, 'true', 1, '1'].includes(this.data.required);

      return {
         valid: !required || (typeof this.value != "undefined" || (!["null", "undefined"].includes(this.value) && (this.value || "").toString().length > 0)),
         message: `${this.__label()} is required`
      }
   }

   validate() {
      const validator_required = this.validator_required();

      if (!validator_required.valid) {
         return this.#validator_message(validator_required);
      }

      if (this.data.no_validate_type) {
         return {valid: true, message: ''};
      }

      const validator_rules = this.validator_rules();
      validator_rules.message = (validator_rules.message || "") + " in " + this.__label();

      return this.#validator_message(validator_rules);
   }

   #validator_message(validator) {
      const message = `<strong><i class="fa fa-solid fa-angle-right mr-1" style="color: var(--red);"></i><strong>${validator.message}</strong>`

      return {
         valid: validator.valid,
         message: message
      }
   }

   __label() {
      return typeof this.data.label === 'object' ? this.data.label.val() : this.data.label;
   }
}

export const data_interface = (element) => {
   return new DataInterface(element);
}

export const GlobalEnvironment = () => {
   //global.element_definition = element_definition;

   global.VALIDATION_ERROR = {code: 400, title: 'Validation error'};
   global.NOT_FOUND_ERROR = {code: 404, title: 'Not found'};
   global.INTERNAL_SERVER_ERROR = {code: 500, title: 'Internal server error'};
   global.UNAUTHORIZED_ERROR = {code: 401, title: 'Unauthorized'};
   global.FORBIDDEN_ERROR = {code: 403, title: 'Forbidden'};
   global.BAD_REQUEST_ERROR = {code: 400, title: 'Bad request'};
   global.CONFLICT_ERROR = {code: 409, title: 'Conflict'};
   global.NOT_ACCEPTABLE_ERROR = {code: 406, title: 'Not acceptable'};
   global.UNPROCESSABLE_ENTITY_ERROR = {code: 422, title: 'Unprocessable entity'};
   global.SERVICE_UNAVAILABLE_ERROR = {code: 503, title: 'Service unavailable'};
   global.INTERNAL_SERVER_ERROR = {code: 500, title: 'Internal server error'};
   global.NOT_IMPLEMENTED_ERROR = {code: 501, title: 'Not implemented'};
   global.GATEWAY_TIMEOUT_ERROR = {code: 504, title: 'Gateway timeout'};
   global.UNSUPPORTED_MEDIA_TYPE_ERROR = {code: 415, title: 'Unsupported media type'};
   global.LENGTH_REQUIRED_ERROR = {code: 411, title: 'Length required'};
   global.REQUEST_ENTITY_TOO_LARGE_ERROR = {code: 413, title: 'Request entity too large'};
   global.REQUEST_URI_TOO_LONG_ERROR = {code: 414, title: 'Request URI too long'};
}