(function(App) {

  'use strict';

  App.View.Modal = App.Core.View.extend({

    events: {
      'click .close': '_onClose',
      'click': '_onClose'
    },

    className: 'modal',

    props: {
      elActiveClass: '-visible'
    },

    initialize: function(settings) {
      if (!settings.html && !settings.view) {
        throw new Error('Param "html" or "view" is required.');
      }
      this.$body = document.body;

      this.state.set({ html: settings.html, view: settings.view });
    },

    render: function() {
      var content = '<div class="content">' +
        (this.state.get('html') ? this.state.get('html') :
          this.state.get('view').render().el) +
        '<div class="close">×</div></div>';
      this.$el.html(content);
      this.el.classList.add(this.props.elActiveClass);
      this.$el.appendTo(this.$body);
    },

    _onClose: function(e) {
      /* We don't want the modal to be closed when clicking within .content */
      if(!e.target.classList.contains('close') &&
        !e.target.classList.contains('modal')) {
        return;
      }

      this.state.set({ html: '', view: null }, { silent: true });
      this.$el.html(null);
      this.el.classList.remove(this.props.elActiveClass);
      this.$body.classList.remove(this.props.parentActiveClass);
    }

  });

}).call(this, this.App);
