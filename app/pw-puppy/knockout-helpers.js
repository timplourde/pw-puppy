/* global ko */
export function initKnockoutHelpers() {
    ko.bindingHandlers.dragFile = {
        init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            var handler = valueAccessor(),
                    className = "pending-drop";
            if(!handler){
                return;
            }
            element.className = element.className || "";
            element.ondragover = function () {
                if(this.className.indexOf(className) === -1){
                    this.className = this.className + ' pending-drop';
                }
                    return false;
                };
                element.ondragleave = element.ondragend = function () {
                    this.className = this.className.replace(className, "");
                    return false;
                };
                element.ondrop = function (e) {
                    this.className = this.className.replace(className, "");
                    e.preventDefault();
        
                    var file = e.dataTransfer.files[0];
                    handler(file.path);
                };
            }
        };
        ko.bindingHandlers.enterkey = {
            init: function (element, valueAccessor, allBindings, viewModel) {
                var callback = valueAccessor();
                element.addEventListener('keyup', function(e) {
                    if ((e.keyCode || e.which) == 13) {
                        callback.call(viewModel);
                        return false;
                    }
                    return true;
                });
            }
        };
}