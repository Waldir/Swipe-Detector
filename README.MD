# Swipe Detect

Avery simple and lightweight (**1.9kb**) Javascript script to detect `swipe`, `swipeLeft`, `swipeRight`, `swipeDown` and `swipeUp` on any element or set of elements using pure Javascript or as a jQuery plugin.

## Usage

Add the script to your page like you would any JavaScript file:

```html
<script src="dist/swipe.min.js"></script>
```

### Provide an element selector string or a collection of elements

All of the following work:
```js
var element = document.body;
var element = document.getElementById('myElement');
var element = '#myElement';
var element = '.myClass';
```

### Initiate with new Keyword

```js
var mySwipe = new Swipe(element, {});

// Listen using the on method
mySwipe.on('swipeLeft', function (e) {
    console.log(e.type, e.detail)
});

// Listen using addEventListener
document.body.addEventListener('swipe', function (e) {
    console.log(e.type, e.detail)
});
```

Note that the 'on' method works like jquery where if you provide more than one element it will add the event listener to all of them. It does not, however, accept multiple space separated events such as `swipeUp swipeDown` since if you want to listen for more than one swipe event you can simply listen for `swipe` and check the direction of the swipe using `e.detail`.
### Initiate as a jQuery plugin

```js
// Initiate and listen with jQuery's 'on' method
$(element).Swipe({}).on('swipeDown', function (e) {
    console.log(e.type, e.detail);
});
```

## Options

You can currently pass the following options.
Option      | Description                                                                  | Type | Default
------------|------------------------------------------------------------------------------|------|---------
sensitivity | The amount of pixels a finger has to travel before it's considered a swipe   | int  | 20
timeOut     | How much time in milliseconds before it is not considered a swipe any longer | int  | 500

```js
new Swipe(element, {
    sensitivity: 20,
    timeOut: 500
});
```

## License

Licensed under [MIT License](LICENSE) &copy; [Waldir Bolanos](https://github.com/Waldir)