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
//		Generic setting, all boxes will have the same size.
//	width	box width in pixels (optional)
//	height	box height in pixels (optional)
//	hspace	horizontal space between boxes (optional)
//	vspace	vertical space between boxes (optional)
//	hshift	horizontal shift for 'l' and 'r' boxes (optional)
//
// setNodeStyle(toprad, botrad, shadow)
//		Set the corner style and shade for all node from now on
//	toprad	The radius of the corners on the top. 0 for square boxes. Default value is 5.
//	botrad	The radius of the corners on the bottom. 0 for square boxes. Default value is 5.
//	shadow	Offset of the shadow. 0 for no shadow. Default value is 3.
//		No negative values for this function
//
// setFont(fname, size, color, valign)
//		Set the font for nodes from now on
//	fname	font name (eq. "arial")
//	size	font size (in pixels, eg "12")
//	color	rgb font color (optional, not changed if omitted)
//	valign	Vertical alignment on/off (optional, not changed if omitted)
//
// setColor(bline, bfill, btext, cline)
//		Set the colors for the nodes from now on
//	bline	rgb line color for the boxes (optional, not changed if omitted)
//	bfill	rgb fill color for the boxes (optional, not changed if omitted)
//	btext	rgb font color for the boxes (optional, not changed if omitted)
//	cline	rgb line color for the connection lines (optional, not changed if omitted)
//
// addNode(id, parent, ctype, text, bold, url, cline, cfill, ctext, image, imgalign)
//		Add a node to the chart
//	id	unique id of this node (required)
//	parent	id of the parent node (-1 for no parent)
//	ctype	connection type to the parent ('u' for under, 'l' for left, 'r' for right)
//	text	the text for the box (optional, none if omitted)
//	bold	bold lines for this box (optional, no bold if omitted)
//	url	a link attached to the box (optional, none if omitted)
//	cline	rgb line color (optional, default value will be used if omitted)
//	cfill	rgb fill color (optional, default value will be used if omitted)
//	ctext	rgb font color (optional, default value will be used if omitted)
//	image	optional image
//	align	image alignment L(eft), C(enter), R(ight) + T(op), M(iddle), B(ottom)
//
// drawChart(id, align, fit)
//		Draws the chart on the canvas
//	id	id of the canvas
//	align	'c' of 'center' for horizontal alignment on the canvas (left alignment if omitted)
//	fit	if 'true', resize the canvas to just fit the chart
//
// redrawChart(id)
//		Re-draws the in-memory chart on the canvas
//		(Resizing a canvas clears the content).
//	id	id of the canvas
//
// setDebug(value)
//		Sets the global debug mode
//	value	1 for on, 0 for off
//
// eg. var MyChart = new orgChart();
//
let G_vmlCanvasManager; // so non-IE won't freak out

if (!window.console) {
  console = { log() {} }; // IE has no console.log
}

export default class orgChart {
  constructor() {
    ///////////////////
    // Default values:
    ///////////////////

    const // Color of the connection lines (global for all lines)
    lineColor = "#3388DD";

    const // Box width (global for all boxes)
    boxWidth = 120;

    const // Box height (global for all boxes)
    boxHeight = 30;

    const // Horizontal space in between the boxes (global for all boxes)
    hSpace = 30;

    const // Vertical space in between the boxes (global for all boxes)
    vSpace = 20;

    const // The number of pixels vertical siblings are shifted (global for all boxes)
    hShift = 15;

    const // Default box line color
    boxLineColor = "#B5D9EA";

    const // Default box fill color
    boxFillColor = "#CFE8EF";

    const // Default box text color
    textColor = "#000000";

    const // Default font
    textFont = "arial";

    const // Default text size (pixels, not points)
    textSize = 12;

    const // Default text alignment
    textVAlign = 1;

    const curshadowOffsetX = 3;
    const curshadowOffsetY = 3;
    const shadowColor = "#A1A1A1";
    const curtopradius = 5;
    const curbotradius = 5;
    const nodes = [];
    let theCanvas;

    const // Experimental, lines may loose connections
    centerParentOverCompleteTree = 0;

    let debug = 0;
    const maxLoop = 9;
    const minDistBetweenLineAndBox = 5;
    const noalerts = 0;

    //////////////////////
    // Internal functions:
    //////////////////////

    let drawChartPriv;

    let orgChartMouseMove;
    let orgChartClick;
    let vShiftUsibUnderParent;
    let vShiftTree;
    let hShiftTree;
    let hShiftTreeAndRBrothers;
    let fillParentix;
    let checkLines;
    let checkLinesRec;
    let checkOverlap;
    let countSiblings;
    let positionBoxes;
    let positionTree;
    let reposParents;
    let reposParentsRec;
    let findRightMost;
    let findRightMostAtVpos;
    let findLeftMost;
    let findNodeOnLine;
    let drawNode;
    let drawImageNodes;
    let drawConLines;
    let getNodeAt;
    let getEndOfDownline;
    let getNodeAtUnequal;
    let makeRoomForDownline;
    let underVSib;
    let errOut;
    let debugOut;
    let cleanText;
    let dumpNodes;
    let overlapBoxInTree;
    let getLowestBox;
    let getRootNode;
    let getUParent;
    let nodeUnderParent;
    let getAbsPosX;
    let getAbsPosY;
    let centerOnCanvas;
    let leftOnCanvas;

    ////////////////////////////////////
    // Internal information structures:
    ////////////////////////////////////

    const Node = function(
      id,
      parent,
      contype,
      txt,
      bold,
      url,
      linecolor,
      fillcolor,
      textcolor,
      imgalign,
      imgvalign
    ) {
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
      this.textfont = textFont;
      this.textsize = textSize;
      this.valign = textVAlign;
      this.hpos = -1; // Horizontal starting position in pixels
      this.vpos = -1; // Vertical starting position in pixels
      this.usib = []; // 'u' siblings
      this.rsib = []; // 'r' siblings
      this.lsib = []; // 'l' siblings
      this.img = ""; // Optional image
      this.imgAlign = imgalign; // Image alignment 'l', 'c', 'r'
      this.imgVAlign = imgvalign; // Image vertical alignment 't', 'm', 'b'
      this.imgDrawn = 0;
      this.topradius = curtopradius;
      this.botradius = curbotradius;
      this.shadowOffsetX = curshadowOffsetX;
      this.shadowOffsetY = curshadowOffsetY;
    };

    //////////////////////
    // Internal functions:
    //////////////////////

    drawChartPriv = (id, repos, align, fit) => {
      var i;
      let ctx;
      let devicePixelRatio;
      let backingStoreRatio;
      let width;
      let height;
      let ratio;

      theCanvas = document.getElementById(id);
      if (!theCanvas) {
        alert(`Canvas id '${id}' not found`);
        return;
      }
      if (G_vmlCanvasManager !== undefined) {
        // ie IE
        G_vmlCanvasManager.initElement(theCanvas);
      }

      ctx = theCanvas.getContext("2d");

      ctx.lineWidth = 1;
      ctx.fillStyle = boxFillColor;
      ctx.strokeStyle = boxLineColor;

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
        } else {
          leftOnCanvas();
        }
      }

      if (fit) {
        let maxW = 0;
        let maxH = 0;
        var i;

        leftOnCanvas();

        for (i = 0; i < nodes.length; i++) {
          if (nodes[i].hpos + boxWidth + nodes[i].shadowOffsetX > maxW)
            maxW = nodes[i].hpos + boxWidth + nodes[i].shadowOffsetX;
          if (nodes[i].vpos + boxHeight + nodes[i].shadowOffsetY > maxH)
            maxH = nodes[i].vpos + boxHeight + nodes[i].shadowOffsetY;
        }

        if (maxW > 0 && maxH > 0) {
          theCanvas.width = maxW;
          theCanvas.height = maxH;
        }
      }

      // High dpi displays:
      if ("devicePixelRatio" in window && theCanvas.width != 0) {
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

        if (ratio != 1) {
          theCanvas.width = width * ratio;
          theCanvas.height = height * ratio;

          theCanvas.style.width = `${width}px`;
          theCanvas.style.height = `${height}px`;

          ctx.scale(ratio, ratio);
          debugOut(`RESCALE: ${ratio}`);
        }
      }

      // Draw the lines:
      drawConLines(ctx);

      // Draw the boxes:
      for (i = 0; i < nodes.length; i++) {
        drawNode(ctx, i);
      }

      // Add click behaviour:
      if (theCanvas.addEventListener) {
        theCanvas.removeEventListener("click", orgChartClick, false); // If any old on this canvas, remove it
        theCanvas.addEventListener("click", orgChartClick, false);
        theCanvas.addEventListener("mousemove", orgChartMouseMove, false);
      } else if (theCanvas.attachEvent) {
        // IE
        theCanvas.onclick = () => {
          const mtarget = document.getElementById(id);
          orgChartClick(event, mtarget.scrollLeft, mtarget.scrollTop - 20);
        };
        theCanvas.onmousemove = () => {
          const mtarget = document.getElementById(id);
          orgChartMouseMove(event, mtarget.scrollLeft, mtarget.scrollTop - 20);
        };
      }
    };

    orgChartMouseMove = event => {
      let x;
      let y;
      let i;

      x = event.clientX;
      y = event.clientY;

      x -= getAbsPosX(theCanvas);
      y -= getAbsPosY(theCanvas);

      if (document.documentElement && document.documentElement.scrollLeft) {
        x += document.documentElement.scrollLeft;
      } else {
        x += document.body.scrollLeft;
      }
      if (document.documentElement && document.documentElement.scrollTop) {
        y += document.documentElement.scrollTop;
      } else {
        y += document.body.scrollTop;
      }

      i = getNodeAt(x, y);
      if (i >= 0 && nodes[i].url.length > 0) {
        document.body.style.cursor = "pointer";
      } else {
        document.body.style.cursor = "default";
      }
    };

    orgChartClick = (event, offsetx, offsety) => {
      let x;
      let y;
      let i;
      let i1;
      let i2;
      let d;

      if (event.button < 0 || event.button > 1) {
        return; // left button (w3c: 0, IE: 1) only
      }

      x = event.clientX;
      y = event.clientY;

      x -= getAbsPosX(theCanvas);
      y -= getAbsPosY(theCanvas);

      if (document.documentElement && document.documentElement.scrollLeft) {
        x += document.documentElement.scrollLeft;
      } else {
        x += document.body.scrollLeft;
      }
      if (document.documentElement && document.documentElement.scrollTop) {
        y += document.documentElement.scrollTop;
      } else {
        y += document.body.scrollTop;
      }

      i = getNodeAt(x, y);
      if (i >= 0) {
        if (nodes[i].url.length > 0) {
          document.body.style.cursor = "default";
          i1 = nodes[i].url.indexOf("://");
          i2 = nodes[i].url.indexOf("/");
          if (i1 >= 0 && i2 > i1) {
            window.open(nodes[i].url);
          } else {
            window.location = nodes[i].url;
          }
        }
      }
    };

    vShiftUsibUnderParent = (p, h, ymin) => {
      // Shift all usiblings with a vpos >= ymin down, except this parent.
      // ymin is optional
      if (ymin === undefined) {
        ymin = 0;
      }

      let s;

      for (s = 0; s < nodes[p].usib.length; s++) {
        vShiftTree(nodes[p].usib[s], h, ymin);
      }
    };

    vShiftTree = (p, h, ymin) => {
      // Shift all siblings 'h' down (if they have a position already)
      let s;

      if (nodes[p].vpos >= 0 && nodes[p].vpos >= ymin) {
        nodes[p].vpos += h;
      }

      for (s = 0; s < nodes[p].usib.length; s++) {
        vShiftTree(nodes[p].usib[s], h, ymin);
      }

      for (s = 0; s < nodes[p].lsib.length; s++) {
        vShiftTree(nodes[p].lsib[s], h, ymin);
      }

      for (s = 0; s < nodes[p].rsib.length; s++) {
        vShiftTree(nodes[p].rsib[s], h, ymin);
      }
    };

    hShiftTree = (p, w) => {
      // Shift all siblings (which have a position already) 'w' pixels
      let s;

      let d;

      debugOut(`hShiftTree(${nodes[p].txt}, ${w})`);
      d = debug;
      debug = 0;

      if (nodes[p].hpos >= 0) {
        nodes[p].hpos += w;
      }

      for (s = 0; s < nodes[p].usib.length; s++) {
        hShiftTree(nodes[p].usib[s], w);
      }

      for (s = 0; s < nodes[p].lsib.length; s++) {
        hShiftTree(nodes[p].lsib[s], w);
      }

      for (s = 0; s < nodes[p].rsib.length; s++) {
        hShiftTree(nodes[p].rsib[s], w);
      }

      debug = d;
    };

    hShiftTreeAndRBrothers = (p, w) => {
      // Shift this tree to the right.
      // If this is an 'u' sib, also shift all brothers which are to the right too.
      // (In which case we shift all other root nodes too).
      let i;

      let q;
      let s;
      let hpos;
      let hpos2;
      let rp;
      let d;

      debugOut(`hShiftTreeAndRBrothers(${nodes[p].txt}, ${w})`);
      d = debug;
      debug = 0;

      hpos = nodes[p].hpos;
      rp = getRootNode(p);
      hpos2 = nodes[rp].hpos;

      if (nodes[p].contype === "u" && nodes[p].parent !== "") {
        q = nodes[p].parentix;
        for (s = nodes[q].usib.length - 1; s >= 0; s--) {
          hShiftTree(nodes[q].usib[s], w);
          if (nodes[q].usib[s] === p) {
            break;
          }
        }
      } else {
        hShiftTree(p, w);
      }

      if (nodes[p].contype === "u") {
        for (i = 0; i < nodes.length; i++) {
          if (i !== rp && nodes[i].parent === "" && nodes[i].hpos > hpos2) {
            hShiftTree(i, w);
          }
        }
      }

      debug = d;
    };

    fillParentix = () => {
      // Fill all nodes with the index of the parent.
      let i;

      let j;
      for (i = 0; i < nodes.length; i++) {
        if (nodes[i].parent !== "") {
          for (j = 0; j < nodes.length; j++) {
            if (nodes[i].parent === nodes[j].id) {
              nodes[i].parentix = j;
              break;
            }
          }
          if (nodes[i].parentix === -1) {
            debugOut(
              `Node ${nodes[i].id} has an invalid parent '${nodes[i].parent}'`
            );
            nodes[i].parent = "";
            //nodes[i].txt += ' (unknown parent)';
          }
        }
      }
    };

    checkLines = () => {
      // Check all vertical lines for crossing boxes. If so, shift to the right.
      let p;

      debugOut("checkLines()");

      for (p = 0; p < nodes.length; p++) {
        if (nodes[p].parent === "") {
          checkLinesRec(p);
        }
      }
    };

    checkLinesRec = p => {
      let s;
      let t;
      let r;
      let x;
      let l;
      let y;
      let y2;
      let n;
      let m;
      let i;
      let rp;
      let rs;
      let v;
      let w;
      let branch;
      let tm;
      let hdl;
      let vdl;

      y = 0;

      // Check lsib, the latest is the lowest point:
      n = nodes[p].lsib.length;
      if (n > 0) {
        s = nodes[p].lsib[n - 1];
        y = nodes[s].vpos + boxHeight / 2;
      }

      // Check rsib, the latest is the lowest point:
      n = nodes[p].rsib.length;
      if (n > 0) {
        s = nodes[p].rsib[n - 1];
        y2 = nodes[s].vpos + boxHeight / 2;
        y = Math.max(y, y2);
      }

      // If usib, the lowest point is even lower:
      n = nodes[p].usib.length;
      if (n > 0) {
        s = nodes[p].usib[0];
        y = nodes[s].vpos - vSpace / 2;
      }

      if (y > 0) {
        for (
          n = nodes[p].vpos + boxHeight / 2 + boxHeight + vSpace;
          n <= y;
          n += boxHeight + vSpace
        ) {
          m = 0;
          do {
            s = getNodeAt(
              nodes[p].hpos + boxWidth / 2 - minDistBetweenLineAndBox,
              n
            );
            if (s >= 0) {
              debugOut(
                `Overlap between a downline of '${
                  nodes[p].txt
                }' at point (${nodes[p].hpos + boxWidth / 2}, ${n}) and node '${
                  nodes[s].txt
                }' (${nodes[s].hpos}, ${nodes[s].vpos})`
              );
              // If the node found is a sib of the box with the downline, shifting the parent doesn't help:
              w =
                nodes[s].hpos +
                boxWidth +
                hSpace / 2 -
                (nodes[p].hpos + boxWidth / 2);
              rp = s;
              i = 0;
              while (nodes[rp].parent !== "" && rp !== p) {
                rp = nodes[rp].parentix;
              }
              if (rp !== p) {
                // Find the parent of s on the same vpos as p to decide what to shift:
                rs = s;
                while (
                  nodes[rs].parent !== "" &&
                  nodes[rs].vpos > nodes[p].vpos
                ) {
                  rs = nodes[rs].parentix;
                }
                rp = p;
                while (nodes[rp].parent !== "" && nodes[rp].contype !== "u") {
                  rp = nodes[rp].parentix;
                }
                if (nodes[rs].hpos > nodes[p].hpos) {
                  //w =  nodes[p].hpos + boxWidth / 2 + hSpace - nodes[s].hpos;
                  hShiftTreeAndRBrothers(rs, w);
                } else {
                  hShiftTreeAndRBrothers(rp, w);
                }
              } else {
                debugOut("Overlap within the same subtree");

                branch = nodes[s].contype;
                tm = s;
                while (nodes[tm].parentix !== "" && nodes[tm].parentix !== p) {
                  tm = nodes[tm].parentix;
                }
                branch = nodes[tm].contype;

                debugOut(
                  `Make room: branchtype = ${branch}, tomove: ${nodes[tm].txt}`
                );

                rs = getRootNode(s);
                rp = getRootNode(p);
                if (rs === rp) {
                  if (branch === "l") {
                    w =
                      nodes[s].hpos +
                      boxWidth +
                      hSpace / 2 -
                      (nodes[p].hpos + boxWidth / 2);
                    while (nodes[p].parentix !== "" && nodes[p].contype !== "u")
                      p = nodes[p].parentix;
                    hShiftTreeAndRBrothers(p, w);
                    hShiftTree(tm, -w);
                    // Move rsibs back to the left as far as possible
                    v = getEndOfDownline(p);
                    for (r = 0; r < nodes[p].rsib.length; r++) {
                      if (nodes[nodes[p].rsib[r]].hpos >= 0) {
                        x = findLeftMost(nodes[p].rsib[r], v);
                        // If the leftmost is the r-sib itself, use the default hShift distance. Use hSpace otherwise, it look better.
                        if (x == nodes[p].rsib[r].hpos) {
                          w = nodes[p].hpos + boxWidth / 2 + hShift - x;
                        } else {
                          w = nodes[p].hpos + boxWidth / 2 + hSpace / 2 - x;
                        }
                        debugOut(
                          `Node '${
                            nodes[nodes[p].rsib[r]].txt
                          }' will be shifted by ${w}`
                        );
                        if (w) hShiftTree(nodes[p].rsib[r], w);
                      }
                    }
                  } else {
                    w = nodes[p].hpos + boxWidth / 2 - nodes[s].hpos + hSpace;
                    hShiftTreeAndRBrothers(tm, w);
                  }
                } else {
                  if (nodes[rp].hpos > nodes[rs].hpos) {
                    hShiftTree(rp, w);
                  } else {
                    hShiftTree(rs, w);
                  }
                }
              }
            }
            m++;
          } while (s >= 0 && m < maxLoop);
        }
      }

      // Check the siblings:
      for (s = 0; s < nodes[p].usib.length; s++) {
        checkLinesRec(nodes[p].usib[s]);
      }
      for (s = 0; s < nodes[p].lsib.length; s++) {
        checkLinesRec(nodes[p].lsib[s]);
      }
      for (s = 0; s < nodes[p].rsib.length; s++) {
        checkLinesRec(nodes[p].rsib[s]);
      }
    };

    checkOverlap = () => {
      let i;
      let j;
      let retry;
      let m;
      let ui;
      let uj;
      let w;

      debugOut("CheckOverlap()");

      // Boxes direct on top of another box?
      m = 0;
      retry = 1;
      while (m < maxLoop && retry) {
        retry = 0;
        m++;
        for (i = 0; i < nodes.length; i++) {
          for (j = i + 1; j < nodes.length; j++) {
            if (
              nodes[i].hpos === nodes[j].hpos &&
              nodes[i].vpos === nodes[j].vpos
            ) {
              debugOut(
                `Complete overlap in node '${nodes[i].txt}' and '${
                  nodes[j].txt
                }`
              );
              ui = getRootNode(i);
              uj = getRootNode(j);
              if (ui !== uj) {
                hShiftTreeAndRBrothers(uj, boxWidth + hSpace);
              } else {
                ui = getUParent(i);
                uj = getUParent(j);
                if (ui !== uj) {
                  hShiftTreeAndRBrothers(uj, boxWidth + hSpace);
                } else {
                  // In the right subtree, find the first 'u' or 'r' parent to shift.
                  uj = j;
                  while (
                    nodes[uj].parent !== "" &&
                    nodes[uj].contype !== "u" &&
                    nodes[uj].contype !== "r"
                  ) {
                    uj = nodes[uj].parentix;
                  }
                  if (nodes[uj].parent !== "") {
                    hShiftTreeAndRBrothers(uj, boxWidth + hSpace);
                  } else {
                    debugOut("There is nothing I can do about this, sorry");
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
      while (m < maxLoop && retry) {
        retry = 0;
        m++;
        for (i = 0; i < nodes.length; i++) {
          j = getNodeAtUnequal(
            nodes[i].hpos + minDistBetweenLineAndBox,
            nodes[i].vpos + boxHeight / 2,
            i
          );
          if (j >= 0) {
            debugOut(`Overlap in node '${nodes[i].txt}' and '${nodes[j].txt}`);
            ui = getUParent(i);
            uj = getUParent(j);
            if (ui !== uj) {
              if (nodes[ui].hpos > nodes[uj].hpos) {
                uj = ui;
              }
              if (nodes[i].hpos > nodes[j].hpos) {
                w = nodes[j].hpos - nodes[i].hpos + boxWidth + hSpace;
              } else {
                w = nodes[i].hpos - nodes[j].hpos + boxWidth + hSpace;
              }
              if (nodeUnderParent(i, ui) && nodeUnderParent(j, ui)) {
                j = i;
                while (j >= 0 && nodes[j].contype === nodes[i].contype) {
                  j = nodes[j].parentix;
                }
                if (j >= 0) {
                  hShiftTreeAndRBrothers(j, w);
                }
              } else {
                while (
                  nodes[ui].parent !== "" &&
                  nodes[ui].contype === "u" &&
                  nodes[nodes[ui].parentix].usib.length === 1
                ) {
                  ui = nodes[ui].parentix;
                }
                hShiftTreeAndRBrothers(ui, w);
              }
              retry = 1;
            } else {
              hShiftTreeAndRBrothers(i, boxWidth / 2);
              retry = 1;
            }
          }
        }
      }
    };

    countSiblings = () => {
      let i;
      let p;
      let h;
      let v;

      for (i = 0; i < nodes.length; i++) {
        p = nodes[i].parentix;
        if (p >= 0) {
          if (nodes[i].contype === "u") {
            h = nodes[p].usib.length;
            nodes[p].usib[h] = i;
          }
          if (nodes[i].contype === "l") {
            v = nodes[p].lsib.length;
            nodes[p].lsib[v] = i;
          }
          if (nodes[i].contype === "r") {
            v = nodes[p].rsib.length;
            nodes[p].rsib[v] = i;
          }
        }
      }
    };

    positionBoxes = () => {
      let i;
      let x;

      debugOut("positionBoxes()");

      // Position all top level boxes:
      // The starting pos is 'x'. After the tree is positioned, center it.
      x = 0;
      for (i = 0; i < nodes.length; i++) {
        if (nodes[i].parent === "") {
          nodes[i].hpos = x + nodes[i].shadowOffsetX;
          nodes[i].vpos = 0 + nodes[i].shadowOffsetY;
          positionTree(i, x, x);
          // hpos can be changed during positionTree:
          x = findRightMost(i) + boxWidth + hSpace; // Start for next tree
        }
      }
    };

    positionTree = p => {
      // Position the complete tree under this parent.
      let h;

      let v;
      let s;
      let o;
      let i;
      let n;
      let w;
      let q;
      var r;
      let us;
      let uo;
      let x;
      let maxx;
      let minx;
      let max2;
      let x1;
      let x2;
      let y;
      let hdl;
      let vdl;
      let l;
      const r;
      let t;

      debugOut(
        `positionTree(${nodes[p].txt}, ${nodes[p].hpos}, ${nodes[p].vpos})`
      );
      // p has a position already. Position 'l', 'r' and 'u' sibs:

      // Positioning all 'l' sibs:
      for (v = 0; v < nodes[p].lsib.length; v++) {
        s = nodes[p].lsib[v];
        debugOut(`New lsib: ${nodes[s].txt} under ${nodes[p].txt}`);
        // New lsib, so the downline crosses all the way down. Make room first:
        y = getLowestBox(p, "l") + boxHeight + vSpace;
        makeRoomForDownline(p, y);

        nodes[s].hpos = nodes[p].hpos - boxWidth / 2 - hShift;
        nodes[s].vpos = y;
        if (nodes[s].hpos < 0) {
          for (r = 0; r < nodes.length; r++) {
            if (nodes[r].parent === "") {
              hShiftTree(r, -nodes[s].hpos);
            }
          }
          nodes[s].hpos = 0;
        }

        // Overlap?
        n = 1;
        do {
          o = getNodeAtUnequal(
            nodes[s].hpos - minDistBetweenLineAndBox,
            nodes[s].vpos + minDistBetweenLineAndBox,
            s
          );
          if (o < 0) {
            o = getNodeAtUnequal(
              nodes[s].hpos + boxWidth + minDistBetweenLineAndBox,
              nodes[s].vpos + minDistBetweenLineAndBox,
              s
            );
          }
          if (o < 0) {
            o = findNodeOnLine(nodes[s].vpos, 999999, "l");
            if (o === s) {
              o = -1;
            }
          }
          if (o >= 0) {
            debugOut(
              `New lsib '${nodes[s].txt}' (${nodes[s].hpos}, ${
                nodes[s].vpos
              }) has overlap with existing node '${nodes[o].txt}' (${
                nodes[o].hpos
              }, ${nodes[o].vpos})`
            );
            /* 1.16, much easier and better too:
                  h = nodes[s].hpos - nodes[o].hpos;
                  h = Math.abs(h);
                  w = nodes[o].hpos + boxWidth + hSpace - nodes[s].hpos;
                  if (nodes[o].contype === 'l') w += hSpace;
                  */
            w = nodes[o].hpos + boxWidth + hSpace - nodes[s].hpos;
            q = nodes[s].parentix;
            while (q !== -1 && nodes[q].contype !== "u") {
              q = nodes[q].parentix;
            }
            if (q < 0) {
              hShiftTree(p, w);
            } else {
              if (!nodeUnderParent(o, q)) {
                hShiftTreeAndRBrothers(q, w); // ! 2*w, dd 2013-10-21
              } else {
                debugOut("Same parent, do not shift");
              }
            }
          }
          n++;
          if (n > maxLoop) {
            o = -1;
          }
        } while (o >= 0);
        positionTree(s);
      }

      // Positioning all rsibs:
      for (v = 0; v < nodes[p].rsib.length; v++) {
        s = nodes[p].rsib[v];
        debugOut(`New rsib: ${nodes[s].txt} under ${nodes[p].txt}`);
        // Default placement: right from the parent and right from all other nodes in this row:
        nodes[s].vpos = getLowestBox(p, "r") + boxHeight + vSpace;
        x1 = findRightMostAtVpos(nodes[s].vpos);
        if (x1 > 0) x1 = x1 + boxWidth + hSpace;
        x2 = nodes[p].hpos + boxWidth / 2 + hShift;
        nodes[s].hpos = Math.max(x1, x2);

        // Overlap?
        n = 1;
        do {
          o = getNodeAtUnequal(
            nodes[s].hpos - minDistBetweenLineAndBox,
            nodes[s].vpos + minDistBetweenLineAndBox,
            s
          );
          if (o < 0) {
            o = getNodeAtUnequal(
              nodes[s].hpos + boxWidth + minDistBetweenLineAndBox,
              nodes[s].vpos + minDistBetweenLineAndBox,
              s
            );
          }
          if (o < 0) {
            o = findNodeOnLine(nodes[s].vpos, 999999, "l");
            if (o === s) {
              o = -1;
            }
          }
          if (o >= 0) {
            debugOut(
              `New rsib '${nodes[s].txt}' (${nodes[s].hpos}, ${
                nodes[s].vpos
              }) has overlap with existing node '${nodes[o].txt}' (${
                nodes[o].hpos
              }, ${nodes[o].vpos})`
            );
            h = nodes[s].hpos - nodes[o].hpos;
            h = Math.abs(h);
            q = nodes[s].parentix;
            while (q !== -1 && nodes[q].contype !== "u") {
              q = nodes[q].parentix;
            }
            if (q < 0) {
              hShiftTree(p, boxWidth + hSpace - h);
            } else {
              us = getUParent(s);
              uo = getUParent(o);
              if (us === uo) {
                if (!nodeUnderParent(o, q)) {
                  hShiftTreeAndRBrothers(q, boxWidth + hSpace - h);
                } else {
                  // Shift parent if overlap with lsib of our parent
                  debugOut("Same parent, do not shift");
                }
              } else {
                // Shift the common parent (if any) to the right, and the uppermost parent of the existing o node back to the left:
                us = getRootNode(s);
                uo = getRootNode(o);
                w = nodes[o].hpos - nodes[s].hpos + boxWidth + hSpace;
                if (us === uo) {
                  debugOut(`Common root = ${nodes[us].txt}`);
                  us = s;
                  while (
                    nodes[us].parent != "" &&
                    !nodeUnderParent(o, nodes[us].parentix)
                  ) {
                    us = nodes[us].parentix;
                  }
                  debugOut(`Highest not common u-parent = ${nodes[us].txt}`);
                  hShiftTreeAndRBrothers(us, w);
                } else {
                  hShiftTreeAndRBrothers(s, w);
                }
              }
            }
          }
          n++;
          if (n > maxLoop) {
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
      v = getLowestBox(p, "lr") + boxHeight + vSpace;
      n = nodes[p].usib.length;

      if (n > 0) {
        // If there is a left or right subtree, the starting position is on the right, the left or in between them:
        for (i = 0; i < nodes[p].lsib.length; i++) {
          x = findRightMost(nodes[p].lsib[i], v);
          if (nodes[p].rsib.length > 0) {
            w = x + hSpace / 2 - boxWidth / 2 - nodes[p].hpos;
          } else {
            w = x + hShift / 2 - boxWidth / 2 - nodes[p].hpos;
          }
          if (w > 0) {
            debugOut(
              `Place root right from the left subtrees, shift '${
                nodes[p].txt
              }' to the right = ${w}`
            );
            nodes[p].hpos += w;
            debugOut("Now move all upper l-sibs with the same space (if any)");
            for (l = 0; l < i; l++) {
              debugOut(
                `${l}: Move lsib ${
                  nodes[nodes[p].lsib[l]].txt
                } to the right too.`
              );
              hShiftTree(nodes[p].lsib[l], w);
            }
          }
        }

        // If right trees, shift the to the right of the (repositioned) root node:
        for (i = 0; i < nodes[p].rsib.length; i++) {
          x = findLeftMost(nodes[p].rsib[i], v);
          // If the node found is the lsib itself, use hShift. Otherwise use hSpace/2, it looks better.
          if (x == nodes[nodes[p].rsib[i]].hpos) {
            w = nodes[p].hpos + boxWidth / 2 + hShift - x;
          } else {
            w = nodes[p].hpos + boxWidth / 2 + hSpace / 2 - x;
          }
          if (w) {
            debugOut(
              `Right tree '${
                nodes[nodes[p].rsib[i]].txt
              }' must shift to the right, because of the tree: ${w}`
            );
            hShiftTree(nodes[p].rsib[i], w);
            x += w;
          }
        }

        // If there are multiple usib nodes, try to place them under the left tree, centering under the parent:
        x1 = nodes[p].hpos;
        x2 = nodes[p].hpos;
        if (n >= 2 && x1 > 0) {
          // Check all node on this vpos to overlap.
          // Maybe we overlap a downline, this will be caught later on.
          h = findNodeOnLine(v, nodes[p].hpos, "l");
          if (h < 0) {
            x2 = x2 + boxWidth / 2 - (n * boxWidth + (n - 1) * hSpace) / 2;
            if (x2 < 0) {
              x2 = 0;
            }
            x1 = x2;
          }
          if (h >= 0 && nodes[h].hpos + boxWidth + hSpace < x1) {
            x1 = nodes[h].hpos + boxWidth + hSpace; // minimum x
            x2 = x2 + boxWidth / 2 - (n * boxWidth + (n - 1) * hSpace) / 2; // wanted
            if (x1 > x2) {
              x2 = x1;
            } else {
              x1 = x2;
            }
          }
        }

        for (h = 0; h < nodes[p].usib.length; h++) {
          s = nodes[p].usib[h];
          nodes[s].hpos = x2;
          nodes[s].vpos = getLowestBox(p, "lr") + boxHeight + vSpace;
          v = underVSib(s);
          // Overlap?
          n = 0;
          do {
            o = getNodeAtUnequal(
              nodes[s].hpos - minDistBetweenLineAndBox,
              nodes[s].vpos + minDistBetweenLineAndBox,
              s
            );
            if (o < 0) {
              o = getNodeAtUnequal(
                nodes[s].hpos + boxWidth + minDistBetweenLineAndBox,
                nodes[s].vpos + minDistBetweenLineAndBox,
                s
              );
            }
            if (o < 0) {
              o = findNodeOnLine(nodes[s].vpos, 999999, "l");
              if (o === s) {
                o = -1;
              }
            }
            if (o >= 0) {
              debugOut(
                `New usib '${nodes[s].txt} at (${nodes[s].hpos}, ${
                  nodes[s].vpos
                })' has overlap with existing node '${nodes[o].txt}' at (${
                  nodes[o].hpos
                }, ${nodes[o].vpos})`
              );
              w = nodes[o].hpos - nodes[s].hpos + boxWidth + hSpace;
              // Find the highest node, not in the path of the found 'o' node:
              us = s;
              while (
                nodes[us].parent != "" &&
                !nodeUnderParent(o, nodes[us].parentix)
              ) {
                us = nodes[us].parentix;
              }
              debugOut(`Highest found = ${nodes[us].txt}`);
              hShiftTreeAndRBrothers(us, w);
            }
            n++;
            if (n > maxLoop) {
              o = -1;
            }
          } while (o >= 0);
          positionTree(s);
          x2 = nodes[s].hpos + boxWidth + hSpace;
        }
      }

      reposParentsRec(p);
    };

    reposParents = () => {
      // All parents with usibs are repositioned (start at the lowest level!)
      let i;

      debugOut("reposParents()");

      for (i = 0; i < nodes.length; i++) {
        if (nodes[i].parentix === -1) {
          reposParentsRec(i);
        }
      }
    };

    reposParentsRec = p => {
      let w;
      let s;
      let f;
      let h;
      let hpos;
      let r;
      let maxw;
      let minw;
      let d;
      let q;

      debugOut(`reposParentsRec(${nodes[p].txt})`);
      d = debug;
      debug = 0;

      hpos = nodes[p].hpos;

      // The sibslings first:
      for (s = 0; s < nodes[p].usib.length; s++) {
        reposParentsRec(nodes[p].usib[s]);
      }
      for (s = 0; s < nodes[p].lsib.length; s++) {
        reposParentsRec(nodes[p].lsib[s]);
      }
      for (s = 0; s < nodes[p].rsib.length; s++) {
        reposParentsRec(nodes[p].rsib[s]);
      }

      // If this is a parent with two or more usibs, reposition it:
      // (Repos over 1 u sib too, just correct it if necessary)
      // Except if this is a sib, without room to move, limit the room to move.
      // Of course a r-sib of this sib can cause an overlap too.
      // Exception: if this is a node with only one usub, we need to position right above
      // the usib. If necessary, we need to move the complete parent tree.
      h = nodes[p].usib.length;
      if (h >= 1) {
        debugOut(`repos ${nodes[p].txt}`);
        maxw = -1;
        minw = -1;
        if (nodes[p].contype == "l") {
          r = nodes[p].parentix;
          maxw =
            nodes[r].hpos + boxWidth / 2 - boxWidth - hSpace - nodes[p].hpos;
        }
        if (nodes[p].contype == "r") {
          r = nodes[p].parentix;
          minw =
            nodes[r].hpos + boxWidth / 2 - hSpace - boxWidth - nodes[p].hpos;
        }
        w = 0;
        if (centerParentOverCompleteTree) {
          w = (findRightMost(p) - nodes[p].hpos) / 2;
        } else {
          f = nodes[p].usib[0];
          s = nodes[p].usib[h - 1];
          w =
            nodes[f].hpos + (nodes[s].hpos - nodes[f].hpos) / 2 - nodes[p].hpos;
        }
        if (maxw >= 0 && w > maxw) {
          w = maxw;
        }
        if (minw >= 0 && w > minw) {
          w = minw;
        }
        s = findNodeOnLine(nodes[p].vpos, nodes[p].hpos, "r");
        if (s >= 0) {
          if (nodes[p].hpos + boxWidth + hSpace + w >= nodes[s].hpos) {
            w = nodes[s].hpos - boxWidth - hSpace - nodes[p].hpos;
          }
        }
        if (
          nodes[p].usib.length == 1 &&
          nodes[p].hpos + w != nodes[nodes[p].usib[0]].hpos
        ) {
          debugOut(
            `${
              nodes[p].txt
            } is a parent with 1 usib and not enough room to move, so move complete tree`
          );
          debugOut(
            `Need: ${nodes[nodes[p].usib[0]].hpos -
              nodes[p].hpos}, room to move: ${w} (reset)`
          );
          w = nodes[nodes[p].usib[0]].hpos - nodes[p].hpos;
        }
        // Check for a crossing with a rsib connection line:
        maxw = 999999;
        for (q = 0; q < nodes.length; q++) {
          if (
            nodes[q].vpos === nodes[p].vpos &&
            nodes[q].hpos > nodes[p].hpos
          ) {
            maxw = nodes[q].hpos - nodes[p].hpos - boxWidth - hShift - hSpace;
            if (maxw < 0) maxw = 0;
            if (w > maxw) w = maxw;
          }
        }
        if (w > 1) {
          // Shift this nodes and all 'l' and 'r' sib trees
          nodes[p].hpos += w;
          for (s = 0; s < nodes[p].lsib.length; s++) {
            hShiftTree(nodes[p].lsib[s], w);
          }
          for (s = 0; s < nodes[p].rsib.length; s++) {
            hShiftTree(nodes[p].rsib[s], w);
          }
        }
      }

      debug = d;
    };

    findRightMost = (p, maxv) => {
      // return the highest hpos of the given tree, if maxv is specified, vpos must be less than maxv:
      let maxx;

      let x;
      let i;

      if (maxv === undefined) {
        maxv = 999999;
      }

      if (nodes[p].vpos <= maxv) {
        maxx = nodes[p].hpos;
      } else {
        maxx = -1;
      }

      // usib to the right?
      for (i = 0; i < nodes[p].usib.length; i++) {
        x = findRightMost(nodes[p].usib[i], maxv);
        maxx = Math.max(x, maxx);
      }

      // Walk along the lsibs:
      for (i = 0; i < nodes[p].lsib.length; i++) {
        x = findRightMost(nodes[p].lsib[i], maxv);
        maxx = Math.max(x, maxx);
      }

      // Walk along the rsibs:
      for (i = 0; i < nodes[p].rsib.length; i++) {
        x = findRightMost(nodes[p].rsib[i], maxv);
        maxx = Math.max(x, maxx);
      }

      return maxx;
    };

    findRightMostAtVpos = v => {
      // return the highest hpos of any nodes at vpos 'v'
      let maxx;

      let i;

      maxx = -1;

      for (i = 0; i < nodes.length; i++) {
        if (nodes[i].vpos == v && nodes[i].hpos > maxx) maxx = nodes[i].hpos;
      }

      return maxx;
    };

    findLeftMost = (p, maxv) => {
      // return the lowest hpos of the given tree:
      let minx;

      let x;
      let i;

      if (maxv === undefined) {
        maxv = 999999;
      }

      if (nodes[p].vpos <= maxv) {
        minx = nodes[p].hpos;
      } else {
        minx = 999999;
      }

      // usib to the left?
      if (nodes[p].usib.length > 0) {
        x = findLeftMost(nodes[p].usib[0], maxv);
        minx = Math.min(x, minx);
      }

      // Walk along the lsibs:
      for (i = 0; i < nodes[p].lsib.length; i++) {
        x = findLeftMost(nodes[p].lsib[i], maxv);
        minx = Math.min(x, minx);
      }

      // Walk along the rsibs:
      for (i = 0; i < nodes[p].rsib.length; i++) {
        x = findLeftMost(nodes[p].rsib[i], maxv);
        minx = Math.min(x, minx);
      }

      return minx;
    };

    findNodeOnLine = (v, h, dir) => {
      // Search all nodes on vpos 'v', and return the rightmost node on the left, or the leftmost on the rest,
      // depending on the direction.
      let i;

      let fnd;
      let x;

      fnd = -1;
      x = dir === "l" ? -1 : 999999;

      for (i = 0; i < nodes.length; i++) {
        if (nodes[i].vpos === v) {
          if (dir === "l" && nodes[i].hpos < h && nodes[i].hpos > x) {
            fnd = i;
            x = nodes[i].hpos;
          }
          if (dir === "r" && nodes[i].hpos > h && nodes[i].hpos < x) {
            fnd = i;
            x = nodes[i].hpos;
          }
        }
      }

      return fnd;
    };

    drawImageNodes = () => {
      // Images are loaded after drawing finished.
      // After an image has been loaded, this function will be called, which redraws the nodes
      // with images nodes, have a valid image now and are drawn incomplete before.
      let i;

      let ctx;

      ctx = theCanvas.getContext("2d");

      for (i = 0; i < nodes.length; i++) {
        if (nodes[i].img && nodes[i].img.width > 0 && !nodes[i].imgDrawn) {
          drawNode(ctx, i);
        }
      }
    };

    drawNode = (ctx, i) => {
      let ix;
      let gradient;
      let maxrad;
      let imgrad;
      let x = nodes[i].hpos;
      let y = nodes[i].vpos;
      let width = boxWidth;
      let height = boxHeight;
      let txt = nodes[i].txt;
      const bold = nodes[i].bold;
      const blcolor = nodes[i].linecolor;
      const bfcolor = nodes[i].fillcolor;
      const tcolor = nodes[i].textcolor;
      let font = nodes[i].textfont;
      const fsize = nodes[i].textsize;
      const valign = nodes[i].valign;
      const img = nodes[i].img;
      const imgalign = nodes[i].imgAlign;
      const imgvalign = nodes[i].imgVAlign;
      const toprad = nodes[i].topradius;
      const botrad = nodes[i].botradius;
      const shadowx = nodes[i].shadowOffsetX;
      const shadowy = nodes[i].shadowOffsetY;

      // Draw shadow with gradient first:
      if (shadowx > 0) {
        x += shadowx;
        y += shadowy;
        ctx.fillStyle = shadowColor;
        ctx.beginPath();
        ctx.moveTo(x + toprad, y);
        ctx.lineTo(x + width - toprad, y);
        if (toprad > 0)
          ctx.quadraticCurveTo(x + width, y, x + width, y + toprad);
        ctx.lineTo(x + width, y + height - botrad);
        if (botrad > 0)
          ctx.quadraticCurveTo(
            x + width,
            y + height,
            x + width - botrad,
            y + height
          );
        ctx.lineTo(x + botrad, y + height);
        if (botrad > 0)
          ctx.quadraticCurveTo(x, y + height, x, y + height - botrad);
        ctx.lineTo(x, y + toprad);
        if (toprad > 0) ctx.quadraticCurveTo(x, y, x + toprad, y);
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
      if (toprad > 0) ctx.quadraticCurveTo(x + width, y, x + width, y + toprad);
      ctx.lineTo(x + width, y + height - botrad);
      if (botrad > 0)
        ctx.quadraticCurveTo(
          x + width,
          y + height,
          x + width - botrad,
          y + height
        );
      ctx.lineTo(x + botrad, y + height);
      if (botrad > 0)
        ctx.quadraticCurveTo(x, y + height, x, y + height - botrad);
      ctx.lineTo(x, y + toprad);
      if (toprad > 0) ctx.quadraticCurveTo(x, y, x + toprad, y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw the image, if any:
      // If the image is available, draw.
      // Mark it incomplete otherwise.
      let xPic;

      let yPic;
      let maxx;
      let maxy;
      if (img) {
        // Get all positions and sizes, even if no image loaded yet:
        if (img.width > 0) {
          maxx = img.width;
          maxy = img.height;

          // Resize if image too height:
          // If the imgrad is less than the linewidth of the box, we need to draw inside the box:
          imgrad = 0.414 * (toprad + botrad);
          if (imgrad < 1) imgrad = 1;

          if (maxy > height - imgrad) {
            maxx = img.width * (height - imgrad) / img.height;
            maxy = height - imgrad;
          }

          // Resize if image too width, even after previous resize:
          maxrad = toprad;
          if (botrad > maxrad) maxrad = botrad;
          imgrad = 0.414 * maxrad;
          if (maxx > width - 2 * imgrad) {
            maxy = img.height * (width - 2 * imgrad) / img.width;
            maxx = width - 2 * imgrad;
          }
        } else {
          imgrad = 0.414 * (toprad + botrad);
          if (imgrad < 1) imgrad = 1;

          if (width > height) {
            maxy = height - 2 * imgrad;
          } else {
            maxy = width - 2 * imgrad;
          }
          maxx = maxy;
        }

        // Horizontal offset:
        xPic = imgrad;
        if (imgalign == "c") xPic = (width - 2 * imgrad - maxx) / 2 + imgrad;
        if (imgalign == "r") xPic = width - maxx - imgrad;

        // Vertical offset:
        yPic = 0.414 * toprad + 1;
        if (imgvalign == "m") yPic = (height - maxy) / 2;
        if (imgvalign == "b") yPic = height - maxy - 0.414 * botrad - 1;

        if (img.width > 0) {
          ctx.drawImage(img, x + xPic, y + yPic, maxx, maxy);
          nodes[i].imgDrawn = 1;
        } else {
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
          nodes[i].imgDrawn = 0;
        }

        // Adjust the box size, so the text will be placed next to the image:
        // Find the biggest rectangle for the text:
        if (imgalign == "l") {
          if (imgvalign == "t") {
            if ((width - maxx) * height > width * (height - maxy)) {
              x += xPic + maxx;
              width -= xPic + maxx;
            } else {
              y += yPic + maxy;
              height -= yPic + maxy;
            }
          }
          if (imgvalign == "m") {
            x += xPic + maxx;
            width -= xPic + maxx;
          }
          if (imgvalign == "b") {
            if ((width - maxx) * height > width * (height - maxy)) {
              x += xPic + maxx;
              width -= xPic + maxx;
            } else {
              height -= yPic + maxy;
            }
          }
        }
        if (imgalign == "c") {
          if (imgvalign == "t") {
            y += yPic + maxy;
            height -= yPic + maxy;
          }
          if (imgvalign == "m") {
            if (width - maxx > height - maxy) {
              x += xPic + maxx;
              width -= xPic + maxx;
            } else {
              y += yPic + maxy;
              height -= yPic + maxy;
            }
          }
          if (imgvalign == "b") {
            height = yPic;
          }
        }
        if (imgalign == "r") {
          if (imgvalign == "t") {
            if ((width - maxx) * height > width * (height - maxy)) {
              width = xPic;
            } else {
              y += yPic + maxy;
              height -= yPic + maxy;
            }
          }
          if (imgvalign == "m") {
            width = xPic;
          }
          if (imgvalign == "b") {
            if ((width - maxx) * height > width * (height - maxy)) {
              width = xPic;
            } else {
              height -= yPic + maxy;
            }
          }
        }
      }

      // Draw text, break the string on spaces, and \n sequences:
      // Note: excanvas does not clip text. We need to do it ourselves.
      //ctx.save();
      //ctx.clip(); will clip on "image-not-found" now

      const tlines = []; // Split text in multiple lines if it doesn't fit
      let n = 0;
      let t1;
      let nl;
      txt = cleanText(txt);
      while (txt.length > 0 && n < maxLoop) {
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
          if (nl >= 0) txt = txt.substr(1); // \n sequence
        } else {
          txt = "";
        }
      }

      // IE does not clip text, so we clip it here:
      if (fsize * n > height) {
        n = Math.floor(height / fsize);
      }
      if (tlines[0] !== undefined && n < 1) {
        debugOut(`No text displayed on node ${tlines[0]} as it doesn't fit`);
      }

      // The font syntax is: [style] <size> <fontname>. <size> <style> <fontname> does not work! So reformat here:
      let style = "";
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
      ctx.font = `${style + fsize}px ${font}`;
      ctx.textBaseline = "top";
      ctx.textAlign = "center";
      ctx.fillStyle = tcolor;

      var i;
      let yp = 0;
      if (valign) {
        yp = Math.floor((height - n * fsize) / 2);
      }
      for (i = 0; i < n; i++) {
        while (
          tlines[i].length > 0 &&
          ctx.measureText(tlines[i]).width > width
        ) {
          tlines[i] = tlines[i].substr(0, tlines[i].length - 1);
        }
        ctx.fillText(tlines[i], x + width / 2, y + yp);
        yp += parseInt(fsize, 10);
      }

      //ctx.restore();
    };

    drawConLines = ctx => {
      // Draw all connection lines.
      // We cannot simply draw all lines, over and over again, as the color will change.
      // Therefore we draw all lines separat, and only once.
      let i;

      let f;
      let l;
      let r;
      let v;

      ctx.strokeStyle = lineColor;
      ctx.beginPath();
      for (i = 0; i < nodes.length; i++) {
        // Top and left lines of siblings
        if (nodes[i].parentix >= 0) {
          if (nodes[i].contype === "u") {
            ctx.moveTo(nodes[i].hpos + boxWidth / 2, nodes[i].vpos);
            ctx.lineTo(
              nodes[i].hpos + boxWidth / 2,
              nodes[i].vpos - vSpace / 2
            );
          }
          if (nodes[i].contype === "l") {
            ctx.moveTo(nodes[i].hpos + boxWidth, nodes[i].vpos + boxHeight / 2);
            ctx.lineTo(
              nodes[nodes[i].parentix].hpos + boxWidth / 2,
              nodes[i].vpos + boxHeight / 2
            );
          }
          if (nodes[i].contype === "r") {
            ctx.moveTo(nodes[i].hpos, nodes[i].vpos + boxHeight / 2);
            ctx.lineTo(
              nodes[nodes[i].parentix].hpos + boxWidth / 2,
              nodes[i].vpos + boxHeight / 2
            );
          }
        }

        // Downline if any siblings:
        v = getEndOfDownline(i);
        if (v >= 0) {
          ctx.moveTo(nodes[i].hpos + boxWidth / 2, nodes[i].vpos + boxHeight);
          ctx.lineTo(nodes[i].hpos + boxWidth / 2, v);
        }

        // Horizontal line above multiple 'u' sibs:
        if (nodes[i].usib.length > 1) {
          f = nodes[i].usib[0];
          l = nodes[i].usib[nodes[i].usib.length - 1];

          ctx.moveTo(nodes[f].hpos + boxWidth / 2, nodes[f].vpos - vSpace / 2);
          ctx.lineTo(nodes[l].hpos + boxWidth / 2, nodes[f].vpos - vSpace / 2);
        }
        // Horizontal line above a single 'u' sib, if not aligned:
        if (nodes[i].usib.length == 1) {
          f = nodes[i].usib[0];

          ctx.moveTo(nodes[f].hpos + boxWidth / 2, nodes[f].vpos - vSpace / 2);
          ctx.lineTo(nodes[i].hpos + boxWidth / 2, nodes[f].vpos - vSpace / 2);
        }
      }
      ctx.stroke();
    };

    getEndOfDownline = p => {
      let f;
      let l;
      let r;

      // if this node has u-sibs, the endpoint can be found from the vpos of the first u-sib:
      if (nodes[p].usib.length > 0) {
        f = nodes[p].usib[0];
        return nodes[f].vpos - vSpace / 2;
      }

      // Find the lowest 'l' or 'r' sib:
      l = nodes[p].lsib.length;
      r = nodes[p].rsib.length;
      f = -1;
      if (l > 0 && r == 0) {
        f = nodes[p].lsib[l - 1];
      }
      if (l == 0 && r > 0) {
        f = nodes[p].rsib[r - 1];
      }
      if (l > 0 && r > 0) {
        l = nodes[p].lsib[l - 1];
        r = nodes[p].rsib[r - 1];
        if (nodes[l].vpos > nodes[r].vpos) {
          f = l;
        } else {
          f = r;
        }
      }

      if (f >= 0) {
        return nodes[f].vpos + boxHeight / 2;
      }

      return -1;
    };

    getNodeAt = (x, y) => {
      let i;
      let x2;
      let y2;

      x2 = x - boxWidth;
      y2 = y - boxHeight;

      for (i = 0; i < nodes.length; i++) {
        if (
          x > nodes[i].hpos &&
          x2 < nodes[i].hpos &&
          y > nodes[i].vpos &&
          y2 < nodes[i].vpos
        ) {
          return i;
        }
      }
      return -1;
    };

    getNodeAtUnequal = (x, y, u) => {
      let i;
      let x2;
      let y2;

      x2 = x - boxWidth;
      y2 = y - boxHeight;

      for (i = 0; i < nodes.length; i++) {
        if (
          i !== u &&
          x > nodes[i].hpos &&
          x2 < nodes[i].hpos &&
          y > nodes[i].vpos &&
          y2 < nodes[i].vpos
        ) {
          return i;
        }
      }
      return -1;
    };

    underVSib = n => {
      // Walk along the parents. If one is a lsib or rsib, return the index.
      while (n >= 0) {
        if (nodes[n].contype === "l") {
          return n;
        }
        if (nodes[n].contype === "r") {
          return n;
        }
        n = nodes[n].parentix;
      }
      return -1;
    };

    errOut = t => {
      console.log(t);
    };

    debugOut = t => {
      if (debug > 0) {
        //document.write("<font color='red'>OrgChart.js: <b>" + t + "</b></font><br>");
        console.log(t);
      }
    };

    cleanText = tin => {
      let i;

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
      while (
        i > 0 &&
        (tin.charAt(i - 1) === " " || tin.charAt(i - 1) === "\t")
      ) {
        i--;
      }
      if (i < tin.length) {
        tin = tin.substr(0, i);
      }

      // Implode double spaces and tabs etc:
      return tin.replace(/[ \t]{2,}/g, " ");
    };

    dumpNodes = () => {
      let i;
      for (i = 0; i < nodes.length; i++) {
        console.log(
          `${i}: ${nodes[i].parentix} at(${nodes[i].hpos},${
            nodes[i].vpos
          }) usib = ${nodes[i].usib.length} lsib = ${
            nodes[i].lsib.length
          } rsib = ${nodes[i].rsib.length}  ${nodes[i].txt}, parent = ${
            nodes[i].parent
          }, parentix = ${nodes[i].parentix}`
        );
      }
    };

    overlapBoxInTree = p => {
      // Check all nodes in this tree to overlap another box already placed:
      // Return the index, or -1
      let s;

      let r;
      let i;
      let x;
      let y;

      if (nodes[p].hpos < 0) {
        return -1;
      }

      for (s = 0; s < nodes[p].usib.length; s++) {
        r = overlapBoxInTree(nodes[p].usib[s]);
        if (r >= 0) {
          return r;
        }
      }

      for (s = 0; s < nodes[p].lsib.length; s++) {
        r = overlapBoxInTree(nodes[p].lsib[s]);
        if (r >= 0) {
          return r;
        }
      }

      for (s = 0; s < nodes[p].rsib.length; s++) {
        r = overlapBoxInTree(nodes[p].rsib[s]);
        if (r >= 0) {
          return r;
        }
      }

      for (i = 0; i < nodes.length; i++) {
        if (nodes[i].hpos >= 0 && i !== p) {
          x = nodes[p].hpos - minDistBetweenLineAndBox;
          y = nodes[p].vpos + minDistBetweenLineAndBox;
          if (
            x > nodes[i].hpos &&
            x < nodes[i].hpos + boxWidth &&
            y > nodes[i].vpos &&
            y < nodes[i].vpos + boxHeight
          ) {
            return i;
          }
          x = nodes[p].hpos + boxWidth + minDistBetweenLineAndBox;
          if (
            x > nodes[i].hpos &&
            x < nodes[i].hpos + boxWidth &&
            y > nodes[i].vpos &&
            y < nodes[i].vpos + boxHeight
          ) {
            return i;
          }
        }
      }

      return -1;
    };

    getLowestBox = (p, subtree) => {
      let s;
      let y;
      let r;

      if (subtree === undefined) {
        subtree = "ulr";
      }

      y = nodes[p].vpos;

      if (subtree.includes("u")) {
        for (s = 0; s < nodes[p].usib.length; s++) {
          r = getLowestBox(nodes[p].usib[s]);
          y = Math.max(r, y);
        }
      }

      if (subtree.includes("l")) {
        for (s = 0; s < nodes[p].lsib.length; s++) {
          r = getLowestBox(nodes[p].lsib[s]);
          y = Math.max(r, y);
        }
      }

      if (subtree.includes("r")) {
        for (s = 0; s < nodes[p].rsib.length; s++) {
          r = getLowestBox(nodes[p].rsib[s]);
          y = Math.max(r, y);
        }
      }

      return y;
    };

    getRootNode = p => {
      while (nodes[p].parent !== "") {
        p = nodes[p].parentix;
      }
      return p;
    };

    getUParent = n => {
      // Walk to the top of the tree, and return the first 'u' node found.
      // If none, return the root node.
      while (n >= 0) {
        if (nodes[n].contype === "u" || nodes[n].parent === "") {
          return n;
        }
        n = nodes[n].parentix;
      }
      // Not reached
      return -1;
    };

    nodeUnderParent = (n, p) => {
      // Return 1 if node n is part of the p tree:
      while (n >= 0) {
        if (n === p) {
          return 1;
        }
        n = nodes[n].parentix;
      }
      return 0;
    };

    getAbsPosX = obj => {
      let curleft = 0;

      if (obj.offsetParent) {
        do {
          curleft += obj.offsetLeft;
          obj = obj.offsetParent;
        } while (obj);
      } else {
        if (obj.x) {
          curleft += obj.x;
        }
      }

      return curleft;
    };

    getAbsPosY = obj => {
      let curtop = 0;

      if (obj.offsetParent) {
        do {
          curtop += obj.offsetTop;
          obj = obj.offsetParent;
        } while (obj);
      } else {
        if (obj.y) {
          curtop += obj.y;
        }
      }

      return curtop;
    };

    makeRoomForDownline = (p, v) => {
      // Alle l-sib trees may not overlap the downline, up to the point vpos.
      // Shift the parent and all r-sibs to the right
      // We need to do this one by one for all lsibs, otherwise upper-l-nodes may be shifted too much to the left.
      let maxx;

      let h;
      let x;
      let w;
      let minx;
      let l;
      let r;

      if (v > 0) {
        debugOut(
          `makeRoomForDownline ${nodes[p].txt} at hpos ${
            nodes[p].hpos
          }, up to vpos ${v}`
        );
        // Check 'l' sibs first
        if (nodes[p].lsib.length > 0) {
          maxx = -1;
          for (h = 0; h < nodes[p].lsib.length; h++) {
            x = findRightMost(nodes[p].lsib[h], v);
            maxx = Math.max(x, maxx);
            if (maxx < 0) maxx = curshadowOffsetX;
            // If the node found is the lsib itself, use hShift. Otherwise use hSpace/2, it looks better.
            if (x == nodes[nodes[p].lsib[h]].hpos) {
              w = maxx + boxWidth / 2 + hShift - nodes[p].hpos;
            } else {
              w = maxx + boxWidth / 2 + hSpace / 2 - nodes[p].hpos;
            }
            if (w > 0) {
              debugOut(
                `Make room -> Shift Tree ${nodes[p].txt} and rsibs over ${w}`
              );
              nodes[p].hpos += w;
              for (r = 0; r < nodes[p].rsib.length; r++) {
                hShiftTree(nodes[p].rsib[r], w);
              }
              debugOut(`Make room -> Shift upper lsibs back (index < ${h})`);
              for (l = 0; l < h; l++) {
                hShiftTree(nodes[p].lsib[l], w);
              }
            }
          }
        }

        // If right trees, shift them to the right of the (repositioned) root node:
        // Be carefull not to shift them back over other nodes, which can be if the parent has no u-sibs (and thus the left tree can extend to the right:
        for (r = 0; r < nodes[p].rsib.length; r++) {
          x = findLeftMost(nodes[p].rsib[r], v);
          // If the node found is the rsib itself, use hShift. Otherwise use hSpace/2, it looks better.
          if (x == nodes[nodes[p].rsib[r]].hpos) {
            w = nodes[p].hpos + boxWidth / 2 + hShift - x;
          } else {
            w = nodes[p].hpos + boxWidth / 2 + hSpace / 2 - x;
          }
          if (w) {
            debugOut(
              `Right tree '${nodes[nodes[p].rsib[r]].txt}' can shift by ${w}`
            );
            hShiftTree(nodes[p].rsib[r], w);
          }
        }
      }
    };

    centerOnCanvas = width => {
      let i;
      let max;
      let min;
      let w;

      // Find the left and rightmost nodes:
      max = -1;
      min = 999999;
      for (i = 0; i < nodes.length; i++) {
        if (nodes[i].hpos > max) {
          max = nodes[i].hpos;
        }
        if (nodes[i].hpos < min) {
          min = nodes[i].hpos;
        }
      }
      max += boxWidth;

      w = width / 2 - (max - min) / 2;
      for (i = 0; i < nodes.length; i++) {
        nodes[i].hpos += w;
      }
    };

    leftOnCanvas = width => {
      let i;
      let max;
      let min;
      let w;

      // Find the leftmost node:
      min = 999999;
      for (i = 0; i < nodes.length; i++) {
        if (nodes[i].hpos < min) {
          min = nodes[i].hpos;
        }
      }

      w = min;
      if (w > 0) {
        for (i = 0; i < nodes.length; i++) {
          nodes[i].hpos -= w;
        }
      }
    };
  }

  //////////////////////
  // Public functions:
  //////////////////////

  setDebug(value) {
    debug = value;
  }

  setSize(w, h, hspace, vspace, hshift) {
    if (w !== undefined && w > 0) {
      boxWidth = w;
    }
    if (h !== undefined && h > 0) {
      boxHeight = h;
    }
    if (hspace !== undefined && hspace > 0) {
      hSpace = Math.max(3, hspace);
    }
    if (vspace !== undefined && vspace > 0) {
      vSpace = Math.max(3, vspace);
    }
    if (hshift !== undefined && hshift > 0) {
      hShift = Math.max(3, hshift);
    }
  }

  setNodeStyle(toprad, botrad, shadow) {
    if (toprad !== undefined && toprad >= 0) {
      curtopradius = toprad;
    }
    if (botrad !== undefined && botrad >= 0) {
      curbotradius = botrad;
    }
    if (shadow !== undefined && shadow >= 0) {
      curshadowOffsetX = shadow;
      curshadowOffsetY = shadow;
    }
  }

  setFont(fname, size, color, valign) {
    if (fname !== undefined) {
      textFont = fname;
    }
    if (size !== undefined && size > 0) {
      textSize = size;
    }
    if (color !== undefined && color !== "") {
      textColor = color;
    }
    if (valign !== undefined) {
      textVAlign = valign;
    }
    if (textVAlign === "c" || textVAlign === "center") {
      textVAlign = 1;
    }
  }

  setColor(l, f, t, c) {
    if (l !== undefined && l !== "") {
      boxLineColor = l;
    }
    if (f !== undefined && f !== "") {
      boxFillColor = f;
    }
    if (t !== undefined && t !== "") {
      textColor = t;
    }
    if (c !== undefined && c !== "") {
      lineColor = c;
    }
  }

  addNode(
    id,
    parent,
    ctype,
    text,
    bold,
    url,
    linecolor,
    fillcolor,
    textcolor,
    img,
    imgalign
  ) {
    let imgvalign;

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
      linecolor = boxLineColor;
    }
    if (!fillcolor) {
      fillcolor = boxFillColor;
    }
    if (!textcolor) {
      textcolor = textColor;
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
      debugOut(`Invalid connection type '${ctype}' at node '${id}'`);
      ctype = "u";
    }
    imgvalign = "m";
    if (imgalign.substr(1, 1) == "t" || imgalign.substr(1, 1) == "T")
      imgvalign = "t";
    if (imgalign.substr(1, 1) == "b" || imgalign.substr(1, 1) == "B")
      imgvalign = "b";
    if (imgalign.substr(0, 1) == "c" || imgalign.substr(0, 1) == "C")
      imgalign = "c";
    if (imgalign.substr(0, 1) == "m" || imgalign.substr(0, 1) == "M")
      imgalign = "c"; // Service!
    if (imgalign.substr(0, 1) == "r" || imgalign.substr(0, 1) == "R")
      imgalign = "r";
    if (imgalign != "c" && imgalign != "r") imgalign = "l";

    let i;
    for (i = 0; i < nodes.length; i++) {
      if (nodes[i].id === id && noalerts !== 1) {
        alert(
          `Duplicate node.\nNode ${1 +
            nodes.length}, id = ${id}, '${text}'\nAlready defined as node ${i}, '${
            nodes[i].txt
          }'\n\nThis new node will not be added.\nNo additional messages are given.`
        );
        noalerts = 1;
        return;
      }
    }

    const n = new Node(
      id,
      parent,
      ctype,
      text,
      bold,
      url,
      linecolor,
      fillcolor,
      textcolor,
      imgalign,
      imgvalign
    );
    if (img !== undefined) {
      n.img = new Image();
      n.img.src = img;
      n.img.onload = () => {
        drawImageNodes();
      };
    }

    nodes[nodes.length] = n;
  }

  drawChart(id, align, fit) {
    // siblings may be added. Reset all positions first:
    let i;
    for (i = 0; i < nodes.length; i++) {
      nodes[i].hpos = -1;
      nodes[i].vpos = -1;
      nodes[i].usib = [];
      nodes[i].rsib = [];
      nodes[i].lsib = [];
    }

    drawChartPriv(id, true, align, fit);
  }

  redrawChart(id) {
    drawChartPriv(id, false);
  }
} // orgChart
