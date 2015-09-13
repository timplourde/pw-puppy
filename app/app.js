
// Browser modules are imported through new ES6 syntax.
import { ViewModel } from './pw-puppy/view-model';

// Node modules are required the same way as always.
var os = require('os'),
	remote = require('remote'),
	fs = require('fs'),
	dialog = remote.require('dialog'),
	clipboard = require('clipboard')

// window.env contains data from config/env_XXX.json file.
var envName = window.env.name,
	os = os.platform();
	
// bootstrap the application
function bootstrap(){
	var vm = new ViewModel(fs, dialog, clipboard);
	window.__vm = vm;
	ko.applyBindings(vm);

	window.onbeforeunload = function(e) {
		if(vm.hasUnsavedChanges()){
			var buttonClicked = dialog.showMessageBox(
			{ 
				message: "Are you sure you want to quit?  You have unsaved changes!", 
				buttons: [
					"Save changes and quit", 
					"Discard changes and quit", 
					"Cancel"] 
			});
			
			if(buttonClicked === 0) {
				vm.save();
			} else if(buttonClicked === 2) {
				e.returnValue = false;
			}
		}
	};
}


export default bootstrap;
//bootstrap();
// 
// document.addEventListener("DOMContentLoaded", function(event) { 
// 	
// 
// });