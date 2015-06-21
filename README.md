# ko-bliss
KnockoutJS bindings' syntax sugar. Dependencies: KnockoutJS

Instead of defining bingings in the regualar way: 
```html
<button data-bind="text: label, attr: { title: label }">
</button>
```

Write them more natural:
```html
<button *text="label" *attr.title="label">
</button>
```

##Examples:
```html
<button *event.click="function() { alert('message'); }">
    Action
</button>
```

```html
<span *text="condition ? 'Next' : 'Back'">
    Action
</span>
```

```html
<span *attr.title="title" *attr.data-title="'Plain text'">
    Action
</span>
```

```html
<ul *foreach="items">
    <li *text="name"></li>
</ul>
```

```html
<ul *foreach.data="items" *foreach.as="'item'">
    <li *text="item.name"></li>
</ul>
```

```html
<ul *foreach="{ data: items, as: 'item' }">
    <li *text="item.name"></li>
</ul>
```

```html
<div *style.color="'red'" *css.active="isActive" *css.focused="isFocused">
    Text
<div>
```

##Mixing regular bindings with ko-bliss bindings

Yes, it's possible:

```html
<div *css.active="isActive" data-bind="text: label, css: { focused: isFocused }">
<div>
```

##How it works

The ko-bliss plugin reads all the attributes that contain predefined prefix (by default it is '*') and transform them into regular JS object structure that will be used in the knockout's data-bind attribute.

##Choosing the prefix

ko-bliss uses '*' prefix to identify the knockout's bindings, but it's not the final word. More options are taken into consideration, for example: 'bind.' (e.g. bind.text="title"). Please feel free to leave your comment about that.
