/*!
* Swipe detector - v@version@
* Detect up, down, left, right and swipe using vanilla JS or as jQuery plugin
* https://github.com/Waldir/Swipe-Detector
* @author Waldir Bolanos <https://waldirb.com>
* @license MIT
*/
(function f(window) {
    let global = {};

    // Axis object for quick direction finding.
    const axis = {
        x: ['Left', 'Right'],
        y: ['Up', 'Down'],
    };

    // touch events array.
    const touchEvents = [
        'touchstart',
        'touchmove',
        'touchend',
    ];

    /**
     * Get the x, y, time and target points from the touch event
     * @param {Object} event Event object.
     * @returns {Object}
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
    * Gets an array of elements for the passed selector, HTMLElement, HTMLCollection or NodeList
    * @param {String|HTMLElement|HTMLCollection|NodeList} selector
    * @returns {Array}
    */
    function getList(selector) {
        const objName = Object.prototype.toString.call(selector);
        if (objName === '[object HTMLCollection]' || objName === '[object NodeList]')
            return [].slice.call(selector);
        if (objName === '[object Array]')
            return selector;
        return [selector];
    }

    /**
     * Fire a Custom event on an element.
     * @param {HTMLElement} el Element target
     * @param {String} name Event name
     * @param {Object} detail Extra details about the event
     */
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

    /**
     * Main function.
     * @param {String|HTMLElement|HTMLCollection|NodeList} selector
     * @param {Object} options
     * @returns {Object}
     */
    function Swipe(selector, options) {
        options = options || {};
        options.sensitivity = options.sensitivity || 20;
        options.timeOut = options.timeOut || 500;

        // If no selector is found just exit.
        if (!selector)
            return this;

        // If this is a string, use querySelectorAll.
        if (typeof selector === 'string')
            selector = document.querySelectorAll(selector);

        this.els = [];

        // Iterate through all found elements
        getList(selector).forEach((el) => {
            // Add all of the found elements to an array.
            this.els.push(el);

            // Add Event listeners to touchstart and touchmove and touchend and add to global
            touchEvents.forEach((eventType) => {
                el.addEventListener(eventType, (event) => {
                    // (touchstart and touchmove)
                    if (eventType !== touchEvents[2]) {
                        global[eventType] = eventPoint(event);
                        return;
                    }

                    // (touchend) Do the logic at the end of the touch.
                    if (global.touchstart && global.touchmove) {
                        // Add swipeAmount object to global.
                        global.swipeAmount = {
                            x:    Math.abs(global.touchstart.x - global.touchmove.x),
                            y:    Math.abs(global.touchstart.y - global.touchmove.y),
                            time: Math.abs(global.touchmove.time - global.touchstart.time),
                        };

                        // Find the swipe axis.
                        global.swipeAxis = global.swipeAmount.x > global.swipeAmount.y ? 'x' : 'y';

                        // If the sensitivity and time are correct, proceed to add event.
                        if (global.swipeAmount[global.swipeAxis] > options.sensitivity && global.swipeAmount.time < options.timeOut) {
                            // get direction from axis object.
                            global.swipeDirection = global.touchstart[global.swipeAxis] > global.touchmove[global.swipeAxis]
                                ? axis[global.swipeAxis][0]
                                : axis[global.swipeAxis][1];

                            // Create variables with name and detail.
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
        });

        return this;
    }

    /**
     * on method to listen to all elements on the array.
     * @param {String} event the event to trigger
     * @param {Function} callback callback function to fire
     * @returns Swipe Object
     */
    Swipe.prototype.on = function on(event, callback = function () {}) {
        this.els.forEach((el) => {
            el.addEventListener(event, callback, false);
        });
        return this;
    };

    // Add jQuery plugin.
    if (window.jQuery) {
        jQuery.fn.Swipe = function fnSwipe(options) {
            Swipe(this.get(), options);
            return this;
        };
    }

    // Bring plugin out into the root (window).
    window.Swipe = Swipe;
}(typeof window === 'object' ? window : this));
