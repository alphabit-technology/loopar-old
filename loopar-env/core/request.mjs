'use strict';

export default class Request {
   query = {};

   constructor(request) {
      this.query = request.query;
   }

   param(param) {
      return this.query[param] || null;
   }
}