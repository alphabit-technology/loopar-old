import {server} from "./core/server.js";
import {loopar} from "./core/loopar.js";
import {document_manage} from "./core/document/document-manage.js";
import BaseDocument from "./core/document/base-document.js";
import {file_manage} from "./core/file-manage.js";
import BaseController from "./core/controller/base-controller.js";
import * as Helpers from "./core/helper.js";

export {
   loopar,
   server,
   document_manage,
   BaseDocument,
   BaseController,
   file_manage,
   Helpers
};

await server.initialize()