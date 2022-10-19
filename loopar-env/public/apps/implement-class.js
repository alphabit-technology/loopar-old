export class ImplementClass {
   constructor(props) {
      Object.assign(this, props);
   }

   trigger(event) {
      event = `on${event.charAt(0).toUpperCase()}${event.slice(1)}`;

      if (this[event] && typeof this[event] === 'function') {
         this[event](this);
      }
   }

   reload_data(data) {
      Object.assign(this, data);
      this.trigger('reload');
   }
}