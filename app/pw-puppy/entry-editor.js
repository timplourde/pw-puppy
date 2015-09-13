/* global ko */

export function EntryEditor(onCancelled) {
  var self = this;
  
  self.props = {
    title : ko.observable(),
    userName: ko.observable(),
    url: ko.observable(),
    password: ko.observable(),
    notes: ko.observable()
  };
  
  self.focusOnTitle = ko.observable(true);
  self.showDeleteButton = ko.observable(false);
  self.showPassword = ko.observable(false);
  self.confirmPassword = ko.observable();
  self.isValidToSave = ko.computed(function() {
    if(!self.showPassword() && self.props.password() !== self.confirmPassword()){
      return false;
    }
    return (self.props.title() || "").length;
  });
  
  self.autoGenPassword = function() {
    var pw = "";
    for(var i=0;i<16;i++){
      pw += String.fromCharCode(getRandomInt(48,122));
    }
    self.props.password(pw);
    self.confirmPassword(pw);
    if(!self.showPassword()){
      self.showPassword(true);
    }
  };
  self.loadModel = function(model) {
    self.props.title(model.title);
    self.props.userName(model.userName);
    self.props.url(model.url);
    self.props.password(model.password);
    self.props.notes(model.notes);  
    self.showDeleteButton(true);
    self.focusOnTitle(true);
    self.showPassword(false);
    self.confirmPassword(model.password);
  };
  self.getModel = function() {
    return ko.toJS(self.props);
  };
  self.new = function() {
    self.props.title(null);
    self.props.userName(null);
    self.props.url(null);
    self.props.password(null);
    self.props.notes(null);  
    self.showDeleteButton(false);
    self.focusOnTitle(true);
    self.showPassword(false);
    self.confirmPassword(null);
  };
  self.save = function() {
    if(self.onSaveCompleted){
      self.onSaveCompleted(self.getModel());
    }
  };
  self.cancel = onCancelled;
  self.toggleShowPassword = function(){
    self.showPassword(!self.showPassword());
  };
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
}