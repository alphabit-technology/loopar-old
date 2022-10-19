import {DefaultInput} from "/components/base/default-input.js";
import {DefaultCheckbox} from "/components/base/default-checkbox.js";

export class Input extends DefaultInput {
   constructor(props) {
      super(props);

      this.make();
   }

   make() {
      super.make();
   }
}

export class Password extends DefaultInput {
   input_type = 'password';

   constructor(props) {
      super(props);

      this.make();
   }

   make() {
      super.make();
      this.input.attr("type", this.input_type);
   }
}

export class TextArea extends DefaultInput {
   input_tag_name = 'textarea';

   constructor(props) {
      super(props);

      this.make();
   }

   make() {
      super.make();

      this.input.attr("rows", 4);
   }
}

export class Checkbox extends DefaultCheckbox {
   constructor(props) {
      super(props);

      this.make();
   }

   make() {
      super.make();
   }
}

export class Switch extends DefaultCheckbox {
   constructor(props) {
      super(props);

      this.make();
   }

   make() {
      super.make();
   }
}

export class Date extends DefaultInput {
   constructor(props) {
      super(props);

      this.make();
   }

   make() {
      super.make();

      new dtsel.DTS(this.input.obj, {
         direction: 'BOTTOM',
         showTime: false,
         showDate: true
      });
   }
}

export class DateTime extends DefaultInput {
   constructor(props) {
      super(props);

      this.make();
   }

   make() {
      super.make();

      new dtsel.DTS(this.input.obj, {
         direction: 'BOTTOM',
         showTime: true,
         showDate: true
      });
   }
}

export class Time extends DefaultInput {
   constructor(props) {
      super(props);

      this.make();
   }

   make() {
      super.make();

      new dtsel.DTS(this.input.obj, {
         direction: 'BOTTOM',
         showTime: true,
         showDate: false
      });
   }
}

export const input = (options) => {
   return new Input(options);
}

export const checkbox = (options) => {
   return new Checkbox(options);
}

/*export const _switch = (options) => {
   return new Switch(options);
}*/

export const password = (options) => {
   return new Password(options);
}

export const text_area = (options) => {
   return new TextArea(options);
}

export const date = (options) => {
   return new Date(options);
}

export const date_time = (options) => {
   return new DateTime(options);
}

export const time = (options) => {
   return new Time(options);
}