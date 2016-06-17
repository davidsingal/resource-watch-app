(function(App) {

  'use strict';

  App.View.Map = App.Core.View.extend({

    tagName: 'div',

    className: 'map',

    props: {
      map: {
        center: [40, -3],
        zoom: 2,
        maxZoom: 19,
        minZoom: 2,
        scrollWheelZoom: false,
        zoomControl: false
      },
      basemap: 'dark',
      disableZoomControls: false,
      basemapsList: {
        light: {
          url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
          options: {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            subdomains: 'abcd',
            maxZoom: 19
          }
        },
        dark: {
          url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
          options: {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            subdomains: 'abcd',
            maxZoom: 19
          }
        }
      },
      cartoDBAttribution: 'CartoDB <a href="https://cartodb.com/attributions" target="_blank">attribution</a>',
      refreshTimer: null
    },

    state: {
      layers: {},
      lastZIndex: 0
    },

    initialize: function() {
      // At beginning create map
      this.createMap();
      this.listenTo(this.state, 'change', this._onLayersChange);
    },

    render: function() {
    },

    /**
     * Creates the leaflet map
     */
    createMap: function() {
      var mapProps = this.props.map;
      this.map = L.map(this.el, mapProps);
      this.setBasemap();

      if (this.props.disableZoomControls) {
        this.map.doubleClickZoom.disable();
      } else {
        this.map.addControl(L.control.zoom({
          position: 'topright'
        }));
      }
    },

    /**
     * Sets the map's basemap
     */
    setBasemap: function() {
      var basemap = this.props.basemapsList[this.props.basemap];
      this.basemap = L.tileLayer(basemap.url, basemap.options);
      this.basemap.addTo(this.map);
      this._setAttributions();
    },

    /**
     * Returns the map's instance
     */
    getMap: function() {
      return this.map;
    },

    /**
     * Adds a previously instanced layer
     * in a list to manage it from the map
     */
    addLayer: function(data, layer) {
      var layers = this.state.attributes.layers;

      if (!layers[data.name]) {
        if (data.zIndex === 0) {
          var newIndex = this.state.attributes.lastZIndex + 1;
          data.zIndex = newIndex;
          this.state.set({
            lastZIndex: newIndex
          }, { silent: true });
        }

        layers[data.name] = {
          data: data,
          layer: layer
        };

      }
      this.state.set({
        layers: layers
      }, { silent: true });
      this.state.trigger('change');
    },

    /**
     * Re-sets the zIndex for all of the layers
     */
    setOrder: function(data) {
      var layers = this.state.attributes.layers;
      _.each(data, function(d) {
        var currentLayer = layers[d.name];
        currentLayer.data.zIndex = d.zIndex;
        if (currentLayer) {
          currentLayer.layer.setZIndex(d.zIndex);
        }
      });
    },

    /**
     * Sets the active status of a layer
     */
    setActive: function(layer) {
      var layers = this.state.attributes.layers;
      var selectedLayer = layers[layer.name];

      if (selectedLayer) {
        selectedLayer.data.active = layer.active;
        if (layer.active) {
          selectedLayer.layer.setOpacity(1);
        } else {
          selectedLayer.layer.setOpacity(0);
        }
      }
    },

    /**
     * When a layer changes it triggers
     * a list of layers with the new data
     */
    _onLayersChange: function() {
      this.trigger('map:layers', this.state.attributes.layers);
    },

    /**
     * Removes a layer from the map and local list
     */
    removeLayer: function(layer) {
      var layers = this.state.attributes.layers;
      var selectedLayer = layers[layer.name];

      if (selectedLayer) {
        var newsList = {};
        this.map.removeLayer(selectedLayer.layer);

        _.each(layers, function(lay) {
          if (lay.data.name !== layer.name) {
            newsList[lay.data.name] = lay;
          }
        });
        this.state.set({
          layers: newsList
        }, { silent: true });
        this.state.trigger('change');
      }
    },

    _setAttributions: function() {
      var layers = this.state.attributes.layers;
      if (Object.keys(layers).length === 0) {
        this.map.attributionControl.addAttribution(this.props.cartoDBAttribution);
      }
    },

    update: function() {
      if (this.props.refreshTimer) {
        clearTimeout(this.props.refreshTimer);
        this.props.refreshTimer = null;
      }

      this.props.refreshTimer = setTimeout(function(){
        this.map.invalidateSize(true);
      }.bind(this), 400);
    }
  });

}).call(this, this.App);
