/**
Copyright (c) 2012 Dmitri Rodik

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/**
 * Bullseye chart constructor
 * @param {Object}   opts                 Chart options
 * @param {Integer}  [opts.startDegree]   Optional. Defines where to start drawing the first slice
 * @param {String[]} opts.sliceLabels     Array of slice labels. Defines how to carve up the chart.
 * @param {String[]} opts.ringLabels      Array of ring labels. Defines the number of rings and their labels.
 * @param {String[]} [opts.ringFills]     Optional. Array of hex colors to color the round rings. Indices match ringLabels'
 * @param {String}   [opts.bullseyeFill]  Color of the bullseye in hex
 * @param {Boolean}  [opts.allowDrag]     Defaults to false. True to allow dragging points.
 * @param {Function} [opts.onPointClick]  Callback when point is clicked on. First param is the clicked point.
 * @param {Function} [opts.onSliceClick]  Callback when the slice label is clicked on. First param is the opts.sliceLabels' index
 * @param {Function} [opts.onMouseOver]   Callback when mouse is over a point. First param is the point itself.
 */
Raphael.fn.bullseye = function(opts) {
	var RAD_CONST = Math.PI / 180;

    function Bullseye() {
        this.initialize.apply(this, arguments);
    }

    var B = Bullseye.prototype;


    B.initialize = function(canvas, opts) {
        this.width        = canvas.canvas.clientWidth  || canvas.width,
        this.height       = canvas.canvas.clientHeight || canvas.height;
        this.startDegree  = opts.startDegree;
        this.sliceLabels  = opts.sliceLabels  || [];
        this.ringFills    = opts.ringFills    || [];
        this.ringLabels   = opts.ringLabels   || [];
        this.bullseyeFill = opts.bullseyeFill || '#c0c0c0';
        this.allowDrag    = opts.allowDrag;
        this.onPointClick = opts.onPointClick || function (){};
        this.onSliceClick = opts.onSliceClick || function (){};
        this.onMouseOver  = opts.onMouseOver  || function (){};

        this.centerX 			= this.width / 2;
        this.centerY 			= this.height / 2;
        this.numRings 			= this.ringLabels.length;
        this.ringSize 			= this.width / this.numRings * 0.35;
        this.maxRadius 			= this.width * .4;
        this.sliceLabelRadius 	= this.maxRadius + 35;
        this.bullseyeRadius     = 30;
	
        this.canvas = canvas;
        this.points = [];
        this.ringRadii = [];
        this.sliceAreas = [];

        // draw chart components in specific order
        this.drawRings(canvas);
        this.drawSlices(canvas);
        this.drawRibbon(canvas, this.centerX, this.centerY, this.maxRadius + 5, 265, 275, {fill: '45-#808080-#000000', 'fill-opacity': 0.4, 'stroke-width': 2, stroke: '#ffffff'});
        this.drawRingLabels(canvas);
        this.drawBullseye(canvas);

        // in order to determine the first ring
        this.ringRadii.push(this.bullseyeRadius);
        // make it ascending order
        this.ringRadii.reverse();
    }

    B.onMouseOverSlice = function(area) {
        area.attr({
            fill: '#0000ff',
            opacity: 0.1
        });
    }

    B.onMouseOutSlice = function(area) {
        area.attr({
            fill: '#fff',
            opacity: 0
        });
    }

    B.drawRings = function(canvas) {
        var numRings = this.numRings,
            maxRadius = this.maxRadius,
            ringSize = this.ringSize,
            ringFills = this.ringFills,
            x = this.centerX,
            y = this.centerY;

        for (var i = numRings - 1, radius = maxRadius; i >= 0 ; i--, radius -= ringSize) {
            // shadow
            canvas.circle(x, y, radius + 2)
            .attr({
                stroke: '#000000',
                'stroke-width': 2,
                'stroke-opacity': 0.2
            });
                    
            // ring
            canvas.circle(x, y, radius)
            .attr({
                fill: ringFills[i] || '#ffffff',
                stroke: '#ffffff',
                'stroke-width': 4
            });		

            this.ringRadii.push(radius);
        }

    }


    B.drawBullseye = function(canvas) {
        var centerX = this.centerX,
            centerY = this.centerY,
            bullseyeRadius = this.bullseyeRadius,
            bullseyeFill = this.bullseyeFill;

        // draw bullseye
        // shadow
        canvas.circle(centerX, centerY, bullseyeRadius + 1)
        .attr({
            stroke: '#000000',
            'stroke-width': 2,
            'stroke-opacity': 0.5
        })
        
        // ring
        canvas.circle(centerX, centerY, bullseyeRadius)
        .attr({
            fill: bullseyeFill,
            'stroke-width': 0
	});
    }

    // draw the ribbon, serves as the background layer for the ring labels
    B.drawRingLabels = function(canvas) {
        var centerX = this.centerX,
            centerY = this.centerY,
            maxRadius = this.maxRadius,
            ringLabels = this.ringLabels,
            ringSize = this.ringSize;

        //
        // draw the ring labels on top of the ribbon
        for (var i = ringLabels.length - 1, radius = maxRadius; i >= 0 ; i--, radius -= ringSize) {
            canvas.text(centerX, centerY + radius - 25, (""+ringLabels[i]).replace(/ /g, '\n'))
            .attr({
                fill: '#ffffff',
                'font-weight': 'bold',
                'font-size': '8pt'
            });
        }
    }

    B.drawSliceArea = function(canvas, cx, cy, r, startAngle, endAngle, params) {
        var x1 = cx + r * Math.cos(-startAngle * RAD_CONST),
            x2 = cx + r * Math.cos(-endAngle * RAD_CONST),
            y1 = cy + r * Math.sin(-startAngle * RAD_CONST),
            y2 = cy + r * Math.sin(-endAngle * RAD_CONST);

        return canvas.path(["M", cx, cy, "L", x1, y1, "A", r, r, 0, + (endAngle - startAngle > 180), 0, x2, y2, "z"]).attr(params);
    }


    B.drawRibbon = function(canvas, cx, cy, r, startAngle, endAngle, params) {
        var x1 = cx + r * Math.cos(-startAngle * RAD_CONST),
            x2 = cx + r * Math.cos(-endAngle * RAD_CONST),
            y1 = cy + r * Math.sin(-startAngle * RAD_CONST),
            y2 = cy + r * Math.sin(-endAngle * RAD_CONST);
        return canvas.path(["M", x1, cy, "L", x1, y1, "A", r, r, 0, +(endAngle - startAngle > 180), 0, x2, y2,  "L", x2, cy, "z"]).attr(params);
    }
    
    B.drawLine = function(canvas, cx, cy, r, angle, params) {
		var x = cx + r * Math.cos(-angle * RAD_CONST),
            y = cy + r * Math.sin(-angle * RAD_CONST);
        var line = canvas.path(["M", cx, cy, "L", x, y]).attr(params);
        line.endX = x;
        line.endY = y;
        return line;
    }

    

    B.drawSliceLabel = function(canvas, sliceIdx, labelDeg, line1, line2) {
        var self = this;
        var sliceLabelRadius = this.sliceLabelRadius,
            centerX = this.centerX,
            centerY = this.centerY,
            sliceLabels = this.sliceLabels,
            onSliceClick = this.onSliceClick;

		// calc label coords
		var x = Math.cos(labelDeg * RAD_CONST) * sliceLabelRadius + centerX;
		var y = centerY - Math.sin(labelDeg * RAD_CONST) * sliceLabelRadius;
		
		// calc label rotation
		var lx = line1.endX - line2.endX;
		var ly = line1.endY - line2.endY;
		var rotate = Math.atan2(ly, lx) / RAD_CONST;
		if (labelDeg > 180 && labelDeg < 360) rotate = 180 + rotate;

		// require closure for click event
		(function(sliceIdx) {
			canvas.text(x, y, sliceLabels[sliceIdx]).transform("r" + rotate)
			.attr({
				'font-size': 14,
				'stroke-width': 2,
				stroke: '#fff',
				'stroke-opacity': 0.05		// semi transparent stroke, so mouse has more space to hover over
			})
			.click(function() { onSliceClick(sliceIdx) })
			.hover(function() {
				this.node.style.cursor = "pointer";
				this.attr({
					fill: '#437dd3'
				});
                self.onMouseOverSlice(self.sliceAreas[sliceIdx]);
			}, 
			function() {
				this.attr({
					fill: '#000000'						
				});
                self.onMouseOutSlice(self.sliceAreas[sliceIdx]);
			});
		})(sliceIdx);
	}
    
    // draw slice separators and slice labels
    B.drawSlices = function(canvas) {
        var self = this;
        var centerX = this.centerX,
            centerY = this.centerY,
            maxRadius = this.maxRadius,
            sliceLabels = this.sliceLabels,
            numSlices  = sliceLabels.length,
            sliceAngle = 360 / numSlices,
            startDegree = this.startDegree != null ? this.startDegree : -sliceAngle/2,
            line_deg, 
            line;

        if (this.startDegree > 0) {
            // make the start degree negative, preserves correct label rotation
            // eg 330 -> -30
            this.startDegree = this.startDegree % 360 - 360;
        }

        for (var i = -1, line_deg = startDegree; i < numSlices; i++, line_deg += sliceAngle) {
            var prev_line = line;
            
            // draw separator shadow
            this.drawLine(canvas, centerX, centerY, maxRadius + 2, line_deg, {stroke: '#000000', 'stroke-width': 5, 'stroke-opacity': 0.15});
            // draw slice separator
            line = this.drawLine(canvas, centerX, centerY, maxRadius + 2, line_deg, {stroke: '#ffffff', 'stroke-width': 4});
            
            if (prev_line) {  
                // draw slice label between 2 line separators
                this.drawSliceLabel(canvas, i, line_deg - sliceAngle / 2, prev_line, line);

                // slice highlight area
                var area = this.drawSliceArea(canvas, centerX, centerY, maxRadius + 2, line_deg - sliceAngle + 1, line_deg - 1, {'fill': '#fff', 'opacity': 0});

                this.sliceAreas.push(area);
            }
        }
    }

	B.removePoint = function(myPoint) {
        var points = this.points;
		var removeIndex;
		for (var i = 0; i < points.length; i++) {
			if (myPoint.id == points[i].id) {
				removeIndex = i;
				break;
			}
		}

		if (removeIndex != null)
			points.splice(removeIndex, 1);
		
		myPoint.label.remove();
		myPoint.remove();
	}

     
    B.getPoints = function() {
        return this.points;
    }

    /**
     * Adds new point to the chart
     * @param {Object}  opts             Options for the new point
     * @param {Decimal} opts.angle       Positive angle of the point from the origin (in radians)          
     * @param {Integer} [opts.ring]      The ring index (-1 for origin, 0 for first ring)
     * @param {Decimal} opts.distance    If ring is provided, % distance from start of ring boundary to the end else % distance from origin to the last ring  
     * @param {String}  [opts.pointFill] Hex color of point
     * @param {Integer} [opts.pointSize] Radius in pixels
     * @param {String}  [opts.label]     Optional label
     */
    B.addPoint = function(opts) {
        var self = this;
        var canvas = this.canvas,
            maxRadius = this.maxRadius,
            centerX = this.centerX,
            centerY = this.centerY,
            onPointClick = this.onPointClick,
            onMouseOver = this.onMouseOver,
            allowDrag = this.allowDrag,
            bullseyeRadius = this.bullseyeRadius;

        var angle    = opts.angle || 0,
            distance = opts.distance || 0,
            ring     = opts.ring;

        var radius;
        if (ring == null) {
            radius = distance * maxRadius
        } else {
            var bounds = this.getBounds(ring);
            var ringSize = bounds[1] - bounds[0];
            var d = distance * ringSize;
            radius = d + bounds[0];
        }
        
        var pointX = centerX + radius * Math.cos(angle),
            pointY = centerY - radius * Math.sin(angle);	
        
        var pointFill = opts.pointFill || '#00ff00',
            pointSize = opts.pointSize || 5;
        
        var point = canvas.circle(pointX, pointY, pointSize)
        .attr({
            fill: pointFill,
            stroke: 0,
            'stroke-width': 0
        })
        .click(function() { onPointClick(this) })
        .hover(function() {
            // introduce a small delay (mitigates IE's mouse flicker)
            setTimeout(function() {
                onMouseOver(point);
            }, 50);
            
            this.attr({
                stroke: '#FFFF00',
                'stroke-width': 2,
                'stroke-opacity': .5
            });
            this.node.style.cursor = "pointer";
        },
        function() {
            this.attr({
                stroke: 0,
                'stroke-width': 0
            });
        });
        
        if (allowDrag) {
            point.drag(
                function (dx, dy) {	// on move
                    this.update(dx - (this.dx || 0), dy - (this.dy || 0));
                    this.dx = dx;
                    this.dy = dy;
                }, 
                function(dx, dy) {	// start drag
                    this.dx = this.dy = 0;
                }, 
                function() {	// end drag
                    var X = this.attr("cx") - centerX,
                        Y = centerY - this.attr("cy");
                    
                    // polar coordinate system: (distance, degrees)
                    this.radius = Math.sqrt(Math.pow(X, 2) + Math.pow(Y, 2));
                    // calculate relative distance from origin
                    this.distance = this.radius / maxRadius;
                    
                    // 
                    // Calculate relative distance from ring boundary 
                    var ring = this.getRing();
                    
                    var bounds = self.getBounds(ring),
                        low_bound = bounds[0],
                        upper_bound = bounds[1];
                    
                    if (upper_bound == -1)
                        this.ringDistance = -1;  // we're out of bounds, ie not in a ring
                    else
                        this.ringDistance = (this.radius - low_bound) / (upper_bound - low_bound);

                    this.angle = Math.atan2(Y, X);
                   
                    if (this.angle < 0)
                        this.angle = 2*Math.PI + this.angle; 
                }
            );
        }
        
        
        this.points.push(point);
        
        point.update = function (x, y) {
            // update point coord
            var X = this.attr("cx") + x,
                Y = this.attr("cy") + y;
            this.attr({cx: X, cy: Y});
            
            // update label Y-position
            this.label.attr({y: this.label.attrs.y + y});
            // update label X-position
            this.setLabel();
        }
        
        point.getSlice = function() {
            if (this.radius < bullseyeRadius)
                return null;
            return self.getSlice(this.angle);
        }
        
        point.getRing = function() {
            return self.getRing(this.radius);
        }
        
        point.setLabel = function(str) {
        	if (!this.label) {
        		this.label = canvas.text(-9999, this.attrs.cy, str);
        	}
        	else if (str !== undefined) {
                // update label text
                this.label.attr({
                    text: str
                });
            }
            
            // update label X-positon
            var pw = this.getBBox().width;
            var px = this.attrs.cx;
            var lw = this.label.getBBox().width;			
            var offset = pw + lw / 2;
            
            // if point is left of the Y-axis, place label to the left of the point
            if (px + 10 < centerX) 
                offset = offset * -1;

            this.label.attr({
                x: px + offset
            });
        }
        
        point.angle = angle;
        point.radius = radius;
        point.distance = radius / maxRadius;
        point.ringDistance = distance;
        
        point.setLabel(opts.label || 'Point ' + point.id);
        
        return point;
    }

	B.getBounds = function(ring) {
        var ringRadii = this.ringRadii;

		// defaults when inside bullseye
		var low_bound = 0,
        	upper_bound = ringRadii[0];
        
        if (ring == null) {	// out of bounds
        	low_bound = ringRadii[ringRadii.length - 1];
        	upper_bound = -1;
        } else if (ring >= 0) {	// inside a ring
        	low_bound = ringRadii[ring];
        	upper_bound = ringRadii[ring + 1];
        }
        return [low_bound, upper_bound];
	}
	
	B.getSlice = function(radians) {
        var sliceLabels = this.sliceLabels,
            degrees     = radians / RAD_CONST,
            sliceDeg    = 360 / sliceLabels.length,
            startDeg    = -1 * sliceDeg / 2,	// eg -30
            posStartDeg = 360 + startDeg;	// -30 becomes 330

		if (degrees < 0) 
			degrees = 180 + (180 + degrees);	// -90 becomes 270 
		
		for (var d = startDeg, i = 0; d < posStartDeg; d += sliceDeg, i++)
			// 1st condition: if degrees > posStartDeg, then we're in the first slice. dont have to test upper bound
			// 2nd condition: test all slices one by one against the degree param
			if (degrees >= posStartDeg || degrees >= d && degrees < d + sliceDeg) 				
				return i; 
	}
	
	B.getRing = function(radius) {
        var ringRadii = this.ringRadii;

		// there are no rings beyond max, just white space
		var max = ringRadii[ringRadii.length - 1];
		for (var i = ringRadii.length - 1; i >= 0; i--) 
			if (max > radius && radius > ringRadii[i]) 
				return i;
				
		if (ringRadii[0] > radius) 
			return -1;
	}
	
    var b = new Bullseye(this, opts);

    return b;

};
