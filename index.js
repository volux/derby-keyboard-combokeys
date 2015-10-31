'use strict';
/**
 * instance of Combokeys
 * @type {Combokeys}
 */
var Combokeys = require('combokeys');
/**
 *
 * @type {Function}
 */
var globalBind = require('combokeys/plugins/global-bind');

module.exports = function (app) {

  app.on('ready', function () {

    app.proto.keyboard = new Keyboard(app);
  });

  app.on('destroyPage', function () {

    app.proto.keyboard.onDestroyPage();
  });
};

/**
 *
 * @param context {Component|App|*}
 * @param [inherit] exists global shortcuts binding
 * @constructor
 */
function Keyboard (context, inherit) {

  /**
   *
   * @type {Component|App}
   * @private
   */
  this._context = context;
  /**
   *
   * @type {Combokeys|Function}
   */
  this.Combokeys = Combokeys;
  /**
   * shortcuts binding collection
   * @type {{}}
   * @private
   */
  this._combokeys = {};

  if (!inherit) {

    this._combokeysFactory('#document');

  } else {

    this._combokeys['#document'] = inherit;
  }
}

/**
 *
 * @param element {string} dom node in component template with 'as' name
 * @returns {Combokeys|Function}
 * @private
 */
Keyboard.prototype._combokeysFactory = function (element) {

  if (this._combokeys[element]) {

    return this._combokeys[element];
  }
  /**
   *
   * @type {Combokeys|Function}
   */
  this._combokeys[element] = new this.Combokeys(('#document' == element)? document : this._context[element]);
  globalBind(this._combokeys[element]);

  return this._combokeys[element];
};

/**
 * reset global shortcuts binding
 */
Keyboard.prototype.onDestroyPage = function () {

  this._combokeys['#document'].reset();
};

/**
 * detach shortcuts binding from DOM nodes and delete they item in this._combokeys
 */
Keyboard.prototype.onDestroyComponent = function () {

  for (var element in this._combokeys) if (this._combokeys.hasOwnProperty(element) && '#document' !== element) {

    this._combokeys[element].detach();
    delete this._combokeys[element];
  }
};

/**
 *
 * @param component {Component|{page:{Page}}}
 */
Keyboard.prototype.component = function (component) {

  component['keyboard'] = new Keyboard(component, this._combokeys['#document']);
  component.page.once('destroy', this.onDestroyComponent.bind(component['keyboard']));
};

/**
 *
 * @param element {string} name of DOM node in component template ('as' attribute)
 * @param shortcuts {*}
 * @returns {Combokeys|Function}
 */
Keyboard.prototype.element = function(element, shortcuts) {

  shortcuts = shortcuts || {};

  this._combokeysFactory(element);
  for (var keys in shortcuts) if (shortcuts.hasOwnProperty(keys)) {
    this._combokeys[element].bindGlobal(
      keys
      , shortcuts[keys]['action'].bind(this._context)
      , shortcuts[keys]['event'] || 'keydown'
    )
  }

  return this._combokeys[element];
};

/**
 *
 * @param shortcuts {*}
 * @returns {Combokeys|Function}
 */
Keyboard.prototype.shortcuts = function(shortcuts) {

  for (var keys in shortcuts) if (shortcuts.hasOwnProperty(keys)) {

    this._combokeys['#document'].bindGlobal(keys, shortcuts[keys].bind(this._context));
  }
  return this._combokeys['#document'];
};

/**
 *
 * @param path {string} component model path for toggle
 * @param keys {string} like 'alt+t'
 * @param [bubble=false] {boolean}
 */
Keyboard.prototype.toggle = function(path, keys, bubble) {

  bubble = bubble || false;

  var toggleFn = function(path, bubble) {
    this.model.set(path, !this.model.get(path));
    return bubble;
  };

  this._combokeys['#document'].bindGlobal(keys, toggleFn.bind(this._context, path, bubble));
};

/**
 * TODO add to args custom fn as touchFn
 * @param path {string} component model path for touch
 * @param keys {string} like 'alt+t'
 * @param bubble {boolean}
 */
Keyboard.prototype.touch = function(path, keys, bubble) {

  bubble = bubble || false;

  var touchFn = function(path, bubble) {
    this.model.set(path, Date.now());
    return bubble
  };

  this._context.model.set(path, Date.now());
  this._combokeys['#document'].bindGlobal(keys, touchFn.bind(this._context, path, bubble));
};

/**
 * TODO add to args custom fn as spinFn
 * @param path {string} component model path for spin
 * @param [element=path] {string} name of DOM node in component template ('as' attribute)
 * @param [step=1] {number} increment
 */
Keyboard.prototype.spinner = function(path, element, step) {

  step = step || 1;
  element = element || path;

  this._combokeysFactory(element);

  var initValue = this._context.model.get(path);
  var spinFn = function(path, step) {

    this.model.set(path, this.model.get(path) + step);
    return false;
  };
  var restoreFn = function (initValue) {

    this.model.set(path, initValue);
    return false;
  };

  this._combokeys[element].bindGlobal('up', spinFn.bind(this._context, path, step));
  this._combokeys[element].bindGlobal('down', spinFn.bind(this._context, path, -step));
  this._combokeys[element].bindGlobal(['esc','mod+z'], restoreFn.bind(this._context, initValue));
};

/**
 * Use it if your need block default browser shortcuts
 * @param element {string} name of DOM node in component template ('as' attribute)
 * @param shortcuts {Array} like ['mod+b', 'mod+i', 'mod+u']
 * @returns {Combokeys|Function}
 */
Keyboard.prototype.prevent = function(element, shortcuts) {

  shortcuts = shortcuts || [];

  this._combokeysFactory(element);

  shortcuts.forEach(function (keys) {

    this._combokeys[element].bindGlobal(
      keys
      , function () {
        // returns false call event.preventDefault and event.stopPropagation in Combokeys
        return false;
      }
      , 'keydown'
    )
  }.bind(this));

  return this._combokeys[element];
};
