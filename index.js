module.exports = function(app) {

  app.on('ready', function() {

    app.proto.keyboard = new Keyboard(app);
  });

  app.on('destroyPage', function() {

    app.proto.keyboard.onDestroyPage()
  });
};

function Keyboard(context, inherit) {

  this.context = context;
  this.Combokeys = require('combokeys');
  this._combokeys = {};

  if (!inherit) {

    this._combokeysFactory('#document');

  } else {

    this._combokeys['#document'] = inherit;

  }
}

Keyboard.prototype = {

  _combokeysFactory: function(element) {

    if (this._combokeys[element]) {
      return this._combokeys[element]
    }
    this._combokeys[element] = new this.Combokeys(('#document' == element)? document : this.context[element]);
    require('combokeys/plugins/global-bind')(this._combokeys[element]);

    return this._combokeys[element]
  },

  onDestroyPage: function () {

    this._combokeys['#document'].reset()
  },

  onDestroyComponent: function () {

    for (var element in this._combokeys) if (this._combokeys.hasOwnProperty(element) && '#document' !== element) {

      this._combokeys[element].detach();
      delete this._combokeys[element]
    }
  },

  component: function(component) {

    component.keyboard = new Keyboard(component, this._combokeys['#document']);
    component.page.once('destroy', this.onDestroyComponent.bind(component.keyboard))
  },

  element: function(element, shortcuts) {

    shortcuts = shortcuts || {};

    this._combokeysFactory(element);

    for (var keys in shortcuts) if (shortcuts.hasOwnProperty(keys)) {

      this._combokeys[element].bindGlobal(keys,
        shortcuts[keys]['action'].bind(this.context),
        shortcuts[keys]['event'] || 'keydown'
      )

    }
    return this._combokeys[element]
  },

  shortcuts: function(shortcuts) {

    for (var keys in shortcuts) if (shortcuts.hasOwnProperty(keys)) {

      this._combokeys['#document'].bindGlobal(keys, shortcuts[keys].bind(this.context))

    }
    return this._combokeys['#document']
  },

  toggle: function(path, keys, bubble) {

    bubble = bubble || false;
    var
      toggleFn = function(path, bubble) {

        this.model.set(path, !this.model.get(path));
        return bubble
      }
      ;

    this._combokeys['#document'].bindGlobal(keys, toggleFn.bind(this.context, path, bubble))
  },

  touch: function(path, keys, bubble) { //TODO add to args custom fn as touchFn

    bubble = bubble || false;
    var
      touchFn = function(path, bubble) {

        this.model.set(path, Date.now());
        return bubble
      }
      ;

    this.context.model.set(path, Date.now());
    this._combokeys['#document'].bindGlobal(keys, touchFn.bind(this.context, path, bubble))
  },

  spinner: function(path, element, step) { //TODO add to args custom fn as spinFn

    step = step || 1;
    element = element || path;

    this._combokeysFactory(element);

    var
      initValue = this.context.model.get(path), //TODO set initValue on focus?
      spinFn = function(path, step) {

        this.model.set(path, this.model.get(path) + step);
        return false
      },
      restoreFn = function (initValue) {
        this.model.set(path, initValue);
        return false
      }
      ;

    this._combokeys[element].bindGlobal('up', spinFn.bind(this.context, path, step));
    this._combokeys[element].bindGlobal('down', spinFn.bind(this.context, path, -step));
    this._combokeys[element].bindGlobal(['esc','mod+z'], restoreFn.bind(this.context, initValue))
  }

};
