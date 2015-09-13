export function ChangePassword(onChanged, onCancelled) {
	var self = this;
	self.newPassword = ko.observable();
	self.confirm = ko.observable();
	self.focusOnNewPassword = ko.observable(false);
	self.isValidToCommit = ko.computed(function(){
		var password = self.newPassword(),
		confirm = self.confirm();
		if(!password || !confirm){
			return false;
		}
		return password === confirm;
	});
	self.show = function(){
		self.newPassword(null);
		self.confirm(null);
		self.focusOnNewPassword(true);
	};
	self.cancel = onCancelled;
	self.commit = function() {
		onChanged(self.newPassword());
	};
}