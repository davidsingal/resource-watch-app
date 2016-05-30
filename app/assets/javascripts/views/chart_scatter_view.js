(function(App) {

  'use strict';

  App.View.ChartScatter = App.Core.View.extend({

    props: {
      mainColor: '#9BA2AA',
      secondaryColor: '#9BA2AA',
      buckets: ['#72B800', '#F1B900', '#B72A7E', '#D4E329', '#5BB1D2'],
    },

    initialize: function(props) {
      if (props) {
        this.props = _.extend(this.props, props);
      }
    },

    getData: function(data) {
      return {
        "padding": {
          "top": 25,
          "left": 38,
          "bottom": 30,
          "right": 18
        },
        "signals": [
          {
            "name": "tooltip",
            "init": {},
            "streams": [
              {"type": "symbol:mouseover", "expr": "datum"},
              {"type": "symbol:mouseout", "expr": "{}"}
            ]
          }
        ],
        "data": [
          {
            "name": "table",
            "format": {
              "parse": {
                "x": "date"
              }
            },
            "values": data.values
          },
          {
            "name": "summary",
            "source": "table",
            "transform": [
              {
                "type": "aggregate",
                "summarize": {
                  "y": [
                    "min",
                    "max"
                  ]
                }
              },
              {
                "type": "formula",
                "field": "difference",
                "expr": "datum.max_y-datum.min_y"
              },
              {
                "type": "formula",
                "field": "min",
                "expr": "datum.min_y === 0 ? 0 : (datum.difference > 0 ? datum.min_y - datum.difference * 0.2  : datum.min_y * 0.8)"
              },
              {
                "type": "formula",
                "field": "min",
                "expr": "datum.min < 0 ? 0 : datum.min"
              },
              {
                "type": "formula",
                "field": "max",
                "expr": "datum.max_y === 0 ? 10 : (datum.difference > 0 ? datum.max_y + datum.difference * 0.2 : datum.max_y * 1.2)"
              }
            ]
          },
          {
            "name": "computed",
            "source": "table",
            "transform": [
              {
                "type": "cross",
                "with": "summary"
              }
            ]
          }
        ],
        "predicates": [
          {
            "name": "tooltip", "type": "==", 
            "operands": [{"signal": "tooltip._id"}, {"arg": "id"}]
          }
        ],
        
        "scales": [
          {
            "name": "x",
            "type": "time",
            "range": "width",
            "domain": {
              "data": "table",
              "field": "x"
            }
          },
          {
            "name": "y",
            "type": "linear",
            "range": "height",
            "domain": {
              "data": "computed",
              "field": "a.y"
            },
            "domainMin": {
              "data": "computed",
              "field": "b.min"
            },
            "domainMax": {
              "data": "computed",
              "field": "b.max"
            },
            "zero": false,
            "nice": true
          },
          {
            "name": "color", 
            "type": "ordinal", 
            "domain": {"data": "table", "field": "category"},
            "range": this.props.buckets
          }
        ],
        "axes": [
          {
            "type": "x", 
            "scale": "x", 
            "ticks": 5,
            "layer": "back",
            "properties": {
             "ticks": {
               "strokeWidth": {"value": 0}
             },
             "majorTicks": {
               "strokeWidth": {"value": 0}
             },
             "axis": {
               "stroke": {"value": "#333"},
               "strokeWidth": {"value": 0}
             },
             "labels": {
                "fontSize": {"value": 10},
                "fontWeight": {"value": 300},
                "fill": {"value": this.props.mainColor}
             }
            }
          },
          {
            "type": "y", 
            "scale": "y",
            "grid": true,
            "layer": "back",
            "ticks": 5,
            "format": "f",
            "properties": {
             "ticks": {
               "stroke": {"value": "steelblue"}
             },
             "majorTicks": {
               "strokeWidth": {"value": 0}
             },
            "grid": {
              "stroke": {"value": "#333"},
              "strokeWidth": {"value": 1},
              "strokeOpacity": {"value": 0.1}
            },
             "axis": {
               "stroke": {"value": "#333"},
               "strokeWidth": {"value": 0}
             },
             "labels": {
                "fontSize": {"value": 10},
                "fontWeight": {"value": 300},
                "fill": {"value": this.props.mainColor}
             }
           }
          }
        ],
        "marks": [
          {
            "type": "symbol",
            "from": {"data": "table"},
            "properties": {
              "enter": {
                "x": {"scale": "x", "field": "x"},
                "y": {"scale": "y", "field": "y"},
                "fill": {"scale": "color", "field": "category"},
                "fillOpacity": {"value": 0.7}
              },
              "update": { 
                "size": {"value": 36},
                "stroke": {"value": "transparent"}
              }
            }
          },


          {
            "type": "group",
            "from": {"data": "table"},
            "properties": {
              "enter": {
                "align": {"value": "center"},
                "stroke": {"value": "transparent"},
                "strokeWidth": {"value": 0},
                "fill": {"value": "transparent"}
              },
              "update": {
                "x": {"scale": "x", "signal": "tooltip.x", "offset": "8"},
                "y": {"scale": "y", "signal": "tooltip.y", "offset": "8"},
                "width": {"value": 50},
                "height": {"value": 25},
                "fill": {
                  "rule": [
                    {
                      "predicate": {
                        "name": "tooltip",
                        "id": {"value": null}
                      },
                      "value": "transparent"
                    },
                    {"value": "#efefef" }
                  ]
                },          
              
                "strokeWidth": {
                  "rule": [
                    {
                      "predicate": {
                        "name": "tooltip",
                        "id": {"value": null}
                      },
                      "value": "0"
                    },
                    {"value": 0.5}
                  ]
                },
                "stroke": {
                  "rule": [
                    {
                      "predicate": {
                        "name": "tooltip",
                        "id": {"value": null}
                      },
                      "value": "transparent"
                    },
                    {"value": "#222" }
                  ]
                },
                "fillOpacity": {
                  "rule": [
                    {
                      "predicate": {
                        "name": "tooltip",
                        "id": {"value": null}
                      },
                      "value": 0
                    },
                    {"value": 1}
                  ]
                }              
              }
            },
            
            "marks": [
              {
                "type": "text",
                "properties": {
                  "enter": {
                    "align": {"value": "center"},
                    "fill": {"value": "#333"}
                  },
                  "update": {
                    "x": {"value": 23},
                    "y": {"value": 15},
                    "text": {"signal": "tooltip.y"},
                    "fill": {"value": "black"},
                    "fontWeight": {"value": "bold"}
                  }
                }
              }
            ]
          }

        ]
      }
    }
  });

}).call(this, this.App);
