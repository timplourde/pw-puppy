export function ClipboardTimer(clipboard) {
	var self = this,
		timeout = null,
		tickMs = 1000,
		text = null;
	
	self.countdown = ko.observable();
	self.isActive = ko.observable(false);
	
	self.clearClipboardAsync = function() {
		text = clipboard.readText();
		self.countdown(10);
		clearTimeout(timeout);
		self.isActive(true);
		clipboardStatusTick();
	};
  	
	function clipboardStatusTick() {
		self.countdown(self.countdown() - 1);
		if(self.countdown() > 0) {
			timeout = setTimeout(clipboardStatusTick, tickMs);
		} else {
			if(clipboard.readText() === text){
				clipboard.clear();
			}
			clearTimeout(timeout);
			self.isActive(false);
		}
	}
}