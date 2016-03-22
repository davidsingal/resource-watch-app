(function(App) {

  'use strict';

  App.Router.Explore = App.Core.Router.extend({

    routes: {
      '(/)': 'exploreDashboard',
      '(page::page)(/)': 'exploreDashboard',
      '(q::q)/(page::page)(/)': 'exploreDashboard'
    },

    /**
     * Render cards and charts
     * @param {Number} page
     */
    exploreDashboard: function(q, page) {
      var ITEMS_PER_PAGE = 6;

      // Converting q and page param
      if (!page && q) {
        page = q;
        q = null;
      }
      this.params.set({ page: Number(page || 1), q: q });

      // Complete widgets collection
      // TODO: fetch data instead fixtures data
      var widgetsData = this.widgets = new App.Collection.Widgets();
      // Generating fixtures
      widgetsData.fixtures();
      if (this.params.attributes.q) {
        widgetsData = widgetsData.search(this.params.attributes.q);
      }

      // Creating search form
      this.searchForm = new App.View.SearchForm({
        el: '#searchForm',
        props: {
          value: this.params.attributes.q
        }
      });

      // Creating pagination
      this.pagination = new App.View.Pagination({
        el: '#pagination',
        props: {
          itemsPerPage: ITEMS_PER_PAGE,
          current: this.params.attributes.page,
          pages: Math.ceil(widgetsData.length / ITEMS_PER_PAGE)
        }
      });

      // Creating dashboard
      var pageRange = this.pagination.getPageRange();
      // Slicing collection by current page
      widgetsData = widgetsData
        .slice(pageRange.startIndex, pageRange.endIndex);
      this.cards = new App.View.Cards({
        el: '#exploreDashboard',
        data: widgetsData
      });

      this.exploreNavigation = new App.View.ExploreNavigation({
        el: '#exploreNavigation',
        data: widgetsData
      });

      // Creating map
      this.map = new App.View.Map({ el: '#map' });
      this.lenged = new App.View.Legend({
        el: '#legend',
        data: []
      });

      // Settings events
      this.listenTo(this.searchForm.state, 'change:value', this.setQuery);
      this.listenTo(this.pagination.state, 'change:current', this.setPage);
      this.listenTo(this.exploreNavigation.state, 'change:mode', this.setMode);
      this.listenTo(this.params, 'change', this.updateParams);
    },

    /**
     * Update router params, this action doesn't trigger
     */
    updateParams: function() {
      var route = '';
      var q = this.params.attributes.q;
      var page = this.params.attributes.page;
      if (q && page) {
        route = ['q:' + q, 'page:' + page].join('/');
      }
      if (q && !page) {
        route = 'q:' + q;
      }
      if (!q && page) {
        route = 'page:' + page;
      }
      this.navigate(route, { trigger: false });
      this.updateCards();
    },

    /**
     * Set query param in model
     */
    setQuery: function() {
      this.params.set('q', this.searchForm.state.attributes.value);
    },

    /**
     * Set page param in model
     */
    setPage: function() {
      this.params.set('page', this.pagination.state.attributes.current);
    },

    /**
     * Set mode param in model
     */
    setMode: function(state) {
      this.cards.state.set('mode', state.attributes.mode);
    },

    /**
     * Update and render cards
     */
    updateCards: function() {
      var pageRange = this.pagination.getPageRange();
      var widgetsData = this.widgets;
      var itemsPerPage = this.pagination.state.attributes.itemsPerPage;
      if (this.params.attributes.q && this.params.hasChanged('q')) {
        widgetsData = widgetsData.search(this.params.attributes.q);
        // Reseting to page 1 when user search by query
        this.pagination.state.set('current', 1);
      }
      if (itemsPerPage) {
        this.pagination.state
            .set('pages', Math.ceil(widgetsData.length / itemsPerPage));
        widgetsData= widgetsData
          .slice(pageRange.startIndex, pageRange.endIndex);
        // Reseting cards collection and render it
        this.cards.data.reset(widgetsData);
        this.exploreNavigation.data.reset(widgetsData);
      }
    }

  });

}).call(this, this.App);
