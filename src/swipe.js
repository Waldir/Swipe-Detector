/*!
* Swipe detector - v@version@
*
* Copyright (C) 2021 https://github.com/Waldir
* Author: Waldir Bolanos
*/
(function f(root) {
    let global = {};
    root = root || {};

    // Axis object for quick direction finding.
    const axis = {
        x: ['Left', 'Right'],
        y: ['Up', 'Down'],
    };

    /**
     * event point
     */
    function eventPoint(event) {
        const ev = {
            time:   event.timeStamp,
            target: event.target,
        };
        if (event.touches && event.touches.length > 0) {
            ev.x = event.touches[0].pageX;
            ev.y = event.touches[0].pageY;
        } else {
            ev.x = event.pageX;
            ev.y = event.pageY;
        }
        return ev;
    }

    /**
     * Get the axis of the swipe
     * @param {int} x x position.
     * @param {int} y y position
     * @returns String
     */
    function getAxis(x, y) {
        return x > y ? 'x' : 'y';
    }

    /**
    * Gets an iterable element for the passed elements
    */
    function getList(selector) {
        const toString = Object.prototype.toString.call(selector);
        if (toString === '[object HTMLCollection]' || toString === '[object NodeList]')
            return [].slice.call(selector);
        if (toString === '[object Array]')
            return selector;
        return [selector];
    }

    function fireEvent(el, name, detail) {
        let ev;
        try {
            ev = new CustomEvent(name, { detail });
        } catch (err) {
            // IE supported event.
            ev = el.createEvent('Event');
            ev.initEvent(name, true, true);
            ev.detail = detail;
        }
        el.dispatchEvent(ev);
    }

    function Swipe(selector, options) {
        this.els = [];
        options = options || {};
        options.sensitivity = options.sensitivity || 20;
        options.timeOut = options.timeOut || 500;

        // If no selector is found just exit.
        if (!selector)
            return this;

        // If this is a string, use querySelectorAll.
        if (typeof selector === 'string')
            selector = document.querySelectorAll(selector);

        getList(selector).forEach((el) => { this.els.push(el); });

        // Iterate through all found elements
        this.els.forEach((el) => {
            // Add Event listeners to touchstart and touchmove and add to global
            ['touchstart', 'touchmove'].forEach((eventType) => {
                el.addEventListener(eventType, (event) => {
                    global[eventType] = eventPoint(event);
                }, false);
            });

            // Do the logic at the end of the touch.
            el.addEventListener('touchend', () => {
                if (global.touchstart && global.touchmove) {
                    // Add swipeAmount object to global.
                    global.swipeAmount = {
                        x:    Math.abs(global.touchstart.x - global.touchmove.x),
                        y:    Math.abs(global.touchstart.y - global.touchmove.y),
                        time: Math.abs(global.touchmove.time - global.touchstart.time),
                    };

                    // Find the swipe axis.
                    global.swipeAxis = getAxis(global.swipeAmount.x, global.swipeAmount.y);

                    // If the sensitivity and time are correct, proceed to add event.
                    if (global.swipeAmount[global.swipeAxis] > options.sensitivity && global.swipeAmount.time < options.timeOut) {
                        // get direction from axis object.
                        global.swipeDirection = global.touchstart[global.swipeAxis] > global.touchmove[global.swipeAxis]
                            ? axis[global.swipeAxis][0]
                            : axis[global.swipeAxis][1];

                        // Create variables with name and timestamp.
                        const eventName = `swipe${global.swipeDirection}`;
                        const detail = {
                            direction: global.swipeDirection.toLowerCase(),
                            duration:  global.swipeAmount.time,
                            distance:  global.swipeAmount[global.swipeAxis],
                        };

                        // Fire events.
                        fireEvent(el, eventName, detail);
                        fireEvent(el, 'swipe', detail);
                    }

                    // Remove global objects.
                    global = {};
                }
            }, false);
        });

        return this;
    }

    /**
     *
     * @param {String} event the event to trigger
     * @param {Function} callback callback function to fire
     * @returns Swipe Object
     */
    Swipe.prototype.on = function f(event, callback) {
        this.els.forEach((el) => {
            el.addEventListener(event, callback, false);
        });
        return this;
    };

    // Add jQuery plugin.
    if (window.jQuery) {
        (function f($) {
            $.fn.Swipe = function f(options = {}) {
                Swipe(this.get(), options);
                return this;
            };
        }(window.jQuery));
    }

    // Bring plugin out into the root (window).
    root.Swipe = Swipe;
}(typeof window === 'object' ? window : this));
