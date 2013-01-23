# Bullseye Chart

Bullseye chart made with Javascript and the [Raphael](http://raphaeljs.org) graphics lib. It supports mouse interaction, adding and removing points at runtime, serializing data points, and more.

## Features

- works seamlessly with Raphael: `Raphael('canvas').bullseye()`
- easily serializable polar coordinates
- mouse interaction and callbacks: `onMouseOver`, `onPointClick`, `onSliceClick`
- supports adding, removing, and dragging points
- works in Chrome, FF, and IE*

\* works in IE9, briefly tested with IE7 and 8 


## Demo

[Demo page](http://dimarr.github.com/raphael.bullseye.js)

## Installation

    <script src="raphael-min.js" type="text/javascript"></script>
    <script src="raphael.bullseye.js" type="text/javascript"></script>

## Example

    var RAD = Math.PI / 180;
    var bullseye = Raphael('canvas', 450, 450).bullseye({
        'sliceLabels' : ['Apple', 'Banana', 'Orange', 'Kiwi'],
        'ringLabels'  : [1, 2, 3, 4]
    });

    bullseye.addPoint({
        'label'    : 'Point 0',
        'angle'    : 300 * RAD,
        'distance' : 1      // 100% of the radius, on the outer boundary
    });

    bullseye.addPoint({
        'label'    : 'Point 1',
        'angle'    : 65 * RAD,
        'distance' : 0.25   // 25% of the radius
    });

    bullseye.addPoint({
        'label'    : 'Point 2',
        'angle'    : 65 * RAD,
        'distance' : 1.25,   // 125% of the radius
        'pointFill': '#0000ff',
        'pointSize': 10
    });

    bullseye.addPoint({
        'label'    : 'Point 3',
        'angle'    : 180 * RAD,
        'ring'     : 2,     // place point in ring 3
        'distance' : .25,   // 25% of the the specified ring
        'pointFill': '#ff0000'
    });

## License

MIT
