import {HTML} from "./html.js";

export class Maker extends HTML {
      constructor(props, is_ready = true){
         super(props);

         if(is_ready){
            this.make();
         }
      }

      make(){
         super.tag(this.tag_name || this.element);
         /*this.make_element();
         this.make_children();
         this.make_attributes();
         this.make_classes();
         this.make_styles();
         this.make_events();*/
      }

      /*make_element(){
         this.element = document.createElement(this.props.tag_name);
      }

      make_children(){
         if(this.props.children){
               this.props.children.forEach(child => {
                  this.element.appendChild(child);
               });
         }
      }

      make_attributes(){
         if(this.props.attributes){
               for(let key in this.props.attributes){
                  this.element.setAttribute(key, this.props.attributes[key]);
               }
         }
      }

      make_classes(){
         if(this.props.classes){
               this.props.classes.forEach(class_name => {
                  this.element.classList.add(class_name);
               });
         }
      }

      make_styles(){
         if(this.props.styles){
               for(let key in this.props.styles){
                  this.element.style[key] = this.props.styles[key];
               }
         }
      }

      make_events(){
         if(this.props.events){
               for(let key in this.props.events){
                  this.element.addEventListener(key, this.props.events[key]);
               }
         }
      }*/
}