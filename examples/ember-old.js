App.GoogleFile = Ember.Object.extend({
});

App.ApplicationRoute = Ember.Route.extend({

  model: function(){
    var model = App.GoogleFile.create({
      id: $('meta[name="google-folder-id"]').attr('content'),
      children: Ember.ArrayProxy.create({content: []})
    });
    this.loadChildren(model.get('children'));
    return model;
  },

  afterModel: function(transition){
    if(transition.targetName == "application.index"){
      this.wait(model.get('children'), function(){
        this.transitionTo('anotherPlace');
      });
    }
  },

  // Waiting for content to load using a timer.
  wait: function(children, callback){
    if(Ember.isEmpty(children)){
      Ember.run.later(this, function () {
        this.wait(children);
      }, 10);
    } else {
      callback(children);
    }
  },

  loadChildren: function(node){
    var token = $('meta[name="google-access-token"]').attr('content');
    var query = encodeURIComponent('"' + node.get('id') + '" in parents');
    $.get('https://www.googleapis.com/drive/v2/files?q=' + query + '&access_token=' + token, function(data){
      data.items.forEach(function(item){
        var f = App.GoogleFile.create({
          name: item.title,
          id: item.id,
          icon: item.iconLink,
          mime: item.mimeType,
          embed: item.embedLink,
          edit: item.alternateLink,
          children: Ember.ArrayProxy.create({content: []})
        });
        if(item.mimeType === "application/vnd.google-apps.folder"){
          this.loadChildren(f);
        }
        node.get('children').pushObject(f);
      }.bind(this));
    }.bind(this));
  }

});