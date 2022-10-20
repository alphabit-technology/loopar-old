
'use strict';

import ViewContext from '/context/view-context.js';
import {elements} from "/components/elements.js";
import {loopar} from "/loopar.js";
import {modal_dialog} from '/utils/modal-dialog.js';
import {Capitalize, avatar} from '/utils/helper.js';


export default class AppManagerView extends ViewContext {
    constructor(props){
        super(props, false);

        this.make();
    }

    make(){
        super.make();
        this.wrapper_container = elements({
            wrapper: this.body_wrapper,
            props: {class: 'row'}
        }).tag("div");

        this.#make_links();
    }

    #make_links() {
        this.apps.forEach(app => {
            const action = app.is_single ? (app.type === 'Page' ? 'view' : 'update') : 'index';
            const installed_message = app.installed ? "Installed" : "Uninstalled";
            //const icon_installed = app.installed ? "fa fa-check-circle text-teal" : "oi oi-fork text-danger";

            const app_name = elements({
                wrapper: this.wrapper_container,
                props: {class: "col-lg-4"},
                content: `
                  <div class="card">
                    <div class="card-header border-0">
                      <div class="d-flex justify-content-between align-items-center">
                        <span class="badge bg-muted" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="${installed_message}">
                            <span class="sr-only">${installed_message}</span>
                            <i class="fa fa-fw fa-check-circle text-${app.installed ? 'teal' : 'red'}"></i>
                        </span>
                      </div>
                    </div>
                    <div class="card-body text-center">
                      <a href="#" element="element-${action}" class="tile tile-lg bg-${app.installed ? 'purple' : 'red'} mb-2">${avatar(app.name)}</a>
                      <h5 class="card-title">
                        <a href="#">${Capitalize(app.name)}</a>
                      </h5>
                      
                      <p class="card-subtitle text-muted"> ${app.info} </p>
                    </div>
                    <div class="card-footer">
                        <div class="card-footer-item">
                          <button type="button" element="install" class="btn btn-reset text-nowrap text-muted">
                            <i element="install-icon"></i>
                            <label element="install-label">${app.installed ? 'Installed' : 'Install'}</label>
                          </button>
                        </div>
                        <div class="card-footer-item">
                          <button type="button" element="update" class="btn btn-reset text-nowrap text-muted">
                            <i class="oi oi-loop-circular text-warning"></i>
                            <label>Update ${app.installed && app.installed_version !== app.version ? app.version : ""}</label>
                          </button>
                        </div>
                      </div>
                  </div>
                `
            }).tag('div');

            const [install, update, install_icon, install_label] = [app_name.install, app_name.update, app_name.install_icon, app_name.install_label];

            install.on('click', (obj, event) => {
                event.preventDefault();
                this.send_app_action(app.name, app.installed ? 'uninstall' : 'install');
            });

            update.on('click', (obj, event) => {
                event.preventDefault();

                this.send_app_action(app.name, 'update');
            });

            if(app.installed) {
                console.log([app.version === app.installed_version])
                app.version === app.installed_version ? update.disable() : update.enable();
                install_icon.remove_class('oi oi-fork text-warning', true).add_class('fa fa-trash text-danger');
                install_label.val('Uninstall');

                if(app.name === "loopar") {
                    app_name.install.disable();
                }
            }else{
                install_icon.remove_class('fa fa-trash text-danger', true).add_class('oi oi-fork text-warning');
                install_label.val('Install');
                app_name.update.disable();
            }
        });
    }

    send_app_action(app_name, action){
        const send = () => {
            loopar.http.send({
                action: `/core/loopar/${action}`,
                params: {app_name: app_name, installing: true},
                body: {app_name},
                success: r => {
                    if (r.content && r.content.success) {
                        modal_dialog({
                            title: "Success",
                            message: r.content.data,
                            on_close: () => {
                                window.location.reload();
                            }
                        });
                    }
                },
                error: r => {
                    console.log(r);
                }
            });
        };

        modal_dialog({
            title: "Confirm",
            message: `Are you sure you want to ${action} ${app_name}?`,
            ok: () => {
                send();
            }
        });
    }
}