"use strict";
exports.__esModule = true;
// Version 1.16
//
// Interface:
//
//          +----------
//          |  root   |
//          +---------+
//               |
//  +---------+  |  +---------+
//  | 'l' box |--+--| 'r' box |
//  +---------+  |  +---------+
//               |
//          +----------
//          | 'u' box |
//          +----------
//
// setSize(width, height, hspace, vspace, hshift)
// 		Generic setting, all boxes will have the same size.
// 	width	box width in pixels (optional)
// 	height	box height in pixels (optional)
// 	hspace	horizontal space between boxes (optional)
// 	vspace	vertical space between boxes (optional)
// 	hshift	horizontal shift for 'l' and 'r' boxes (optional)
//
// setNodeStyle(toprad, botrad, shadow)
// 		Set the corner style and shade for all node from now on
// 	toprad	The radius of the corners on the top. 0 for square boxes. Default value is 5.
// 	botrad	The radius of the corners on the bottom. 0 for square boxes. Default value is 5.
// 	shadow	Offset of the shadow. 0 for no shadow. Default value is 3.
// 		No negative values for this function
//
// setFont(fname, size, color, valign)
// 		Set the font for nodes from now on
// 	fname	font name (eq. "arial")
// 	size	font size (in pixels, eg "12")
// 	color	rgb font color (optional, not changed if omitted)
// 	valign	Vertical alignment on/off (optional, not changed if omitted)
//
// setColor(bline, bfill, btext, cline)
// 		Set the colors for the nodes from now on
// 	bline	rgb line color for the boxes (optional, not changed if omitted)
// 	bfill	rgb fill color for the boxes (optional, not changed if omitted)
// 	btext	rgb font color for the boxes (optional, not changed if omitted)
// 	cline	rgb line color for the connection lines (optional, not changed if omitted)
//
// addNode(id, parent, ctype, text, bold, url, cline, cfill, ctext, image, imgalign)
// 		Add a node to the chart
// 	id	unique id of this node (required)
// 	parent	id of the parent node (-1 for no parent)
// 	ctype	connection type to the parent ('u' for under, 'l' for left, 'r' for right)
// 	text	the text for the box (optional, none if omitted)
// 	bold	bold lines for this box (optional, no bold if omitted)
// 	url	a link attached to the box (optional, none if omitted)
// 	cline	rgb line color (optional, default value will be used if omitted)
// 	cfill	rgb fill color (optional, default value will be used if omitted)
// 	ctext	rgb font color (optional, default value will be used if omitted)
// 	image	optional image
// 	align	image alignment L(eft), C(enter), R(ight) + T(op), M(iddle), B(ottom)
//
// drawChart(id, align, fit)
// 		Draws the chart on the canvas
// 	id	id of the canvas
// 	align	'c' of 'center' for horizontal alignment on the canvas (left alignment if omitted)
// 	fit	if 'true', resize the canvas to just fit the chart
//
// redrawChart(id)
// 		Re-draws the in-memory chart on the canvas
// 		(Resizing a canvas clears the content).
// 	id	id of the canvas
//
// setDebug(value)
// 		Sets the global debug mode
// 	value	1 for on, 0 for off
//
// eg. var MyChart = new orgChart();
//
var gVmlCanvasManager = null; // so non-IE won't freak out
var OrgChart = /** @class */ (function () {
    function OrgChart() {
        ///////////////////
        // Default values:
        ///////////////////
        var _this = this;
        this.drawChart = function (id, align, fit) {
            // siblings may be added. Reset all positions first:
            var i;
            for (i = 0; i < _this.nodes.length; i++) {
                _this.nodes[i].hpos = -1;
                _this.nodes[i].vpos = -1;
                _this.nodes[i].usib = [];
                _this.nodes[i].rsib = [];
                _this.nodes[i].lsib = [];
            }
            _this.drawChartPriv(id, true, align, fit);
        };
        this.redrawChart = function (id) {
            _this.drawChartPriv(id, false);
        };
        this.lineColor = // Color of the connection lines (global for all lines)
            "#3388DD";
        this.boxWidth = 120; // Box width (global for all boxes)
        this.boxHeight = 30; // Box height (global for all boxes)
        this.hSpace = 30; // Horizontal space in between the boxes (global for all boxes)
        this.vSpace = 20; // Vertical space in between the boxes (global for all boxes)
        this.hShift = 15; // The number of pixels vertical siblings are shifted (global for all boxes)
        this.boxLineColor = // Default box line color
            "#B5D9EA";
        this.boxFillColor = // Default box fill color
            "#CFE8EF";
        this.textColor = // Default box text color
            "#000000";
        this.textFont = // Default font
            "arial";
        this.textSize = 12; // Default text size (pixels, not points)
        this.textVAlign = 1; // Default text alignment
        this.curshadowOffsetX = 3;
        this.curshadowOffsetY = 3;
        this.shadowColor = "#A1A1A1";
        this.curtopradius = 5;
        this.curbotradius = 5;
        this.nodes = [];
        var theCanvas;
        this.centerParentOverCompleteTree = 0; // Experimental, lines may loose connections
        var debug = 0;
        this.maxLoop = 9;
        this.minDistBetweenLineAndBox = 5;
        this.noalerts = 0;
        //////////////////////
        // Internal functions:
        //////////////////////
        this.drawChartPriv = null;
        var orgChartMouseMove;
        var orgChartClick;
        var vShiftUsibUnderParent;
        var vShiftTree;
        var hShiftTree;
        var hShiftTreeAndRBrothers;
        var fillParentix;
        var checkLines;
        var checkLinesRec;
        var checkOverlap;
        var countSiblings;
        var positionBoxes;
        var positionTree;
        var reposParents;
        var reposParentsRec;
        var findRightMost;
        var findRightMostAtVpos;
        var findLeftMost;
        var findNodeOnLine;
        this.drawImageNodes = null;
        var drawNode;
        var drawConLines;
        var getNodeAt;
        var getEndOfDownline;
        var getNodeAtUnequal;
        var makeRoomForDownline;
        var underVSib;
        var cleanText;
        var overlapBoxInTree;
        var getLowestBox;
        var getRootNode;
        var getUParent;
        var nodeUnderParent;
        var getAbsPosX;
        var getAbsPosY;
        var centerOnCanvas;
        var leftOnCanvas;
        ////////////////////////////////////
        // Internal information structures:
        ////////////////////////////////////
        this.TreeNode = function (id, parent, contype, txt, bold, url, linecolor, fillcolor, textcolor, imgalign, imgvalign) {
            this.id = id; // User defined id
            this.parent = parent; // Parent id, user defined
            this.parentix = -1; // Parent index in the nodes array, -1 for no parent
            this.contype = contype; // 'u', 'l', 'r'
            this.txt = txt; // Text for the box
            this.bold = bold; // 1 for bold, 0 if not
            this.url = url; // url
            this.linecolor = linecolor;
            this.fillcolor = fillcolor;
            this.textcolor = textcolor;
            this.textfont = this.textFont;
            this.textsize = this.textSize;
            this.valign = this.textVAlign;
            this.hpos = -1; // Horizontal starting position in pixels
            this.vpos = -1; // Vertical starting position in pixels
            this.usib = []; // 'u' siblings
            this.rsib = []; // 'r' siblings
            this.lsib = []; // 'l' siblings
            this.img = ""; // Optional image
            this.imgAlign = imgalign; // Image alignment 'l', 'c', 'r'
            this.imgVAlign = imgvalign; // Image vertical alignment 't', 'm', 'b'
            this.imgDrawn = 0;
            this.topradius = this.curtopradius;
            this.botradius = this.curbotradius;
            this.shadowOffsetX = this.curshadowOffsetX;
            this.shadowOffsetY = this.curshadowOffsetY;
        };
        //////////////////////
        // Internal functions:
        //////////////////////
        this.drawChartPriv = function (id, repos, align, fit) {
            var i;
            var ctx;
            var devicePixelRatio;
            var backingStoreRatio;
            var width;
            var height;
            var ratio;
            theCanvas = document.getElementById(id);
            if (!theCanvas) {
                alert("Canvas id '" + id + "' not found");
                return;
            }
            if (gVmlCanvasManager !== undefined) {
                // ie IE
                gVmlCanvasManager.initElement(theCanvas);
            }
            ctx = theCanvas.getContext("2d");
            ctx.lineWidth = 1;
            ctx.fillStyle = _this.boxFillColor;
            ctx.strokeStyle = _this.boxLineColor;
            if (repos) {
                fillParentix();
                countSiblings();
                positionBoxes();
                checkOverlap();
                checkLines();
                reposParents();
            }
            if (!fit) {
                if (align === "c" || align === "center") {
                    centerOnCanvas(theCanvas.width);
                }
                else {
                    leftOnCanvas();
                }
            }
            if (fit) {
                var maxW = 0;
                var maxH = 0;
                // tslint:disable-next-line:no-shadowed-variable
                var i_1;
                leftOnCanvas();
                for (i_1 = 0; i_1 < _this.nodes.length; i_1++) {
                    if (_this.nodes[i_1].hpos + _this.boxWidth + _this.nodes[i_1].shadowOffsetX > maxW) {
                        maxW = _this.nodes[i_1].hpos + _this.boxWidth + _this.nodes[i_1].shadowOffsetX;
                    }
                    if (_this.nodes[i_1].vpos + _this.boxHeight + _this.nodes[i_1].shadowOffsetY > maxH) {
                        maxH = _this.nodes[i_1].vpos + _this.boxHeight + _this.nodes[i_1].shadowOffsetY;
                    }
                }
                if (maxW > 0 && maxH > 0) {
                    theCanvas.width = maxW;
                    theCanvas.height = maxH;
                }
            }
            // High dpi displays:
            if ("devicePixelRatio" in window && theCanvas.width !== 0) {
                devicePixelRatio = window.devicePixelRatio || 1;
                backingStoreRatio =
                    ctx.webkitBackingStorePixelRatio ||
                        ctx.mozBackingStorePixelRatio ||
                        ctx.msBackingStorePixelRatio ||
                        ctx.oBackingStorePixelRatio ||
                        ctx.backingStorePixelRatio ||
                        1;
                ratio = devicePixelRatio / backingStoreRatio;
                width = theCanvas.width;
                height = theCanvas.height;
                if (ratio !== 1) {
                    theCanvas.width = width * ratio;
                    theCanvas.height = height * ratio;
                    theCanvas.style.width = width + "px";
                    theCanvas.style.height = height + "px";
                    ctx.scale(ratio, ratio);
                }
            }
            // Draw the lines:
            drawConLines(ctx);
            // Draw the boxes:
            for (i = 0; i < _this.nodes.length; i++) {
                drawNode(ctx, i);
            }
            // Add click behaviour:
            if (theCanvas.addEventListener) {
                theCanvas.removeEventListener("click", orgChartClick, false); // If any old on this canvas, remove it
                theCanvas.addEventListener("click", orgChartClick, false);
                theCanvas.addEventListener("mousemove", orgChartMouseMove, false);
            }
            else if (theCanvas.attachEvent) {
                // IE
                theCanvas.onclick = function () {
                    var mtarget = document.getElementById(id);
                    orgChartClick(event, mtarget.scrollLeft, mtarget.scrollTop - 20);
                };
                theCanvas.onmousemove = function () {
                    var mtarget = document.getElementById(id);
                    orgChartMouseMove(event, mtarget.scrollLeft, mtarget.scrollTop - 20);
                };
            }
        };
        orgChartMouseMove = function (event) {
            var x;
            var y;
            var i;
            x = event.clientX;
            y = event.clientY;
            x -= getAbsPosX(theCanvas);
            y -= getAbsPosY(theCanvas);
            if (document.documentElement && document.documentElement.scrollLeft) {
                x += document.documentElement.scrollLeft;
            }
            else {
                x += document.body.scrollLeft;
            }
            if (document.documentElement && document.documentElement.scrollTop) {
                y += document.documentElement.scrollTop;
            }
            else {
                y += document.body.scrollTop;
            }
            i = getNodeAt(x, y);
            if (i >= 0 && _this.nodes[i].url.length > 0) {
                document.body.style.cursor = "pointer";
            }
            else {
                document.body.style.cursor = "default";
            }
        };
        orgChartClick = function (event, offsetx, offsety) {
            var x;
            var y;
            var i;
            var i1;
            var i2;
            if (event.button < 0 || event.button > 1) {
                return; // left button (w3c: 0, IE: 1) only
            }
            x = event.clientX;
            y = event.clientY;
            x -= getAbsPosX(theCanvas);
            y -= getAbsPosY(theCanvas);
            if (document.documentElement && document.documentElement.scrollLeft) {
                x += document.documentElement.scrollLeft;
            }
            else {
                x += document.body.scrollLeft;
            }
            if (document.documentElement && document.documentElement.scrollTop) {
                y += document.documentElement.scrollTop;
            }
            else {
                y += document.body.scrollTop;
            }
            i = getNodeAt(x, y);
            if (i >= 0) {
                if (_this.nodes[i].url.length > 0) {
                    document.body.style.cursor = "default";
                    i1 = _this.nodes[i].url.indexOf("://");
                    i2 = _this.nodes[i].url.indexOf("/");
                    if (i1 >= 0 && i2 > i1) {
                        window.open(_this.nodes[i].url);
                    }
                    else {
                        // window.location = this.nodes[i].url;
                    }
                }
            }
        };
        vShiftUsibUnderParent = function (p, h, ymin) {
            // Shift all usiblings with a vpos >= ymin down, except this parent.
            // ymin is optional
            if (ymin === undefined) {
                ymin = 0;
            }
            var s;
            for (s = 0; s < _this.nodes[p].usib.length; s++) {
                vShiftTree(_this.nodes[p].usib[s], h, ymin);
            }
        };
        vShiftTree = function (p, h, ymin) {
            // Shift all siblings 'h' down (if they have a position already)
            var s;
            if (_this.nodes[p].vpos >= 0 && _this.nodes[p].vpos >= ymin) {
                _this.nodes[p].vpos += h;
            }
            for (s = 0; s < _this.nodes[p].usib.length; s++) {
                vShiftTree(_this.nodes[p].usib[s], h, ymin);
            }
            for (s = 0; s < _this.nodes[p].lsib.length; s++) {
                vShiftTree(_this.nodes[p].lsib[s], h, ymin);
            }
            for (s = 0; s < _this.nodes[p].rsib.length; s++) {
                vShiftTree(_this.nodes[p].rsib[s], h, ymin);
            }
        };
        hShiftTree = function (p, w) {
            // Shift all siblings (which have a position already) 'w' pixels
            var s;
            if (_this.nodes[p].hpos >= 0) {
                _this.nodes[p].hpos += w;
            }
            for (s = 0; s < _this.nodes[p].usib.length; s++) {
                hShiftTree(_this.nodes[p].usib[s], w);
            }
            for (s = 0; s < _this.nodes[p].lsib.length; s++) {
                hShiftTree(_this.nodes[p].lsib[s], w);
            }
            for (s = 0; s < _this.nodes[p].rsib.length; s++) {
                hShiftTree(_this.nodes[p].rsib[s], w);
            }
        };
        hShiftTreeAndRBrothers = function (p, w) {
            // Shift this tree to the right.
            // If this is an 'u' sib, also shift all brothers which are to the right too.
            // (In which case we shift all other root nodes too).
            var i;
            var q;
            var s;
            var hpos;
            var hpos2;
            var rp;
            hpos = _this.nodes[p].hpos;
            rp = getRootNode(p);
            hpos2 = _this.nodes[rp].hpos;
            if (_this.nodes[p].contype === "u" && _this.nodes[p].parent !== "") {
                q = _this.nodes[p].parentix;
                for (s = _this.nodes[q].usib.length - 1; s >= 0; s--) {
                    hShiftTree(_this.nodes[q].usib[s], w);
                    if (_this.nodes[q].usib[s] === p) {
                        break;
                    }
                }
            }
            else {
                hShiftTree(p, w);
            }
            if (_this.nodes[p].contype === "u") {
                for (i = 0; i < _this.nodes.length; i++) {
                    if (i !== rp && _this.nodes[i].parent === "" && _this.nodes[i].hpos > hpos2) {
                        hShiftTree(i, w);
                    }
                }
            }
        };
        fillParentix = function () {
            // Fill all nodes with the index of the parent.
            var i;
            var j;
            for (i = 0; i < _this.nodes.length; i++) {
                if (_this.nodes[i].parent !== "") {
                    for (j = 0; j < _this.nodes.length; j++) {
                        if (_this.nodes[i].parent === _this.nodes[j].id) {
                            _this.nodes[i].parentix = j;
                            break;
                        }
                    }
                    if (_this.nodes[i].parentix === -1) {
                        _this.nodes[i].parent = "";
                    }
                }
            }
        };
        checkLines = function () {
            // Check all vertical lines for crossing boxes. If so, shift to the right.
            var p;
            for (p = 0; p < _this.nodes.length; p++) {
                if (_this.nodes[p].parent === "") {
                    checkLinesRec(p);
                }
            }
        };
        checkLinesRec = function (p) {
            var s;
            var t = null;
            var r;
            var x;
            var l = null;
            var y;
            var y2;
            var n;
            var m;
            var i;
            var rp;
            var rs;
            var v;
            var w;
            var branch;
            var tm;
            var hdl = null;
            var vdl = null;
            y = 0;
            // Check lsib, the latest is the lowest point:
            n = _this.nodes[p].lsib.length;
            if (n > 0) {
                s = _this.nodes[p].lsib[n - 1];
                y = _this.nodes[s].vpos + _this.boxHeight / 2;
            }
            // Check rsib, the latest is the lowest point:
            n = _this.nodes[p].rsib.length;
            if (n > 0) {
                s = _this.nodes[p].rsib[n - 1];
                y2 = _this.nodes[s].vpos + _this.boxHeight / 2;
                y = Math.max(y, y2);
            }
            // If usib, the lowest point is even lower:
            n = _this.nodes[p].usib.length;
            if (n > 0) {
                s = _this.nodes[p].usib[0];
                y = _this.nodes[s].vpos - _this.vSpace / 2;
            }
            if (y > 0) {
                for (n = _this.nodes[p].vpos + _this.boxHeight / 2 + _this.boxHeight + _this.vSpace; n <= y; n += _this.boxHeight + _this.vSpace) {
                    m = 0;
                    do {
                        s = getNodeAt(_this.nodes[p].hpos + _this.boxWidth / 2 - _this.minDistBetweenLineAndBox, n);
                        if (s >= 0) {
                            // If the node found is a sib of the box with the downline, shifting the parent doesn't help:
                            w =
                                _this.nodes[s].hpos +
                                    _this.boxWidth +
                                    _this.hSpace / 2 -
                                    (_this.nodes[p].hpos + _this.boxWidth / 2);
                            rp = s;
                            i = 0;
                            while (_this.nodes[rp].parent !== "" && rp !== p) {
                                rp = _this.nodes[rp].parentix;
                            }
                            if (rp !== p) {
                                // Find the parent of s on the same vpos as p to decide what to shift:
                                rs = s;
                                while (_this.nodes[rs].parent !== "" &&
                                    _this.nodes[rs].vpos > _this.nodes[p].vpos) {
                                    rs = _this.nodes[rs].parentix;
                                }
                                rp = p;
                                while (_this.nodes[rp].parent !== "" && _this.nodes[rp].contype !== "u") {
                                    rp = _this.nodes[rp].parentix;
                                }
                                if (_this.nodes[rs].hpos > _this.nodes[p].hpos) {
                                    // w =  nodes[p].hpos + boxWidth / 2 + hSpace - nodes[s].hpos;
                                    hShiftTreeAndRBrothers(rs, w);
                                }
                                else {
                                    hShiftTreeAndRBrothers(rp, w);
                                }
                            }
                            else {
                                branch = _this.nodes[s].contype;
                                tm = s;
                                while (_this.nodes[tm].parentix !== "" && _this.nodes[tm].parentix !== p) {
                                    tm = _this.nodes[tm].parentix;
                                }
                                branch = _this.nodes[tm].contype;
                                rs = getRootNode(s);
                                rp = getRootNode(p);
                                if (rs === rp) {
                                    if (branch === "l") {
                                        w =
                                            _this.nodes[s].hpos +
                                                _this.boxWidth +
                                                _this.hSpace / 2 -
                                                (_this.nodes[p].hpos + _this.boxWidth / 2);
                                        while (_this.nodes[p].parentix !== "" &&
                                            _this.nodes[p].contype !== "u") {
                                            p = _this.nodes[p].parentix;
                                        }
                                        hShiftTreeAndRBrothers(p, w);
                                        hShiftTree(tm, -w);
                                        // Move rsibs back to the left as far as possible
                                        v = getEndOfDownline(p);
                                        for (r = 0; r < _this.nodes[p].rsib.length; r++) {
                                            if (_this.nodes[_this.nodes[p].rsib[r]].hpos >= 0) {
                                                x = findLeftMost(_this.nodes[p].rsib[r], v);
                                                // If the leftmost is the r-sib itself, use the default hShift distance.
                                                // Use this.hSpace otherwise, it look better.
                                                if (x === _this.nodes[p].rsib[r].hpos) {
                                                    w = _this.nodes[p].hpos + _this.boxWidth / 2 + _this.hShift - x;
                                                }
                                                else {
                                                    w = _this.nodes[p].hpos + _this.boxWidth / 2 + _this.hSpace / 2 - x;
                                                }
                                                if (w) {
                                                    hShiftTree(_this.nodes[p].rsib[r], w);
                                                }
                                            }
                                        }
                                    }
                                    else {
                                        w = _this.nodes[p].hpos + _this.boxWidth / 2 - _this.nodes[s].hpos + _this.hSpace;
                                        hShiftTreeAndRBrothers(tm, w);
                                    }
                                }
                                else {
                                    if (_this.nodes[rp].hpos > _this.nodes[rs].hpos) {
                                        hShiftTree(rp, w);
                                    }
                                    else {
                                        hShiftTree(rs, w);
                                    }
                                }
                            }
                        }
                        m++;
                    } while (s >= 0 && m < _this.maxLoop);
                }
            }
            // Check the siblings:
            for (s = 0; s < _this.nodes[p].usib.length; s++) {
                checkLinesRec(_this.nodes[p].usib[s]);
            }
            for (s = 0; s < _this.nodes[p].lsib.length; s++) {
                checkLinesRec(_this.nodes[p].lsib[s]);
            }
            for (s = 0; s < _this.nodes[p].rsib.length; s++) {
                checkLinesRec(_this.nodes[p].rsib[s]);
            }
        };
        checkOverlap = function () {
            var i;
            var j;
            var retry;
            var m;
            var ui;
            var uj;
            var w;
            // Boxes direct on top of another box?
            m = 0;
            retry = 1;
            while (m < _this.maxLoop && retry) {
                retry = 0;
                m++;
                for (i = 0; i < _this.nodes.length; i++) {
                    for (j = i + 1; j < _this.nodes.length; j++) {
                        if (_this.nodes[i].hpos === _this.nodes[j].hpos &&
                            _this.nodes[i].vpos === _this.nodes[j].vpos) {
                            ui = getRootNode(i);
                            uj = getRootNode(j);
                            if (ui !== uj) {
                                hShiftTreeAndRBrothers(uj, _this.boxWidth + _this.hSpace);
                            }
                            else {
                                ui = getUParent(i);
                                uj = getUParent(j);
                                if (ui !== uj) {
                                    hShiftTreeAndRBrothers(uj, _this.boxWidth + _this.hSpace);
                                }
                                else {
                                    // In the right subtree, find the first 'u' or 'r' parent to shift.
                                    uj = j;
                                    while (_this.nodes[uj].parent !== "" &&
                                        _this.nodes[uj].contype !== "u" &&
                                        _this.nodes[uj].contype !== "r") {
                                        uj = _this.nodes[uj].parentix;
                                    }
                                    if (_this.nodes[uj].parent !== "") {
                                        hShiftTreeAndRBrothers(uj, _this.boxWidth + _this.hSpace);
                                    }
                                }
                            }
                            retry = 1;
                        }
                    }
                }
            }
            // Small overlap?
            m = 0;
            retry = 1;
            while (m < _this.maxLoop && retry) {
                retry = 0;
                m++;
                for (i = 0; i < _this.nodes.length; i++) {
                    j = getNodeAtUnequal(_this.nodes[i].hpos + _this.minDistBetweenLineAndBox, _this.nodes[i].vpos + _this.boxHeight / 2, i);
                    if (j >= 0) {
                        ui = getUParent(i);
                        uj = getUParent(j);
                        if (ui !== uj) {
                            if (_this.nodes[ui].hpos > _this.nodes[uj].hpos) {
                                uj = ui;
                            }
                            if (_this.nodes[i].hpos > _this.nodes[j].hpos) {
                                w = _this.nodes[j].hpos - _this.nodes[i].hpos + _this.boxWidth + _this.hSpace;
                            }
                            else {
                                w = _this.nodes[i].hpos - _this.nodes[j].hpos + _this.boxWidth + _this.hSpace;
                            }
                            if (nodeUnderParent(i, ui) && nodeUnderParent(j, ui)) {
                                j = i;
                                while (j >= 0 && _this.nodes[j].contype === _this.nodes[i].contype) {
                                    j = _this.nodes[j].parentix;
                                }
                                if (j >= 0) {
                                    hShiftTreeAndRBrothers(j, w);
                                }
                            }
                            else {
                                while (_this.nodes[ui].parent !== "" &&
                                    _this.nodes[ui].contype === "u" &&
                                    _this.nodes[_this.nodes[ui].parentix].usib.length === 1) {
                                    ui = _this.nodes[ui].parentix;
                                }
                                hShiftTreeAndRBrothers(ui, w);
                            }
                            retry = 1;
                        }
                        else {
                            hShiftTreeAndRBrothers(i, _this.boxWidth / 2);
                            retry = 1;
                        }
                    }
                }
            }
        };
        countSiblings = function () {
            var i;
            var p;
            var h;
            var v;
            for (i = 0; i < _this.nodes.length; i++) {
                p = _this.nodes[i].parentix;
                if (p >= 0) {
                    if (_this.nodes[i].contype === "u") {
                        h = _this.nodes[p].usib.length;
                        _this.nodes[p].usib[h] = i;
                    }
                    if (_this.nodes[i].contype === "l") {
                        v = _this.nodes[p].lsib.length;
                        _this.nodes[p].lsib[v] = i;
                    }
                    if (_this.nodes[i].contype === "r") {
                        v = _this.nodes[p].rsib.length;
                        _this.nodes[p].rsib[v] = i;
                    }
                }
            }
        };
        positionBoxes = function () {
            var i;
            var x;
            // Position all top level boxes:
            // The starting pos is 'x'. After the tree is positioned, center it.
            x = 0;
            for (i = 0; i < _this.nodes.length; i++) {
                if (_this.nodes[i].parent === "") {
                    _this.nodes[i].hpos = x + _this.nodes[i].shadowOffsetX;
                    _this.nodes[i].vpos = 0 + _this.nodes[i].shadowOffsetY;
                    positionTree(i, x, x);
                    // hpos can be changed during positionTree:
                    x = findRightMost(i) + _this.boxWidth + _this.hSpace; // Start for next tree
                }
            }
        };
        positionTree = function (p) {
            // Position the complete tree under this parent.
            var h;
            var v;
            var s;
            var o;
            var i;
            var n;
            var w;
            var q;
            var r;
            var us;
            var uo;
            var x;
            var maxx = null;
            var minx = null;
            var max2 = null;
            var x1;
            var x2;
            var y;
            var hdl = null;
            var vdl = null;
            var l;
            var t = null;
            // p has a position already. Position 'l', 'r' and 'u' sibs:
            // Positioning all 'l' sibs:
            for (v = 0; v < _this.nodes[p].lsib.length; v++) {
                s = _this.nodes[p].lsib[v];
                // New lsib, so the downline crosses all the way down. Make room first:
                y = getLowestBox(p, "l") + _this.boxHeight + _this.vSpace;
                makeRoomForDownline(p, y);
                _this.nodes[s].hpos = _this.nodes[p].hpos - _this.boxWidth / 2 - _this.hShift;
                _this.nodes[s].vpos = y;
                if (_this.nodes[s].hpos < 0) {
                    for (r = 0; r < _this.nodes.length; r++) {
                        if (_this.nodes[r].parent === "") {
                            hShiftTree(r, -_this.nodes[s].hpos);
                        }
                    }
                    _this.nodes[s].hpos = 0;
                }
                // Overlap?
                n = 1;
                do {
                    o = getNodeAtUnequal(_this.nodes[s].hpos - _this.minDistBetweenLineAndBox, _this.nodes[s].vpos + _this.minDistBetweenLineAndBox, s);
                    if (o < 0) {
                        o = getNodeAtUnequal(_this.nodes[s].hpos + _this.boxWidth + _this.minDistBetweenLineAndBox, _this.nodes[s].vpos + _this.minDistBetweenLineAndBox, s);
                    }
                    if (o < 0) {
                        o = findNodeOnLine(_this.nodes[s].vpos, 999999, "l");
                        if (o === s) {
                            o = -1;
                        }
                    }
                    if (o >= 0) {
                        /* 1.16, much easier and better too:
                              h = nodes[s].hpos - nodes[o].hpos;
                              h = Math.abs(h);
                              w = nodes[o].hpos + boxWidth + hSpace - nodes[s].hpos;
                              if (nodes[o].contype === 'l') w += hSpace;
                              */
                        w = _this.nodes[o].hpos + _this.boxWidth + _this.hSpace - _this.nodes[s].hpos;
                        q = _this.nodes[s].parentix;
                        while (q !== -1 && _this.nodes[q].contype !== "u") {
                            q = _this.nodes[q].parentix;
                        }
                        if (q < 0) {
                            hShiftTree(p, w);
                        }
                        else {
                            if (!nodeUnderParent(o, q)) {
                                hShiftTreeAndRBrothers(q, w); // ! 2*w, dd 2013-10-21
                            }
                        }
                    }
                    n++;
                    if (n > _this.maxLoop) {
                        o = -1;
                    }
                } while (o >= 0);
                positionTree(s);
            }
            // Positioning all rsibs:
            for (v = 0; v < _this.nodes[p].rsib.length; v++) {
                s = _this.nodes[p].rsib[v];
                // Default placement: right from the parent and right from all other this.nodes in this row:
                _this.nodes[s].vpos = getLowestBox(p, "r") + _this.boxHeight + _this.vSpace;
                x1 = findRightMostAtVpos(_this.nodes[s].vpos);
                if (x1 > 0) {
                    x1 = x1 + _this.boxWidth + _this.hSpace;
                }
                x2 = _this.nodes[p].hpos + _this.boxWidth / 2 + _this.hShift;
                _this.nodes[s].hpos = Math.max(x1, x2);
                // Overlap?
                n = 1;
                do {
                    o = getNodeAtUnequal(_this.nodes[s].hpos - _this.minDistBetweenLineAndBox, _this.nodes[s].vpos + _this.minDistBetweenLineAndBox, s);
                    if (o < 0) {
                        o = getNodeAtUnequal(_this.nodes[s].hpos + _this.boxWidth + _this.minDistBetweenLineAndBox, _this.nodes[s].vpos + _this.minDistBetweenLineAndBox, s);
                    }
                    if (o < 0) {
                        o = findNodeOnLine(_this.nodes[s].vpos, 999999, "l");
                        if (o === s) {
                            o = -1;
                        }
                    }
                    if (o >= 0) {
                        h = _this.nodes[s].hpos - _this.nodes[o].hpos;
                        h = Math.abs(h);
                        q = _this.nodes[s].parentix;
                        while (q !== -1 && _this.nodes[q].contype !== "u") {
                            q = _this.nodes[q].parentix;
                        }
                        if (q < 0) {
                            hShiftTree(p, _this.boxWidth + _this.hSpace - h);
                        }
                        else {
                            us = getUParent(s);
                            uo = getUParent(o);
                            if (us === uo) {
                                if (!nodeUnderParent(o, q)) {
                                    hShiftTreeAndRBrothers(q, _this.boxWidth + _this.hSpace - h);
                                }
                            }
                            else {
                                // Shift the common parent (if any) to the right, and the uppermost
                                // parent of the existing o node back to the left:
                                us = getRootNode(s);
                                uo = getRootNode(o);
                                w = _this.nodes[o].hpos - _this.nodes[s].hpos + _this.boxWidth + _this.hSpace;
                                if (us === uo) {
                                    us = s;
                                    while (_this.nodes[us].parent !== "" &&
                                        !nodeUnderParent(o, _this.nodes[us].parentix)) {
                                        us = _this.nodes[us].parentix;
                                    }
                                    hShiftTreeAndRBrothers(us, w);
                                }
                                else {
                                    hShiftTreeAndRBrothers(s, w);
                                }
                            }
                        }
                    }
                    n++;
                    if (n > _this.maxLoop) {
                        o = -1;
                    }
                } while (o >= 0);
                positionTree(s);
            }
            // Make room for the downline (if necessary):
            v = getEndOfDownline(p);
            if (v > 0) {
                makeRoomForDownline(p, v); // Error in testset i33, use old code below
            }
            // 'u' sibs:
            v = getLowestBox(p, "lr") + _this.boxHeight + _this.vSpace;
            n = _this.nodes[p].usib.length;
            if (n > 0) {
                // If there is a left or right subtree, the starting position is on the right, the left or in between them:
                for (i = 0; i < _this.nodes[p].lsib.length; i++) {
                    x = findRightMost(_this.nodes[p].lsib[i], v);
                    if (_this.nodes[p].rsib.length > 0) {
                        w = x + _this.hSpace / 2 - _this.boxWidth / 2 - _this.nodes[p].hpos;
                    }
                    else {
                        w = x + _this.hShift / 2 - _this.boxWidth / 2 - _this.nodes[p].hpos;
                    }
                    if (w > 0) {
                        _this.nodes[p].hpos += w;
                        for (l = 0; l < i; l++) {
                            hShiftTree(_this.nodes[p].lsib[l], w);
                        }
                    }
                }
                // If right trees, shift the to the right of the (repositioned) root node:
                for (i = 0; i < _this.nodes[p].rsib.length; i++) {
                    x = findLeftMost(_this.nodes[p].rsib[i], v);
                    // If the node found is the lsib itself, use this.hShift. Otherwise use hSpace/2, it looks better.
                    if (x === _this.nodes[_this.nodes[p].rsib[i]].hpos) {
                        w = _this.nodes[p].hpos + _this.boxWidth / 2 + _this.hShift - x;
                    }
                    else {
                        w = _this.nodes[p].hpos + _this.boxWidth / 2 + _this.hSpace / 2 - x;
                    }
                    if (w) {
                        hShiftTree(_this.nodes[p].rsib[i], w);
                        x += w;
                    }
                }
                // If there are multiple usib nodes, try to place them under the left tree, centering under the parent:
                x1 = _this.nodes[p].hpos;
                x2 = _this.nodes[p].hpos;
                if (n >= 2 && x1 > 0) {
                    // Check all node on this vpos to overlap.
                    // Maybe we overlap a downline, this will be caught later on.
                    h = findNodeOnLine(v, _this.nodes[p].hpos, "l");
                    if (h < 0) {
                        x2 = x2 + _this.boxWidth / 2 - (n * _this.boxWidth + (n - 1) * _this.hSpace) / 2;
                        if (x2 < 0) {
                            x2 = 0;
                        }
                        x1 = x2;
                    }
                    if (h >= 0 && _this.nodes[h].hpos + _this.boxWidth + _this.hSpace < x1) {
                        x1 = _this.nodes[h].hpos + _this.boxWidth + _this.hSpace; // minimum x
                        x2 = x2 + _this.boxWidth / 2 - (n * _this.boxWidth + (n - 1) * _this.hSpace) / 2; // wanted
                        if (x1 > x2) {
                            x2 = x1;
                        }
                        else {
                            x1 = x2;
                        }
                    }
                }
                for (h = 0; h < _this.nodes[p].usib.length; h++) {
                    s = _this.nodes[p].usib[h];
                    _this.nodes[s].hpos = x2;
                    _this.nodes[s].vpos = getLowestBox(p, "lr") + _this.boxHeight + _this.vSpace;
                    v = underVSib(s);
                    // Overlap?
                    n = 0;
                    do {
                        o = getNodeAtUnequal(_this.nodes[s].hpos - _this.minDistBetweenLineAndBox, _this.nodes[s].vpos + _this.minDistBetweenLineAndBox, s);
                        if (o < 0) {
                            o = getNodeAtUnequal(_this.nodes[s].hpos + _this.boxWidth + _this.minDistBetweenLineAndBox, _this.nodes[s].vpos + _this.minDistBetweenLineAndBox, s);
                        }
                        if (o < 0) {
                            o = findNodeOnLine(_this.nodes[s].vpos, 999999, "l");
                            if (o === s) {
                                o = -1;
                            }
                        }
                        if (o >= 0) {
                            w = _this.nodes[o].hpos - _this.nodes[s].hpos + _this.boxWidth + _this.hSpace;
                            // Find the highest node, not in the path of the found 'o' node:
                            us = s;
                            while (_this.nodes[us].parent !== "" &&
                                !nodeUnderParent(o, _this.nodes[us].parentix)) {
                                us = _this.nodes[us].parentix;
                            }
                            hShiftTreeAndRBrothers(us, w);
                        }
                        n++;
                        if (n > _this.maxLoop) {
                            o = -1;
                        }
                    } while (o >= 0);
                    positionTree(s);
                    x2 = _this.nodes[s].hpos + _this.boxWidth + _this.hSpace;
                }
            }
            reposParentsRec(p);
        };
        reposParents = function () {
            // All parents with usibs are repositioned (start at the lowest level!)
            var i;
            for (i = 0; i < _this.nodes.length; i++) {
                if (_this.nodes[i].parentix === -1) {
                    reposParentsRec(i);
                }
            }
        };
        reposParentsRec = function (p) {
            var w;
            var s;
            var f;
            var h;
            var hpos;
            var r;
            var maxw;
            var minw;
            var d;
            var q;
            d = debug;
            debug = 0;
            hpos = _this.nodes[p].hpos;
            // The sibslings first:
            for (s = 0; s < _this.nodes[p].usib.length; s++) {
                reposParentsRec(_this.nodes[p].usib[s]);
            }
            for (s = 0; s < _this.nodes[p].lsib.length; s++) {
                reposParentsRec(_this.nodes[p].lsib[s]);
            }
            for (s = 0; s < _this.nodes[p].rsib.length; s++) {
                reposParentsRec(_this.nodes[p].rsib[s]);
            }
            // If this is a parent with two or more usibs, reposition it:
            // (Repos over 1 u sib too, just correct it if necessary)
            // Except if this is a sib, without room to move, limit the room to move.
            // Of course a r-sib of this sib can cause an overlap too.
            // Exception: if this is a node with only one usub, we need to position right above
            // the usib. If necessary, we need to move the complete parent tree.
            h = _this.nodes[p].usib.length;
            if (h >= 1) {
                maxw = -1;
                minw = -1;
                if (_this.nodes[p].contype === "l") {
                    r = _this.nodes[p].parentix;
                    maxw =
                        _this.nodes[r].hpos + _this.boxWidth / 2 - _this.boxWidth - _this.hSpace - _this.nodes[p].hpos;
                }
                if (_this.nodes[p].contype === "r") {
                    r = _this.nodes[p].parentix;
                    minw =
                        _this.nodes[r].hpos + _this.boxWidth / 2 - _this.hSpace - _this.boxWidth - _this.nodes[p].hpos;
                }
                w = 0;
                if (_this.centerParentOverCompleteTree) {
                    w = (findRightMost(p) - _this.nodes[p].hpos) / 2;
                }
                else {
                    f = _this.nodes[p].usib[0];
                    s = _this.nodes[p].usib[h - 1];
                    w =
                        _this.nodes[f].hpos + (_this.nodes[s].hpos - _this.nodes[f].hpos) / 2 - _this.nodes[p].hpos;
                }
                if (maxw >= 0 && w > maxw) {
                    w = maxw;
                }
                if (minw >= 0 && w > minw) {
                    w = minw;
                }
                s = findNodeOnLine(_this.nodes[p].vpos, _this.nodes[p].hpos, "r");
                if (s >= 0) {
                    if (_this.nodes[p].hpos + _this.boxWidth + _this.hSpace + w >= _this.nodes[s].hpos) {
                        w = _this.nodes[s].hpos - _this.boxWidth - _this.hSpace - _this.nodes[p].hpos;
                    }
                }
                if (_this.nodes[p].usib.length === 1 &&
                    _this.nodes[p].hpos + w !== _this.nodes[_this.nodes[p].usib[0]].hpos) {
                    w = _this.nodes[_this.nodes[p].usib[0]].hpos - _this.nodes[p].hpos;
                }
                // Check for a crossing with a rsib connection line:
                maxw = 999999;
                for (q = 0; q < _this.nodes.length; q++) {
                    if (_this.nodes[q].vpos === _this.nodes[p].vpos &&
                        _this.nodes[q].hpos > _this.nodes[p].hpos) {
                        maxw = _this.nodes[q].hpos - _this.nodes[p].hpos - _this.boxWidth - _this.hShift - _this.hSpace;
                        if (maxw < 0) {
                            maxw = 0;
                        }
                        if (w > maxw) {
                            w = maxw;
                        }
                    }
                }
                if (w > 1) {
                    // Shift this this.nodes and all 'l' and 'r' sib trees
                    _this.nodes[p].hpos += w;
                    for (s = 0; s < _this.nodes[p].lsib.length; s++) {
                        hShiftTree(_this.nodes[p].lsib[s], w);
                    }
                    for (s = 0; s < _this.nodes[p].rsib.length; s++) {
                        hShiftTree(_this.nodes[p].rsib[s], w);
                    }
                }
            }
            debug = d;
        };
        findRightMost = function (p, maxv) {
            // return the highest hpos of the given tree, if maxv is specified, vpos must be less than maxv:
            var maxx;
            var x;
            var i;
            if (maxv === undefined) {
                maxv = 999999;
            }
            if (_this.nodes[p].vpos <= maxv) {
                maxx = _this.nodes[p].hpos;
            }
            else {
                maxx = -1;
            }
            // usib to the right?
            for (i = 0; i < _this.nodes[p].usib.length; i++) {
                x = findRightMost(_this.nodes[p].usib[i], maxv);
                maxx = Math.max(x, maxx);
            }
            // Walk along the lsibs:
            for (i = 0; i < _this.nodes[p].lsib.length; i++) {
                x = findRightMost(_this.nodes[p].lsib[i], maxv);
                maxx = Math.max(x, maxx);
            }
            // Walk along the rsibs:
            for (i = 0; i < _this.nodes[p].rsib.length; i++) {
                x = findRightMost(_this.nodes[p].rsib[i], maxv);
                maxx = Math.max(x, maxx);
            }
            return maxx;
        };
        findRightMostAtVpos = function (v) {
            // return the highest hpos of any this.nodes at vpos 'v'
            var maxx;
            var i;
            maxx = -1;
            for (i = 0; i < _this.nodes.length; i++) {
                if (_this.nodes[i].vpos === v && _this.nodes[i].hpos > maxx) {
                    maxx = _this.nodes[i].hpos;
                }
            }
            return maxx;
        };
        findLeftMost = function (p, maxv) {
            // return the lowest hpos of the given tree:
            var minx;
            var x;
            var i;
            if (maxv === undefined) {
                maxv = 999999;
            }
            if (_this.nodes[p].vpos <= maxv) {
                minx = _this.nodes[p].hpos;
            }
            else {
                minx = 999999;
            }
            // usib to the left?
            if (_this.nodes[p].usib.length > 0) {
                x = findLeftMost(_this.nodes[p].usib[0], maxv);
                minx = Math.min(x, minx);
            }
            // Walk along the lsibs:
            for (i = 0; i < _this.nodes[p].lsib.length; i++) {
                x = findLeftMost(_this.nodes[p].lsib[i], maxv);
                minx = Math.min(x, minx);
            }
            // Walk along the rsibs:
            for (i = 0; i < _this.nodes[p].rsib.length; i++) {
                x = findLeftMost(_this.nodes[p].rsib[i], maxv);
                minx = Math.min(x, minx);
            }
            return minx;
        };
        findNodeOnLine = function (v, h, dir) {
            // Search all this.nodes on vpos 'v', and return the rightmost node on the left, or the leftmost on the rest,
            // depending on the direction.
            var i;
            var fnd;
            var x;
            fnd = -1;
            x = dir === "l" ? -1 : 999999;
            for (i = 0; i < _this.nodes.length; i++) {
                if (_this.nodes[i].vpos === v) {
                    if (dir === "l" && _this.nodes[i].hpos < h && _this.nodes[i].hpos > x) {
                        fnd = i;
                        x = _this.nodes[i].hpos;
                    }
                    if (dir === "r" && _this.nodes[i].hpos > h && _this.nodes[i].hpos < x) {
                        fnd = i;
                        x = _this.nodes[i].hpos;
                    }
                }
            }
            return fnd;
        };
        this.drawImageNodes = function () {
            // Images are loaded after drawing finished.
            // After an image has been loaded, this function will be called, which redraws the this.nodes
            // with images this.nodes, have a valid image now and are drawn incomplete before.
            var i;
            var ctx;
            ctx = theCanvas.getContext("2d");
            for (i = 0; i < _this.nodes.length; i++) {
                if (_this.nodes[i].img && _this.nodes[i].img.width > 0 && !_this.nodes[i].imgDrawn) {
                    drawNode(ctx, i);
                }
            }
        };
        drawNode = function (ctx, i) {
            var ix;
            var gradient;
            var maxrad;
            var imgrad;
            var x = _this.nodes[i].hpos;
            var y = _this.nodes[i].vpos;
            var width = _this.boxWidth;
            var height = _this.boxHeight;
            var txt = _this.nodes[i].txt;
            var bold = _this.nodes[i].bold;
            var blcolor = _this.nodes[i].linecolor;
            var bfcolor = _this.nodes[i].fillcolor;
            var tcolor = _this.nodes[i].textcolor;
            var font = _this.nodes[i].textfont;
            var fsize = _this.nodes[i].textsize;
            var valign = _this.nodes[i].valign;
            var img = _this.nodes[i].img;
            var imgalign = _this.nodes[i].imgAlign;
            var imgvalign = _this.nodes[i].imgVAlign;
            var toprad = _this.nodes[i].topradius;
            var botrad = _this.nodes[i].botradius;
            var shadowx = _this.nodes[i].shadowOffsetX;
            var shadowy = _this.nodes[i].shadowOffsetY;
            // Draw shadow with gradient first:
            if (shadowx > 0) {
                x += shadowx;
                y += shadowy;
                ctx.fillStyle = _this.shadowColor;
                ctx.beginPath();
                ctx.moveTo(x + toprad, y);
                ctx.lineTo(x + width - toprad, y);
                if (toprad > 0) {
                    ctx.quadraticCurveTo(x + width, y, x + width, y + toprad);
                }
                ctx.lineTo(x + width, y + height - botrad);
                if (botrad > 0) {
                    ctx.quadraticCurveTo(x + width, y + height, x + width - botrad, y + height);
                }
                ctx.lineTo(x + botrad, y + height);
                if (botrad > 0) {
                    ctx.quadraticCurveTo(x, y + height, x, y + height - botrad);
                }
                ctx.lineTo(x, y + toprad);
                if (toprad > 0) {
                    ctx.quadraticCurveTo(x, y, x + toprad, y);
                }
                ctx.closePath();
                ctx.fill();
                x -= shadowx;
                y -= shadowy;
            }
            // Draw the box:
            ctx.lineWidth = bold ? 2 : 1;
            gradient = ctx.createLinearGradient(x, y, x, y + height);
            gradient.addColorStop(0, "#FFFFFF");
            gradient.addColorStop(0.7, bfcolor);
            ctx.fillStyle = gradient;
            ctx.strokeStyle = blcolor;
            ctx.beginPath();
            ctx.moveTo(x + toprad, y);
            ctx.lineTo(x + width - toprad, y);
            if (toprad > 0) {
                ctx.quadraticCurveTo(x + width, y, x + width, y + toprad);
            }
            ctx.lineTo(x + width, y + height - botrad);
            if (botrad > 0) {
                ctx.quadraticCurveTo(x + width, y + height, x + width - botrad, y + height);
            }
            ctx.lineTo(x + botrad, y + height);
            if (botrad > 0) {
                ctx.quadraticCurveTo(x, y + height, x, y + height - botrad);
            }
            ctx.lineTo(x, y + toprad);
            if (toprad > 0) {
                ctx.quadraticCurveTo(x, y, x + toprad, y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            // Draw the image, if any:
            // If the image is available, draw.
            // Mark it incomplete otherwise.
            var xPic;
            var yPic;
            var maxx;
            var maxy;
            if (img) {
                // Get all positions and sizes, even if no image loaded yet:
                if (img.width > 0) {
                    maxx = img.width;
                    maxy = img.height;
                    // Resize if image too height:
                    // If the imgrad is less than the linewidth of the box, we need to draw inside the box:
                    imgrad = 0.414 * (toprad + botrad);
                    if (imgrad < 1) {
                        imgrad = 1;
                    }
                    if (maxy > height - imgrad) {
                        maxx = img.width * (height - imgrad) / img.height;
                        maxy = height - imgrad;
                    }
                    // Resize if image too width, even after previous resize:
                    maxrad = toprad;
                    if (botrad > maxrad) {
                        maxrad = botrad;
                    }
                    imgrad = 0.414 * maxrad;
                    if (maxx > width - 2 * imgrad) {
                        maxy = img.height * (width - 2 * imgrad) / img.width;
                        maxx = width - 2 * imgrad;
                    }
                }
                else {
                    imgrad = 0.414 * (toprad + botrad);
                    if (imgrad < 1) {
                        imgrad = 1;
                    }
                    if (width > height) {
                        maxy = height - 2 * imgrad;
                    }
                    else {
                        maxy = width - 2 * imgrad;
                    }
                    maxx = maxy;
                }
                // Horizontal offset:
                xPic = imgrad;
                if (imgalign === "c") {
                    xPic = (width - 2 * imgrad - maxx) / 2 + imgrad;
                }
                if (imgalign === "r") {
                    xPic = width - maxx - imgrad;
                }
                // Vertical offset:
                yPic = 0.414 * toprad + 1;
                if (imgvalign === "m") {
                    yPic = (height - maxy) / 2;
                }
                if (imgvalign === "b") {
                    yPic = height - maxy - 0.414 * botrad - 1;
                }
                if (img.width > 0) {
                    ctx.drawImage(img, x + xPic, y + yPic, maxx, maxy);
                    _this.nodes[i].imgDrawn = 1;
                }
                else {
                    // Draw an image-not-found picture
                    if (maxy > 0) {
                        ctx.beginPath();
                        ctx.rect(x + xPic, y + yPic, maxx, maxy);
                        ctx.fillStyle = "#FFFFFF";
                        ctx.fill();
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = "#000000";
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.moveTo(x + xPic + 1, y + yPic + 1);
                        ctx.lineTo(x + xPic + maxx - 1, y + yPic + maxy - 1);
                        ctx.strokeStyle = "#FF0000";
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.moveTo(x + xPic + maxx - 1, y + yPic + 1);
                        ctx.lineTo(x + xPic + 1, y + yPic + maxy - 1);
                        ctx.strokeStyle = "#FF0000";
                        ctx.stroke();
                    }
                    _this.nodes[i].imgDrawn = 0;
                }
                // Adjust the box size, so the text will be placed next to the image:
                // Find the biggest rectangle for the text:
                if (imgalign === "l") {
                    if (imgvalign === "t") {
                        if ((width - maxx) * height > width * (height - maxy)) {
                            x += xPic + maxx;
                            width -= xPic + maxx;
                        }
                        else {
                            y += yPic + maxy;
                            height -= yPic + maxy;
                        }
                    }
                    if (imgvalign === "m") {
                        x += xPic + maxx;
                        width -= xPic + maxx;
                    }
                    if (imgvalign === "b") {
                        if ((width - maxx) * height > width * (height - maxy)) {
                            x += xPic + maxx;
                            width -= xPic + maxx;
                        }
                        else {
                            height -= yPic + maxy;
                        }
                    }
                }
                if (imgalign === "c") {
                    if (imgvalign === "t") {
                        y += yPic + maxy;
                        height -= yPic + maxy;
                    }
                    if (imgvalign === "m") {
                        if (width - maxx > height - maxy) {
                            x += xPic + maxx;
                            width -= xPic + maxx;
                        }
                        else {
                            y += yPic + maxy;
                            height -= yPic + maxy;
                        }
                    }
                    if (imgvalign === "b") {
                        height = yPic;
                    }
                }
                if (imgalign === "r") {
                    if (imgvalign === "t") {
                        if ((width - maxx) * height > width * (height - maxy)) {
                            width = xPic;
                        }
                        else {
                            y += yPic + maxy;
                            height -= yPic + maxy;
                        }
                    }
                    if (imgvalign === "m") {
                        width = xPic;
                    }
                    if (imgvalign === "b") {
                        if ((width - maxx) * height > width * (height - maxy)) {
                            width = xPic;
                        }
                        else {
                            height -= yPic + maxy;
                        }
                    }
                }
            }
            // Draw text, break the string on spaces, and \n sequences:
            // Note: excanvas does not clip text. We need to do it ourselves.
            // ctx.save();
            // ctx.clip(); will clip on "image-not-found" now
            var tlines = []; // Split text in multiple lines if it doesn't fit
            var n = 0;
            var t1;
            var nl;
            txt = cleanText(txt);
            while (txt.length > 0 && n < _this.maxLoop) {
                t1 = txt;
                // Split on \n first
                nl = t1.indexOf("\n");
                if (nl >= 0) {
                    t1 = t1.substr(0, nl);
                }
                // Remove words until the string fits:
                ix = t1.lastIndexOf(" ");
                while (ctx.measureText(t1).width > width - 16 && ix > 0) {
                    t1 = t1.substr(0, ix);
                    ix = t1.lastIndexOf(" ");
                }
                tlines[n] = t1;
                n++;
                if (t1.length < txt.length) {
                    txt = txt.substr(t1.length);
                    if (nl >= 0) {
                        txt = txt.substr(1);
                    } // \n sequence
                }
                else {
                    txt = "";
                }
            }
            // IE does not clip text, so we clip it here:
            if (fsize * n > height) {
                n = Math.floor(height / fsize);
            }
            // The font syntax is: [style] <size> <fontname>. <size> <style> <fontname> does not work! So reformat here:
            var style = "";
            font = font.toLowerCase();
            ix = font.indexOf("bold ");
            if (ix >= 0) {
                font = font.substr(0, ix) + font.substr(ix + 5);
                style = "bold ";
            }
            ix = font.indexOf("italic ");
            if (ix >= 0) {
                font = font.substr(0, ix) + font.substr(ix + 5);
                style += "italic ";
            }
            ctx.font = style + fsize + "px " + font;
            ctx.textBaseline = "top";
            ctx.textAlign = "center";
            ctx.fillStyle = tcolor;
            var yp = 0;
            if (valign) {
                yp = Math.floor((height - n * fsize) / 2);
            }
            for (ix = 0; ix < n; ix++) {
                while (tlines[ix].length > 0 &&
                    ctx.measureText(tlines[ix]).width > width) {
                    tlines[ix] = tlines[ix].substr(0, tlines[ix].length - 1);
                }
                ctx.fillText(tlines[ix], x + width / 2, y + yp);
                yp += parseInt(fsize, 10);
            }
            // ctx.restore();
        };
        drawConLines = function (ctx) {
            // Draw all connection lines.
            // We cannot simply draw all lines, over and over again, as the color will change.
            // Therefore we draw all lines separat, and only once.
            var i;
            var f;
            var l;
            var r = null;
            var v;
            ctx.strokeStyle = _this.lineColor;
            ctx.beginPath();
            for (i = 0; i < _this.nodes.length; i++) {
                // Top and left lines of siblings
                if (_this.nodes[i].parentix >= 0) {
                    if (_this.nodes[i].contype === "u") {
                        ctx.moveTo(_this.nodes[i].hpos + _this.boxWidth / 2, _this.nodes[i].vpos);
                        ctx.lineTo(_this.nodes[i].hpos + _this.boxWidth / 2, _this.nodes[i].vpos - _this.vSpace / 2);
                    }
                    if (_this.nodes[i].contype === "l") {
                        ctx.moveTo(_this.nodes[i].hpos + _this.boxWidth, _this.nodes[i].vpos + _this.boxHeight / 2);
                        ctx.lineTo(_this.nodes[_this.nodes[i].parentix].hpos + _this.boxWidth / 2, _this.nodes[i].vpos + _this.boxHeight / 2);
                    }
                    if (_this.nodes[i].contype === "r") {
                        ctx.moveTo(_this.nodes[i].hpos, _this.nodes[i].vpos + _this.boxHeight / 2);
                        ctx.lineTo(_this.nodes[_this.nodes[i].parentix].hpos + _this.boxWidth / 2, _this.nodes[i].vpos + _this.boxHeight / 2);
                    }
                }
                // Downline if any siblings:
                v = getEndOfDownline(i);
                if (v >= 0) {
                    ctx.moveTo(_this.nodes[i].hpos + _this.boxWidth / 2, _this.nodes[i].vpos + _this.boxHeight);
                    ctx.lineTo(_this.nodes[i].hpos + _this.boxWidth / 2, v);
                }
                // Horizontal line above multiple 'u' sibs:
                if (_this.nodes[i].usib.length > 1) {
                    f = _this.nodes[i].usib[0];
                    l = _this.nodes[i].usib[_this.nodes[i].usib.length - 1];
                    ctx.moveTo(_this.nodes[f].hpos + _this.boxWidth / 2, _this.nodes[f].vpos - _this.vSpace / 2);
                    ctx.lineTo(_this.nodes[l].hpos + _this.boxWidth / 2, _this.nodes[f].vpos - _this.vSpace / 2);
                }
                // Horizontal line above a single 'u' sib, if not aligned:
                if (_this.nodes[i].usib.length === 1) {
                    f = _this.nodes[i].usib[0];
                    ctx.moveTo(_this.nodes[f].hpos + _this.boxWidth / 2, _this.nodes[f].vpos - _this.vSpace / 2);
                    ctx.lineTo(_this.nodes[i].hpos + _this.boxWidth / 2, _this.nodes[f].vpos - _this.vSpace / 2);
                }
            }
            ctx.stroke();
        };
        getEndOfDownline = function (p) {
            var f;
            var l;
            var r;
            // if this node has u-sibs, the endpoint can be found from the vpos of the first u-sib:
            if (_this.nodes[p].usib.length > 0) {
                f = _this.nodes[p].usib[0];
                return _this.nodes[f].vpos - _this.vSpace / 2;
            }
            // Find the lowest 'l' or 'r' sib:
            l = _this.nodes[p].lsib.length;
            r = _this.nodes[p].rsib.length;
            f = -1;
            if (l > 0 && r === 0) {
                f = _this.nodes[p].lsib[l - 1];
            }
            if (l === 0 && r > 0) {
                f = _this.nodes[p].rsib[r - 1];
            }
            if (l > 0 && r > 0) {
                l = _this.nodes[p].lsib[l - 1];
                r = _this.nodes[p].rsib[r - 1];
                if (_this.nodes[l].vpos > _this.nodes[r].vpos) {
                    f = l;
                }
                else {
                    f = r;
                }
            }
            if (f >= 0) {
                return _this.nodes[f].vpos + _this.boxHeight / 2;
            }
            return -1;
        };
        getNodeAt = function (x, y) {
            var i;
            var x2;
            var y2;
            x2 = x - _this.boxWidth;
            y2 = y - _this.boxHeight;
            for (i = 0; i < _this.nodes.length; i++) {
                if (x > _this.nodes[i].hpos &&
                    x2 < _this.nodes[i].hpos &&
                    y > _this.nodes[i].vpos &&
                    y2 < _this.nodes[i].vpos) {
                    return i;
                }
            }
            return -1;
        };
        getNodeAtUnequal = function (x, y, u) {
            var i;
            var x2;
            var y2;
            x2 = x - _this.boxWidth;
            y2 = y - _this.boxHeight;
            for (i = 0; i < _this.nodes.length; i++) {
                if (i !== u &&
                    x > _this.nodes[i].hpos &&
                    x2 < _this.nodes[i].hpos &&
                    y > _this.nodes[i].vpos &&
                    y2 < _this.nodes[i].vpos) {
                    return i;
                }
            }
            return -1;
        };
        underVSib = function (n) {
            // Walk along the parents. If one is a lsib or rsib, return the index.
            while (n >= 0) {
                if (_this.nodes[n].contype === "l") {
                    return n;
                }
                if (_this.nodes[n].contype === "r") {
                    return n;
                }
                n = _this.nodes[n].parentix;
            }
            return -1;
        };
        cleanText = function (tin) {
            var i;
            // Remove leading spaces:
            i = 0;
            while (tin.charAt(i) === " " || tin.charAt(i) === "\t") {
                i++;
            }
            if (i > 0) {
                tin = tin.substr(i);
            }
            // Remove trailing spaces:
            i = tin.length;
            while (i > 0 &&
                (tin.charAt(i - 1) === " " || tin.charAt(i - 1) === "\t")) {
                i--;
            }
            if (i < tin.length) {
                tin = tin.substr(0, i);
            }
            // Implode double spaces and tabs etc:
            return tin.replace(/[ \t]{2,}/g, " ");
        };
        overlapBoxInTree = function (p) {
            // Check all this.nodes in this tree to overlap another box already placed:
            // Return the index, or -1
            var s;
            var r;
            var i;
            var x;
            var y;
            if (_this.nodes[p].hpos < 0) {
                return -1;
            }
            for (s = 0; s < _this.nodes[p].usib.length; s++) {
                r = overlapBoxInTree(_this.nodes[p].usib[s]);
                if (r >= 0) {
                    return r;
                }
            }
            for (s = 0; s < _this.nodes[p].lsib.length; s++) {
                r = overlapBoxInTree(_this.nodes[p].lsib[s]);
                if (r >= 0) {
                    return r;
                }
            }
            for (s = 0; s < _this.nodes[p].rsib.length; s++) {
                r = overlapBoxInTree(_this.nodes[p].rsib[s]);
                if (r >= 0) {
                    return r;
                }
            }
            for (i = 0; i < _this.nodes.length; i++) {
                if (_this.nodes[i].hpos >= 0 && i !== p) {
                    x = _this.nodes[p].hpos - _this.minDistBetweenLineAndBox;
                    y = _this.nodes[p].vpos + _this.minDistBetweenLineAndBox;
                    if (x > _this.nodes[i].hpos &&
                        x < _this.nodes[i].hpos + _this.boxWidth &&
                        y > _this.nodes[i].vpos &&
                        y < _this.nodes[i].vpos + _this.boxHeight) {
                        return i;
                    }
                    x = _this.nodes[p].hpos + _this.boxWidth + _this.minDistBetweenLineAndBox;
                    if (x > _this.nodes[i].hpos &&
                        x < _this.nodes[i].hpos + _this.boxWidth &&
                        y > _this.nodes[i].vpos &&
                        y < _this.nodes[i].vpos + _this.boxHeight) {
                        return i;
                    }
                }
            }
            return -1;
        };
        getLowestBox = function (p, subtree) {
            var s;
            var y;
            var r;
            if (subtree === undefined) {
                subtree = "ulr";
            }
            y = _this.nodes[p].vpos;
            if (subtree.includes("u")) {
                for (s = 0; s < _this.nodes[p].usib.length; s++) {
                    r = getLowestBox(_this.nodes[p].usib[s]);
                    y = Math.max(r, y);
                }
            }
            if (subtree.includes("l")) {
                for (s = 0; s < _this.nodes[p].lsib.length; s++) {
                    r = getLowestBox(_this.nodes[p].lsib[s]);
                    y = Math.max(r, y);
                }
            }
            if (subtree.includes("r")) {
                for (s = 0; s < _this.nodes[p].rsib.length; s++) {
                    r = getLowestBox(_this.nodes[p].rsib[s]);
                    y = Math.max(r, y);
                }
            }
            return y;
        };
        getRootNode = function (p) {
            while (_this.nodes[p].parent !== "") {
                p = _this.nodes[p].parentix;
            }
            return p;
        };
        getUParent = function (n) {
            // Walk to the top of the tree, and return the first 'u' node found.
            // If none, return the root node.
            while (n >= 0) {
                if (_this.nodes[n].contype === "u" || _this.nodes[n].parent === "") {
                    return n;
                }
                n = _this.nodes[n].parentix;
            }
            // Not reached
            return -1;
        };
        nodeUnderParent = function (n, p) {
            // Return 1 if node n is part of the p tree:
            while (n >= 0) {
                if (n === p) {
                    return 1;
                }
                n = _this.nodes[n].parentix;
            }
            return 0;
        };
        getAbsPosX = function (obj) {
            var curleft = 0;
            if (obj.offsetParent) {
                do {
                    curleft += obj.offsetLeft;
                    obj = obj.offsetParent;
                } while (obj);
            }
            else {
                if (obj.x) {
                    curleft += obj.x;
                }
            }
            return curleft;
        };
        getAbsPosY = function (obj) {
            var curtop = 0;
            if (obj.offsetParent) {
                do {
                    curtop += obj.offsetTop;
                    obj = obj.offsetParent;
                } while (obj);
            }
            else {
                if (obj.y) {
                    curtop += obj.y;
                }
            }
            return curtop;
        };
        makeRoomForDownline = function (p, v) {
            // Alle l-sib trees may not overlap the downline, up to the point vpos.
            // Shift the parent and all r-sibs to the right
            // We need to do this one by one for all lsibs, otherwise upper-l-this.nodes may be shifted too much to the left.
            var maxx;
            var h;
            var x;
            var w;
            var minx = null;
            var l;
            var r;
            if (v > 0) {
                // Check 'l' sibs first
                if (_this.nodes[p].lsib.length > 0) {
                    maxx = -1;
                    for (h = 0; h < _this.nodes[p].lsib.length; h++) {
                        x = findRightMost(_this.nodes[p].lsib[h], v);
                        maxx = Math.max(x, maxx);
                        if (maxx < 0) {
                            maxx = _this.curshadowOffsetX;
                        }
                        // If the node found is the lsib itself, use this.hShift. Otherwise use hSpace/2, it looks better.
                        if (x === _this.nodes[_this.nodes[p].lsib[h]].hpos) {
                            w = maxx + _this.boxWidth / 2 + _this.hShift - _this.nodes[p].hpos;
                        }
                        else {
                            w = maxx + _this.boxWidth / 2 + _this.hSpace / 2 - _this.nodes[p].hpos;
                        }
                        if (w > 0) {
                            _this.nodes[p].hpos += w;
                            for (r = 0; r < _this.nodes[p].rsib.length; r++) {
                                hShiftTree(_this.nodes[p].rsib[r], w);
                            }
                            for (l = 0; l < h; l++) {
                                hShiftTree(_this.nodes[p].lsib[l], w);
                            }
                        }
                    }
                }
                // If right trees, shift them to the right of the (repositioned) root node:
                // Be carefull not to shift them back over other this.nodes, which can be if the parent has no u-sibs
                // (and thus the left tree can extend to the right:
                for (r = 0; r < _this.nodes[p].rsib.length; r++) {
                    x = findLeftMost(_this.nodes[p].rsib[r], v);
                    // If the node found is the rsib itself, use hShift. Otherwise use hSpace/2, it looks better.
                    if (x === _this.nodes[_this.nodes[p].rsib[r]].hpos) {
                        w = _this.nodes[p].hpos + _this.boxWidth / 2 + _this.hShift - x;
                    }
                    else {
                        w = _this.nodes[p].hpos + _this.boxWidth / 2 + _this.hSpace / 2 - x;
                    }
                    if (w) {
                        hShiftTree(_this.nodes[p].rsib[r], w);
                    }
                }
            }
        };
        centerOnCanvas = function (width) {
            var i;
            var max;
            var min;
            var w;
            // Find the left and rightmost this.nodes:
            max = -1;
            min = 999999;
            for (i = 0; i < _this.nodes.length; i++) {
                if (_this.nodes[i].hpos > max) {
                    max = _this.nodes[i].hpos;
                }
                if (_this.nodes[i].hpos < min) {
                    min = _this.nodes[i].hpos;
                }
            }
            max += _this.boxWidth;
            w = width / 2 - (max - min) / 2;
            for (i = 0; i < _this.nodes.length; i++) {
                _this.nodes[i].hpos += w;
            }
        };
        leftOnCanvas = function (width) {
            var i;
            var min;
            var w;
            // Find the leftmost node:
            min = 999999;
            for (i = 0; i < _this.nodes.length; i++) {
                if (_this.nodes[i].hpos < min) {
                    min = _this.nodes[i].hpos;
                }
            }
            w = min;
            if (w > 0) {
                for (i = 0; i < _this.nodes.length; i++) {
                    _this.nodes[i].hpos -= w;
                }
            }
        };
    }
    //////////////////////
    // Public functions:
    //////////////////////
    OrgChart.prototype.setDebug = function (value) {
        this.debug = value;
    };
    OrgChart.prototype.setSize = function (w, h, hspace, vspace, hshift) {
        if (w !== undefined && w > 0) {
            this.boxWidth = w;
        }
        if (h !== undefined && h > 0) {
            this.boxHeight = h;
        }
        if (hspace !== undefined && hspace > 0) {
            this.hSpace = Math.max(3, hspace);
        }
        if (vspace !== undefined && vspace > 0) {
            this.vSpace = Math.max(3, vspace);
        }
        if (hshift !== undefined && hshift > 0) {
            this.hShift = Math.max(3, hshift);
        }
    };
    OrgChart.prototype.setNodeStyle = function (toprad, botrad, shadow) {
        if (toprad !== undefined && toprad >= 0) {
            this.curtopradius = toprad;
        }
        if (botrad !== undefined && botrad >= 0) {
            this.curbotradius = botrad;
        }
        if (shadow !== undefined && shadow >= 0) {
            this.curshadowOffsetX = shadow;
            this.curshadowOffsetY = shadow;
        }
    };
    OrgChart.prototype.setFont = function (fname, size, color, valign) {
        if (fname !== undefined) {
            this.textFont = fname;
        }
        if (size !== undefined && size > 0) {
            this.textSize = size;
        }
        if (color !== undefined && color !== "") {
            this.textColor = color;
        }
        if (valign !== undefined) {
            this.textVAlign = valign;
        }
        if (this.textVAlign === "c" || this.textVAlign === "center") {
            this.textVAlign = 1;
        }
    };
    OrgChart.prototype.setColor = function (l, f, t, c) {
        if (l !== undefined && l !== "") {
            this.boxLineColor = l;
        }
        if (f !== undefined && f !== "") {
            this.boxFillColor = f;
        }
        if (t !== undefined && t !== "") {
            this.textColor = t;
        }
        if (c !== undefined && c !== "") {
            this.lineColor = c;
        }
    };
    OrgChart.prototype.addNode = function (id, parent, ctype, text, bold, url, linecolor, fillcolor, textcolor, img, imgalign) {
        var _this = this;
        var imgvalign;
        if (id === undefined) {
            id = "";
        }
        if (parent === undefined) {
            parent = "";
        }
        if (ctype === undefined) {
            ctype = "u";
        }
        if (bold === undefined) {
            bold = 0;
        }
        if (text === undefined) {
            text = "";
        }
        if (url === undefined) {
            url = "";
        }
        if (!linecolor) {
            linecolor = this.boxLineColor;
        }
        if (!fillcolor) {
            fillcolor = this.boxFillColor;
        }
        if (!textcolor) {
            textcolor = this.textColor;
        }
        if (imgalign === undefined) {
            imgalign = "lm";
        }
        if (id === "") {
            id = text;
        }
        if (parent === "") {
            ctype = "u";
        }
        ctype = ctype.toLowerCase();
        if (ctype !== "u" && ctype !== "l" && ctype !== "r" && parent !== "") {
            ctype = "u";
        }
        imgvalign = "m";
        if (imgalign.substr(1, 1) === "t" || imgalign.substr(1, 1) === "T") {
            imgvalign = "t";
        }
        if (imgalign.substr(1, 1) === "b" || imgalign.substr(1, 1) === "B") {
            imgvalign = "b";
        }
        if (imgalign.substr(0, 1) === "c" || imgalign.substr(0, 1) === "C") {
            imgalign = "c";
        }
        if (imgalign.substr(0, 1) === "m" || imgalign.substr(0, 1) === "M") {
            imgalign = "c";
        } // Service!
        if (imgalign.substr(0, 1) === "r" || imgalign.substr(0, 1) === "R") {
            imgalign = "r";
        }
        if (imgalign !== "c" && imgalign !== "r") {
            imgalign = "l";
        }
        var i;
        for (i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].id === id && this.noalerts !== 1) {
                alert("Duplicate node.\nNode " + (1 +
                    this.nodes
                        .length) + ", id = " + id + ", '" + text + "'\nAlready defined as node " + i + ", '" + this.nodes[i].txt + "'\n\nThis new node will not be added.\nNo additional messages are given.");
                this.noalerts = 1;
                return;
            }
        }
        var n = new this.TreeNode(id, parent, ctype, text, bold, url, linecolor, fillcolor, textcolor, imgalign, imgvalign);
        if (img !== undefined) {
            n.img = new Image();
            n.img.src = img;
            n.img.onload = function () {
                _this.drawImageNodes();
            };
        }
        this.nodes[this.nodes.length] = n;
    };
    return OrgChart;
}()); // orgChart
exports["default"] = OrgChart;
