(function(App) {

  'use strict';

  App.Model.Dataset = App.Core.Model.extend({

    urlRoot: App.globals.apiUrl + 'dataset/',

    parse: function(data) {
      data = data.data || data;
      return _.extend({}, { id: data.id }, data.attributes);
    },

    getDatasetData: function() {
      var self = this;
      return $.get(App.globals.apiUrl + self.get('widget')[0].attributes.queryUrl).done(function(data) {
        self.set('data', data.data);
      });
    },

    default: {
      "id": null,
      "name": null,
      "data_path": null,
      "attributes_path": null,
      "provider": null,
      "format": null,
      "connector_url": null,
      "table_name": null,
      "cloned_host": {
        "host_provider": null,
        "host_url": null,
        "host_id": null,
        "host_type": null,
        "host_path": null
      },
      "meta": {
        "status": null,
        "updated_at": null,
        "created_at": null,
        "rows": null
      }
    }
  });

}).call(this, this.App);
