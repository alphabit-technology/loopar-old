Promise.all([
   import('/loopar.js'),
   import(request_data.route)
]).then(modules => {
   new modules[0].default().initialize().then(() => {
      new modules[1].default(request_data);
   });
});