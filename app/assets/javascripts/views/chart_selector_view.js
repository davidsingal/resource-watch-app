(function(App) {

  'use strict';

  App.View.ChartSelector = App.Core.View.extend({

    tagName: 'div',

    className: 'chart-selector',

    events: {
      'change .type': '_onTypeChange',
      'change .action .value': '_onValueChange'
    },

    template: this.HandlebarsTemplates.chart_selector,

    props: {
      elSelectsValues: '.value',
      activeClass: '_visible',
      chartConfig: [
        {
          name: 'bar',
          acceptedStatTypes: [
            [ 'nominal' ],
            [ 'ordinal' ],
            [ 'quantitative', 'quantitative' ],
            [ 'ordinal', 'quantitative' ],
            [ 'nominal', 'ordinal' ]
          ]
        },
        {
          name: 'line',
          acceptedStatTypes: [
            [ 'quantitative', 'quantitative' ],
            [ 'ordinal', 'quantitative' ],
            [ 'nominal', 'ordinal' ]
          ]
        },
        {
          name: 'pie',
          acceptedStatTypes: [
              [ 'nominal' ],
              [ 'ordinal' ],
              [ 'quantitative' ]
          ]
        },
        {
          name: 'scatter',
          acceptedStatTypes: [
            [ 'quantitative', 'quantitative' ],
            [ 'nominal', 'nominal' ],
            [ 'nominal', 'ordinal' ],
            [ 'ordinal', 'ordinal' ]
          ]
        },
        {
          name: '1d_scatter',
          acceptedStatTypes: [
            [ 'quantitative' ],
            [ 'temporal' ]
          ]
        },
        {
          name: '1d_tick',
          acceptedStatTypes: [
            [ 'quantitative' ],
            [ 'temporal' ]
          ]
        }
      ],
      chartsTypes: {
        bar: [{
          label: 'X axis',
          name: 'x'
        },
        {
          label: 'Y axis',
          name: 'y'
        }],
        line: [{
          label: 'X axis',
          name: 'x'
        },
        {
          label: 'Y axis',
          name: 'y'
        }],
        pie: [{
          label: 'Value',
          name: 'value'
        },
        {
          label: 'Category',
          name: 'category'
        }],
        scatter: [{
          label: 'X axis',
          name: 'x'
        },
        {
          label: 'Y axis',
          name: 'y'
        }],
      }
    },

    state: {
      data: null,
      type: null
    },

    initialize: function() {
      this.listenTo(this.state, 'change:data', this._getChartsSuggestions);
    },

    render: function() {
      var recomms = [];
      var columns = this._getColumns();

      _.each(this.data.recomms, _.bind(function(d) {
        recomms.push({
          type: d,
          selected: this.state.attributes.type === d
        })
      }, this));

      this.$el.html(this.template({
        recomms: recomms,
        columns: columns
      }));
      this._generateGraph();
    },

    _getChartsSuggestions: function() {
      this.jiminy = new Jiminy(this.state.attributes.data,
        this.props.chartConfig);
      var columns = [];
      var recomm = this.jiminy.recommendation();

      if (recomm) {
        columns = this.jiminy.columns(recomm[0]);
        this.state.set({
          type: recomm[0]
        });
      }

      this.data = {
        recomms: recomm,
        columns: columns
      };
    },

    _generateGraph: function() {
      var $values = this.el.querySelectorAll(this.props.elSelectsValues);
      var newData = [];
      for (var i = 0; i < $values.length; i++) {
        var current = $values[i];
        var selected = current.querySelector('option:checked');
        var data = _.pluck(this.state.attributes.data, selected.value);

        _.each(data, function(d, e){
          if (i === 0) {
            var nData = {};
            nData[current.dataset.name] = d;
            newData.push(nData);
          } else {
            newData[e][current.dataset.name] = d;
          }
        });
      }

      this.trigger('chart:update', this.state.attributes.type, newData);
      this._hide();
    },

    _getColumns: function() {
      var chartTypes = this.props.chartsTypes[this.state.attributes.type];
      var chartColumns = [];

      _.each(chartTypes, _.bind(function(d, i) {
        var column = {
          label: d.label,
          name: d.name,
          options: _.map(this.data.columns, function(c, e) {
            return {
              column: c,
              selected: i === e
            };
          })
        };
        chartColumns.push(column);
      }, this));
      return chartColumns;
    },

    _onTypeChange: function(ev) {
      var current = ev.currentTarget;
      var type = current.value;

      this.state.set({
        type: type
      });
    },

    _hide: function() {
      this.el.classList.remove(this.props.activeClass);
    },

    toggle: function() {
      if (!this.el.classList.contains(this.props.activeClass)) {
        this.el.classList.add(this.props.activeClass);
      } else {
        this.el.classList.remove(this.props.activeClass);
      }
    },

    _onValueChange: function(ev) {
      var current = ev.currentTarget;
      var value = current.value;

      this._generateGraph();
    }
  });

}).call(this, this.App);
