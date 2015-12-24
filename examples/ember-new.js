App = Ember.Application.create({
});

App.GoogleFile = Ember.Object.extend({
});

App.ApplicationRoute = Ember.Route.extend({

  model: function(){
    var model = App.GoogleFile.create({
      id: $('meta[name="google-folder-id"]').attr('content'),
      children: Ember.ArrayProxy.create({content: []})
    });

    return new Ember.RSVP.Promise(function(resolve, reject){
      this.loadChildren(model, resolve, reject);
    }.bind(this));
  },

  // The afterModel won't fire until the promise is fullfilled.
  afterModel: function(transition){
    if(transition.targetName == "application.index"){
      this.transitionTo('anotherPlace');
    }
  },

  loadChildren: function(node, resolve, reject){
  var token = $('meta[name="google-access-token"]').attr('content');
    var query = encodeURIComponent('"' + node.get('id') + '" in parents');
    // Don't resolve the promise when the ajax call returns. We have to process the data and decide if we need to make more calls.
    $.get('https://www.googleapis.com/drive/v2/files?q=' + query + '&access_token=' + token, function(data){
      var promises = [];
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
          // We need to make more ajax calls. Create a new promise which can be resposible for
          // resolving existing promises once it is fullfilled.
          var promise = new Ember.RSVP.Promise(function(resolve, reject){
            this.loadChildren(f, resolve, reject);
          }.bind(this));
          promises.push(promise);
        }
        node.get('children').pushObject(f);
      }.bind(this));

      Promise.all(promises).then(function(){
        resolve(node);
      });

    }.bind(this));
  }

});