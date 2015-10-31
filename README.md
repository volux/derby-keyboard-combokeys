# derby-keyboard-combokeys

[Derby JS](http://derbyjs.com) app plugin to handles keyboard shortcuts in components.
Based on [PolicyStat/combokeys](https://github.com/PolicyStat/combokeys).

## Install

`npm install --save volux/derby-keyboard-combokeys`

## Usage

*apps/app/index.js*
```js
app.use(require('derby-keyboard-combokeys'));
```

*component/index.js*
```js

Component.prototype.create = function(){

  this.app.proto.keyboard.component(this);
  
  // default shortcuts blocked
  this.keyboard.prevent('editable', [
      'mod+b',
      'mod+u',
      'mod+i'
    ]
  );

  // works on page, include all inputs or textarea
  this.keyboard.shortcuts({ 

    '§': this.inputFocus,
    '/': this.inputFocus,

    '±': this.numberFocus,
    '`': this.numberFocus,

    'mod+a': function(event) {
      console.log('Pressed Ctrl(Win)+A / Cmd(Mac)+A');
      return false; // event.preventDefault and event.stopPropagation
    }

  });

  this.keyboard.toggle('toggle', 'ctrl+t', false);

  this.keyboard.touch('refresh', 'ctrl+r', false);

  this.keyboard.spinner('number'); // works when <input as="number"> in focus: 'up': +1, 'down': -1, 'esc'/'mod+z': restore init value

  this.keyboard.element('input', { // works when <input as="input"> in focus

      'd e r b y': {
        'action': function(event) {
          //this == component
          console.log('Typed D E R B Y');
        },
        'event': 'keypress'
      },

      'enter': {
        'action': function(event) {
          //this == component
          console.log('Pressed Enter in input');
          return false
        }
      },

      'esc': {
        'action': this.inputBlur
      },

      'mod+s': {
        'action': function(event) {
          //this == component
          console.log('Pressed Ctrl(Win)+S / Cmd(Mac)+S');
          return false; // event.preventDefault and event.stopPropagation
        }
      }
    }
  );
};

Component.prototype.inputFocus = function(event){

  this.input.focus();
  return false; // event.preventDefault and event.stopPropagation
};

Component.prototype.inputBlur = function(event){

  this.input.blur();
  return false;
};

Component.prototype.numberFocus = function(event){

  this.number.focus();
  return false;
};

```
*component/index.html*
```html
<index:>

  <input as="input" type="text" value="{{input}}"/>

  <div>
    {{on refresh}}
      <p>{{unbound input}}</p>
    {{/on}}
  </div>  

  <input as="number" type="text" value="{{number}}"/>
  
  <div as="editable" contenteditable="true">...</div>

</index:>
```