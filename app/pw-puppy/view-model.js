/* global ko */
import { EntryEditor } from './entry-editor';
import { ClipboardTimer } from './clipboard-timer';
import { webCrypto } from './web-crypto';
import { ChangePassword } from './change-password';

export function ViewModel(fs, dialog, clipboard) {
	var self = this,
    fileDialogOptions = { 
      filters: [{
        name: 'pwpuppy', 
        extensions: ['pwpuppy']
      }]
    },
    editorViews = {
       list: "list",
      entry: "entry",
      changePassword: "change-password"
    },
    fakeTimeout = 0,
    thinkInterval;
  
  self.currentKey = null;
  self.currentFileName = ko.observable();
  self.thinkDuration = ko.observable(0);
  self.isThinking = ko.observable(false);
  self.isThinking.subscribe(function(isThinking){
    if(!isThinking){
      clearInterval(thinkInterval);
      return;
    }
    self.thinkDuration(0);
    var start = new Date();
    thinkInterval = setInterval(function() {
      var now = new Date();
      self.thinkDuration( now - start );
    }, 10);
  });
  
  self.currentMode = ko.computed(function() {
    if(self.isThinking() && self.thinkDuration() > 100){
      return "thinking";
    }
    if(self.currentFileName()) {
      return "file-loaded";
    }
    return "file-not-loaded";
  });

   /* file-loaded mode */
  self.pristineModel = ko.observable();
  self.entries = ko.observableArray();
  self.currentModelIndex = null;
  self.currentEditorView = ko.observable(editorViews.list);
  self.searchQuery = ko.observable();
  self.hasEntries = ko.computed(function(){
    return self.entries().length;
  });
  self.filteredEntries = ko.computed(function() {
    var query = (self.searchQuery() || "").trim().toLowerCase(),
        entries = self.entries();
    if(!self.entries().length){
      return entries;
    }
    if(!query.length){
      return entries;
    }
    return ko.utils.arrayFilter(entries, function (en){
      return en.title.toLowerCase().indexOf(query) >= 0;
    });
  });
  self.focusOnSearchQuery = ko.observable(false);
  self.loadListView = function(){
    self.searchQuery(null);
    self.currentEditorView(editorViews.list);
    self.focusOnSearchQuery(true);
  };
  self.entryEditor = new EntryEditor(function(){
    self.loadListView();
  });
  self.clipboardTimer = new ClipboardTimer(clipboard);
  self.passwordChange = new ChangePassword(function(newPassword) {
    if(!newPassword) return;
     webCrypto.generateKeyFromPassword(newPassword)
      .then(function(aesKey){
        self.currentKey = aesKey;
        self.save();
        self.loadListView();
      }).catch(function(){
        dialog.showErrorBox("Could not generate a CryptoKey");
      });
  }, function() {
    self.loadListView();
  });
  self.showPasswordChange = function() {
    self.currentEditorView(editorViews.changePassword);
  };
  self.copyPasswordToClipboard = function(model) {
    if(model && model.password) {
      clipboard.writeText(model.password);
      self.clipboardTimer.clearClipboardAsync();
    }
  };
  self.copyUserNameToClipboard = function(model) {
    if(model && model.userName){
      clipboard.writeText(model.userName);
      self.clipboardTimer.clearClipboardAsync();
    }
  };
  self.hasUnsavedChanges = ko.computed(function(){
    if(!self.currentFileName()){
      return false;
    }
    return ko.toJSON(self.getModel()) !== ko.toJSON(self.pristineModel);
  });
  self.editEntry = function(model) {
    self.currentModelIndex = self.entries().indexOf(model);
    self.entryEditor.loadModel(_.cloneDeep(model));
    self.entryEditor.onSaveCompleted = function(newModel) {
      self.entries()[self.currentModelIndex] = newModel;
      self.entries.valueHasMutated();
      self.loadListView();
    }
    self.currentEditorView(editorViews.entry);
  };
  self.destroyCurrentlySelctedEntry = function(model){
    var modelToRemove = self.entries()[self.currentModelIndex];
    self.entries.remove(modelToRemove);
    self.loadListView();
    self.currentModelIndex = null;
  };
  self.createEntry = function(){
    self.entryEditor.new();
    self.entryEditor.onSaveCompleted = function(newModel) {
      self.entries.push(newModel);
      self.loadListView();
    }
    self.currentEditorView(editorViews.entry);
  };  
  self.loadModel = function(model){
    model = model || { entries: [] };
    self.pristineModel(_.cloneDeep(model));
    self.entries(model.entries);
    self.loadListView();
  };
  self.getModel = function() {
    return {
      entries: ko.toJS(self.entries)
    };
  };
  self.revert = function(){
    if(!self.currentFileName() || !self.pristineModel()){
      return;
    }
    self.entries(self.pristineModel().entries.slice());
  };
  
  /* file-not-loaded mode */
  
  self.newFile = {};
  self.newFile.password = ko.observable();
  self.newFile.confirmPassword = ko.observable();
  self.newFile.isValidToCreate = ko.computed(function(){
    var password = self.newFile.password(),
      confirm = self.newFile.confirmPassword();
      if(!password || !confirm){
        return false;
      }
      return password === confirm;
  });
  
  self.showOpenFilePasswordPrompt = ko.observable(false);
  self.focusOnOpenFilePassword = ko.observable(false);
  self.openFilePassword = ko.observable();
  self.pendingOpenFilePath = ko.observable();

  
  /* file ops */
  self.openFileDialog = function() {
    dialog.showOpenDialog(fileDialogOptions,  function (fileNames) {
        if (fileNames === undefined) return;
        var fileName = fileNames[0]; 
        self.openFile(fileName);
    }); 
  };
  self.createNewFile = function(){
    var newFilePassword = self.newFile.password();
    if(!newFilePassword) return;
    self.isThinking(true);
    webCrypto.generateKeyFromPassword(newFilePassword)
      .then(function(aesKey){
        self.currentKey = aesKey;
        dialog.showSaveDialog(fileDialogOptions, function (fileName) {
          if (fileName === undefined) return;
          self.loadModel();
          self.currentFileName(fileName);
          saveCurrentModel(fileName);
        }); 
      }).catch(function(){
        dialog.showErrorBox("Could not generate a CryptoKey");
        self.isThinking(false);
      });
  };
  self.cancelOpenFile = function(){
      self.showOpenFilePasswordPrompt(false);
      self.openFilePassword(null);
      self.pendingOpenFilePath(null);
  };
  self.openSesame = function(){ 
    if(!self.openFilePassword()) return;
    self.isThinking(true);
    webCrypto.generateKeyFromPassword(self.openFilePassword())
    .then(function(aesKey){
      self.currentKey = aesKey;
      self.openFile(self.pendingOpenFilePath());
      self.showOpenFilePasswordPrompt(false);
      self.openFilePassword(null);
    }).catch(function(){
      self.isThinking(false);
      dialog.showErrorBox("Could not generate a CryptoKey");
    });
  };
  self.openFile = function(filePath){
    if(!self.currentKey){
      self.showOpenFilePasswordPrompt(true);
      self.focusOnOpenFilePassword(true);
      self.openFilePassword(null);
      self.pendingOpenFilePath(filePath);
      return;
    }
    self.isThinking(true);
    
    setTimeout(function(){
      
      fs.readFile(filePath, 'utf-8', function (err, data) {
      var fileData;
      if(err) {
        dialog.showErrorBox("Could not open the file", err.message);
        self.isThinking(false);
      } else {
        
        try {
          fileData = JSON.parse(data);
        } catch(e) {
          dialog.showErrorBox("Could read the file", "Make sure this is a valid .pwmgr file.");
          self.currentKey = null;
        }
        if(!fileData) {
          return;
        }
         
        webCrypto.decryptContent(self.currentKey, fileData)
          .then(function(decryptedString){
            self.currentFileName(filePath);
            var model = JSON.parse(decryptedString);
            self.loadModel(model);
            self.isThinking(false);
            
          })
          .catch(function(e){
            dialog.showErrorBox("Could not decrypt the file", "Your password is probably incorrect.");
            self.currentKey = null;
            self.isThinking(false);
          });
     }
    });
      
    }, fakeTimeout);
    
    
  };
  self.save = function() {
    if(!self.currentFileName()) return;
    saveCurrentModel(self.currentFileName());
  };
  self.saveAs = function(){
     dialog.showSaveDialog(function (fileName) {
      if (fileName === undefined) return;
      saveCurrentModel(fileName);
    }); 
  };
  function saveCurrentModel(filePath){
    if(!self.currentKey) return;
    var model = self.getModel();
    var modelJson = ko.toJSON(model);
    self.isThinking(true);
    
    setTimeout(function(){
    
      webCrypto.encryptContent(self.currentKey, modelJson)
        .then(function(encryptedPayload){
          fs.writeFile(filePath, JSON.stringify(encryptedPayload), function (err) {   
              if(err){
                dialog.showErrorBox("Could not save the file", err.message);
              } else {
                self.pristineModel(model);
                self.currentFileName(filePath);
              }
              self.isThinking(false);
          });
        })
        .catch(function(e){
          self.isThinking(false);
          dialog.showErrorBox("Could not encrypt the file");
        });
    
    }, fakeTimeout);
  
  }
}