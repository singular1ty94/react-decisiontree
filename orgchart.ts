/// <reference path="./index.d.ts" />
// Version 1.16 - Version 1.0 of Typescript Version by singular1ty94
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

let G_vmlCanvasManager; // so non-IE won't freak out

export class OrgChart {

  public TreeNode: (id: any, parent: any, contype: any, txt: any,
                    bold: any, url: any, linecolor: any, fillcolor: any,
                    textcolor: any, imgalign: any, imgvalign: any,
                    curtopradius: any, curbotradius: any, textFont: any, textSize: any, textVAlign: any) => void;
  public drawChartPriv: any;
  public drawImageNodes: any;
  public lineColor: string;
  public boxWidth: number;
  public boxHeight: number;
  public hSpace: number;
  public vSpace: number;
  public hShift: number;
  public boxLineColor: string;
  public boxFillColor: string;
  public textColor: string;
  public textFont: string;
  public textSize: number;
  public textVAlign: any;

  public curtopradius: number;
  public curbotradius: number;
  public nodes: any[];
  public centerParentOverCompleteTree: number;
  public maxLoop: number;
  public minDistBetweenLineAndBox: number;
  public noalerts: number;
  public debug: any;
  constructor(properties: IOrgChart = {}) {
    ///////////////////
    // Default values:
    ///////////////////

    this.lineColor = // Color of the connection lines (global for all lines)
    properties.lineColor || "#3388DD";

    this.boxWidth = properties.boxWidth || 160; // Box width (global for all boxes)

    this.boxHeight = properties.boxHeight ||  80; // Box height (global for all boxes)

    this.hSpace = properties.hSpace || 30; // Horizontal space in between the boxes (global for all boxes)

    this.vSpace = properties.vSpace || 60; // Vertical space in between the boxes (global for all boxes)

    this.hShift = 15; // The number of pixels vertical siblings are shifted (global for all boxes)

    this.boxFillColor = // Default box fill color
    properties.boxFillColor || "#CFE8EF";

    this.boxLineColor = // Default box line color
    properties.boxLineColor || this.boxFillColor;

    this.textColor = // Default box text color
    properties.textColor ||  "#000000";

    this.textFont = // Default font
    properties.textFont || "arial";

    this.textSize = 12; // Default text size (pixels, not points)

    this.textVAlign = 1; // Default text alignment

    this.curtopradius = 0;
    this.curbotradius = 0;
    this.nodes = [];
    let theCanvas;

    this.centerParentOverCompleteTree = 0; // Experimental, lines may loose connections

    let debug = 0;
    this.maxLoop = 9;
    this.minDistBetweenLineAndBox = 5;
    this.noalerts = 0;

    //////////////////////
    // Internal functions:
    //////////////////////

    this.drawChartPriv = null;

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
    this.drawImageNodes = null;
    let drawNode;
    let drawConLines;
    let getNodeAt;
    let getEndOfDownline;
    let getNodeAtUnequal;
    let makeRoomForDownline;
    let underVSib;
    let cleanText;
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

    this.TreeNode = function(
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
      imgvalign,
      curtopradius,
      curbotradius,
      textFont,
      textSize,
      textVAlign
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
    };

    //////////////////////
    // Internal functions:
    //////////////////////

    this.drawChartPriv = (id, repos, align, fit) => {
      let i;
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
      ctx.fillStyle = this.boxFillColor;
      ctx.strokeStyle = this.boxLineColor;

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
        // tslint:disable-next-line:no-shadowed-variable
        let i;

        leftOnCanvas();

        for (i = 0; i < this.nodes.length; i++) {
          if (this.nodes[i].hpos + this.boxWidth > maxW) {
            maxW = this.nodes[i].hpos + this.boxWidth;
          }
          if (this.nodes[i].vpos + this.boxHeight > maxH) {
            maxH = this.nodes[i].vpos + this.boxHeight;
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

          theCanvas.style.width = `${width}px`;
          theCanvas.style.height = `${height}px`;

          ctx.scale(ratio, ratio);
        }
      }

      // Draw the lines:
      drawConLines(ctx);

      // Draw the boxes:
      for (i = 0; i < this.nodes.length; i++) {
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

    orgChartMouseMove = (event) => {
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
      if (i >= 0 && this.nodes[i].url.length > 0) {
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
        if (this.nodes[i].url.length > 0) {
          document.body.style.cursor = "default";
          i1 = this.nodes[i].url.indexOf("://");
          i2 = this.nodes[i].url.indexOf("/");
          if (i1 >= 0 && i2 > i1) {
            window.open(this.nodes[i].url);
          } else {
            // window.location = this.nodes[i].url;
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

      for (s = 0; s < this.nodes[p].usib.length; s++) {
        vShiftTree(this.nodes[p].usib[s], h, ymin);
      }
    };

    vShiftTree = (p, h, ymin) => {
      // Shift all siblings 'h' down (if they have a position already)
      let s;

      if (this.nodes[p].vpos >= 0 && this.nodes[p].vpos >= ymin) {
        this.nodes[p].vpos += h;
      }

      for (s = 0; s < this.nodes[p].usib.length; s++) {
        vShiftTree(this.nodes[p].usib[s], h, ymin);
      }

      for (s = 0; s < this.nodes[p].lsib.length; s++) {
        vShiftTree(this.nodes[p].lsib[s], h, ymin);
      }

      for (s = 0; s < this.nodes[p].rsib.length; s++) {
        vShiftTree(this.nodes[p].rsib[s], h, ymin);
      }
    };

    hShiftTree = (p, w) => {
      // Shift all siblings (which have a position already) 'w' pixels
      let s;

      if (this.nodes[p].hpos >= 0) {
        this.nodes[p].hpos += w;
      }

      for (s = 0; s < this.nodes[p].usib.length; s++) {
        hShiftTree(this.nodes[p].usib[s], w);
      }

      for (s = 0; s < this.nodes[p].lsib.length; s++) {
        hShiftTree(this.nodes[p].lsib[s], w);
      }

      for (s = 0; s < this.nodes[p].rsib.length; s++) {
        hShiftTree(this.nodes[p].rsib[s], w);
      }
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

      hpos = this.nodes[p].hpos;
      rp = getRootNode(p);
      hpos2 = this.nodes[rp].hpos;

      if (this.nodes[p].contype === "u" && this.nodes[p].parent !== "") {
        q = this.nodes[p].parentix;
        for (s = this.nodes[q].usib.length - 1; s >= 0; s--) {
          hShiftTree(this.nodes[q].usib[s], w);
          if (this.nodes[q].usib[s] === p) {
            break;
          }
        }
      } else {
        hShiftTree(p, w);
      }

      if (this.nodes[p].contype === "u") {
        for (i = 0; i < this.nodes.length; i++) {
          if (i !== rp && this.nodes[i].parent === "" && this.nodes[i].hpos > hpos2) {
            hShiftTree(i, w);
          }
        }
      }
    };

    fillParentix = () => {
      // Fill all nodes with the index of the parent.
      let i;

      let j;
      for (i = 0; i < this.nodes.length; i++) {
        if (this.nodes[i].parent !== "") {
          for (j = 0; j < this.nodes.length; j++) {
            if (this.nodes[i].parent === this.nodes[j].id) {
              this.nodes[i].parentix = j;
              break;
            }
          }
          if (this.nodes[i].parentix === -1) {
            this.nodes[i].parent = "";
          }
        }
      }
    };

    checkLines = () => {
      // Check all vertical lines for crossing boxes. If so, shift to the right.
      let p;

      for (p = 0; p < this.nodes.length; p++) {
        if (this.nodes[p].parent === "") {
          checkLinesRec(p);
        }
      }
    };

    checkLinesRec = (p) => {
      let s;
      const t = null;
      let r;
      let x;
      const l = null;
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
      const hdl = null;
      const vdl = null;

      y = 0;

      // Check lsib, the latest is the lowest point:
      n = this.nodes[p].lsib.length;
      if (n > 0) {
        s = this.nodes[p].lsib[n - 1];
        y = this.nodes[s].vpos + this.boxHeight / 2;
      }

      // Check rsib, the latest is the lowest point:
      n = this.nodes[p].rsib.length;
      if (n > 0) {
        s = this.nodes[p].rsib[n - 1];
        y2 = this.nodes[s].vpos + this.boxHeight / 2;
        y = Math.max(y, y2);
      }

      // If usib, the lowest point is even lower:
      n = this.nodes[p].usib.length;
      if (n > 0) {
        s = this.nodes[p].usib[0];
        y = this.nodes[s].vpos - this.vSpace / 2;
      }

      if (y > 0) {
        for (
          n = this.nodes[p].vpos + this.boxHeight / 2 + this.boxHeight + this.vSpace;
          n <= y;
          n += this.boxHeight + this.vSpace
        ) {
          m = 0;
          do {
            s = getNodeAt(
              this.nodes[p].hpos + this.boxWidth / 2 - this.minDistBetweenLineAndBox,
              n
            );
            if (s >= 0) {
              // If the node found is a sib of the box with the downline, shifting the parent doesn't help:
              w =
                this.nodes[s].hpos +
                this.boxWidth +
                this.hSpace / 2 -
                (this.nodes[p].hpos + this.boxWidth / 2);
              rp = s;
              i = 0;
              while (this.nodes[rp].parent !== "" && rp !== p) {
                rp = this.nodes[rp].parentix;
              }
              if (rp !== p) {
                // Find the parent of s on the same vpos as p to decide what to shift:
                rs = s;
                while (
                  this.nodes[rs].parent !== "" &&
                  this.nodes[rs].vpos > this.nodes[p].vpos
                ) {
                  rs = this.nodes[rs].parentix;
                }
                rp = p;
                while (this.nodes[rp].parent !== "" && this.nodes[rp].contype !== "u") {
                  rp = this.nodes[rp].parentix;
                }
                if (this.nodes[rs].hpos > this.nodes[p].hpos) {
                  // w =  nodes[p].hpos + boxWidth / 2 + hSpace - nodes[s].hpos;
                  hShiftTreeAndRBrothers(rs, w);
                } else {
                  hShiftTreeAndRBrothers(rp, w);
                }
              } else {

                branch = this.nodes[s].contype;
                tm = s;
                while (this.nodes[tm].parentix !== "" && this.nodes[tm].parentix !== p) {
                  tm = this.nodes[tm].parentix;
                }
                branch = this.nodes[tm].contype;

                rs = getRootNode(s);
                rp = getRootNode(p);
                if (rs === rp) {
                  if (branch === "l") {
                    w =
                      this.nodes[s].hpos +
                      this.boxWidth +
                      this.hSpace / 2 -
                      (this.nodes[p].hpos + this.boxWidth / 2);
                    while (
                      this.nodes[p].parentix !== "" &&
                      this.nodes[p].contype !== "u"
                    ) {
                      p = this.nodes[p].parentix;
                    }
                    hShiftTreeAndRBrothers(p, w);
                    hShiftTree(tm, -w);
                    // Move rsibs back to the left as far as possible
                    v = getEndOfDownline(p);
                    for (r = 0; r < this.nodes[p].rsib.length; r++) {
                      if (this.nodes[this.nodes[p].rsib[r]].hpos >= 0) {
                        x = findLeftMost(this.nodes[p].rsib[r], v);
                        // If the leftmost is the r-sib itself, use the default hShift distance.
                        // Use this.hSpace otherwise, it look better.
                        if (x === this.nodes[p].rsib[r].hpos) {
                          w = this.nodes[p].hpos + this.boxWidth / 2 + this.hShift - x;
                        } else {
                          w = this.nodes[p].hpos + this.boxWidth / 2 + this.hSpace / 2 - x;
                        }

                        if (w) {
                          hShiftTree(this.nodes[p].rsib[r], w);
                        }
                      }
                    }
                  } else {
                    w = this.nodes[p].hpos + this.boxWidth / 2 - this.nodes[s].hpos + this.hSpace;
                    hShiftTreeAndRBrothers(tm, w);
                  }
                } else {
                  if (this.nodes[rp].hpos > this.nodes[rs].hpos) {
                    hShiftTree(rp, w);
                  } else {
                    hShiftTree(rs, w);
                  }
                }
              }
            }
            m++;
          } while (s >= 0 && m < this.maxLoop);
        }
      }

      // Check the siblings:
      for (s = 0; s < this.nodes[p].usib.length; s++) {
        checkLinesRec(this.nodes[p].usib[s]);
      }
      for (s = 0; s < this.nodes[p].lsib.length; s++) {
        checkLinesRec(this.nodes[p].lsib[s]);
      }
      for (s = 0; s < this.nodes[p].rsib.length; s++) {
        checkLinesRec(this.nodes[p].rsib[s]);
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

      // Boxes direct on top of another box?
      m = 0;
      retry = 1;
      while (m < this.maxLoop && retry) {
        retry = 0;
        m++;
        for (i = 0; i < this.nodes.length; i++) {
          for (j = i + 1; j < this.nodes.length; j++) {
            if (
              this.nodes[i].hpos === this.nodes[j].hpos &&
              this.nodes[i].vpos === this.nodes[j].vpos
            ) {
              ui = getRootNode(i);
              uj = getRootNode(j);
              if (ui !== uj) {
                hShiftTreeAndRBrothers(uj, this.boxWidth + this.hSpace);
              } else {
                ui = getUParent(i);
                uj = getUParent(j);
                if (ui !== uj) {
                  hShiftTreeAndRBrothers(uj, this.boxWidth + this.hSpace);
                } else {
                  // In the right subtree, find the first 'u' or 'r' parent to shift.
                  uj = j;
                  while (
                    this.nodes[uj].parent !== "" &&
                    this.nodes[uj].contype !== "u" &&
                    this.nodes[uj].contype !== "r"
                  ) {
                    uj = this.nodes[uj].parentix;
                  }
                  if (this.nodes[uj].parent !== "") {
                    hShiftTreeAndRBrothers(uj, this.boxWidth + this.hSpace);
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
      while (m < this.maxLoop && retry) {
        retry = 0;
        m++;
        for (i = 0; i < this.nodes.length; i++) {
          j = getNodeAtUnequal(
            this.nodes[i].hpos + this.minDistBetweenLineAndBox,
            this.nodes[i].vpos + this.boxHeight / 2,
            i
          );
          if (j >= 0) {
            ui = getUParent(i);
            uj = getUParent(j);
            if (ui !== uj) {
              if (this.nodes[ui].hpos > this.nodes[uj].hpos) {
                uj = ui;
              }
              if (this.nodes[i].hpos > this.nodes[j].hpos) {
                w = this.nodes[j].hpos - this.nodes[i].hpos + this.boxWidth + this.hSpace;
              } else {
                w = this.nodes[i].hpos - this.nodes[j].hpos + this.boxWidth + this.hSpace;
              }
              if (nodeUnderParent(i, ui) && nodeUnderParent(j, ui)) {
                j = i;
                while (j >= 0 && this.nodes[j].contype === this.nodes[i].contype) {
                  j = this.nodes[j].parentix;
                }
                if (j >= 0) {
                  hShiftTreeAndRBrothers(j, w);
                }
              } else {
                while (
                  this.nodes[ui].parent !== "" &&
                  this.nodes[ui].contype === "u" &&
                  this.nodes[this.nodes[ui].parentix].usib.length === 1
                ) {
                  ui = this.nodes[ui].parentix;
                }
                hShiftTreeAndRBrothers(ui, w);
              }
              retry = 1;
            } else {
              hShiftTreeAndRBrothers(i, this.boxWidth / 2);
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

      for (i = 0; i < this.nodes.length; i++) {
        p = this.nodes[i].parentix;
        if (p >= 0) {
          if (this.nodes[i].contype === "u") {
            h = this.nodes[p].usib.length;
            this.nodes[p].usib[h] = i;
          }
          if (this.nodes[i].contype === "l") {
            v = this.nodes[p].lsib.length;
            this.nodes[p].lsib[v] = i;
          }
          if (this.nodes[i].contype === "r") {
            v = this.nodes[p].rsib.length;
            this.nodes[p].rsib[v] = i;
          }
        }
      }
    };

    positionBoxes = () => {
      let i;
      let x;

      // Position all top level boxes:
      // The starting pos is 'x'. After the tree is positioned, center it.
      x = 0;
      for (i = 0; i < this.nodes.length; i++) {
        if (this.nodes[i].parent === "") {
          this.nodes[i].hpos = x;
          this.nodes[i].vpos = 0;
          positionTree(i, x, x);
          // hpos can be changed during positionTree:
          x = findRightMost(i) + this.boxWidth + this.hSpace; // Start for next tree
        }
      }
    };

    positionTree = (p) => {
      // Position the complete tree under this parent.
      let h;

      let v;
      let s;
      let o;
      let i;
      let n;
      let w;
      let q;
      let r;
      let us;
      let uo;
      let x;
      const maxx = null;
      const minx = null;
      const max2 = null;
      let x1;
      let x2;
      let y;
      const hdl = null;
      const vdl = null;
      let l;
      const t = null;

      // p has a position already. Position 'l', 'r' and 'u' sibs:

      // Positioning all 'l' sibs:
      for (v = 0; v < this.nodes[p].lsib.length; v++) {
        s = this.nodes[p].lsib[v];

        // New lsib, so the downline crosses all the way down. Make room first:
        y = getLowestBox(p, "l") + this.boxHeight + this.vSpace;
        makeRoomForDownline(p, y);

        this.nodes[s].hpos = this.nodes[p].hpos - this.boxWidth / 2 - this.hShift;
        this.nodes[s].vpos = y;
        if (this.nodes[s].hpos < 0) {
          for (r = 0; r < this.nodes.length; r++) {
            if (this.nodes[r].parent === "") {
              hShiftTree(r, -this.nodes[s].hpos);
            }
          }
          this.nodes[s].hpos = 0;
        }

        // Overlap?
        n = 1;
        do {
          o = getNodeAtUnequal(
            this.nodes[s].hpos - this.minDistBetweenLineAndBox,
            this.nodes[s].vpos + this.minDistBetweenLineAndBox,
            s
          );
          if (o < 0) {
            o = getNodeAtUnequal(
              this.nodes[s].hpos + this.boxWidth + this.minDistBetweenLineAndBox,
              this.nodes[s].vpos + this.minDistBetweenLineAndBox,
              s
            );
          }
          if (o < 0) {
            o = findNodeOnLine(this.nodes[s].vpos, 999999, "l");
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
            w = this.nodes[o].hpos + this.boxWidth + this.hSpace - this.nodes[s].hpos;
            q = this.nodes[s].parentix;
            while (q !== -1 && this.nodes[q].contype !== "u") {
              q = this.nodes[q].parentix;
            }
            if (q < 0) {
              hShiftTree(p, w);
            } else {
              if (!nodeUnderParent(o, q)) {
                hShiftTreeAndRBrothers(q, w); // ! 2*w, dd 2013-10-21
              }
            }
          }
          n++;
          if (n > this.maxLoop) {
            o = -1;
          }
        } while (o >= 0);
        positionTree(s);
      }

      // Positioning all rsibs:
      for (v = 0; v < this.nodes[p].rsib.length; v++) {
        s = this.nodes[p].rsib[v];

        // Default placement: right from the parent and right from all other this.nodes in this row:
        this.nodes[s].vpos = getLowestBox(p, "r") + this.boxHeight + this.vSpace;
        x1 = findRightMostAtVpos(this.nodes[s].vpos);
        if (x1 > 0) {
          x1 = x1 + this.boxWidth + this.hSpace;
        }
        x2 = this.nodes[p].hpos + this.boxWidth / 2 + this.hShift;
        this.nodes[s].hpos = Math.max(x1, x2);

        // Overlap?
        n = 1;
        do {
          o = getNodeAtUnequal(
            this.nodes[s].hpos - this.minDistBetweenLineAndBox,
            this.nodes[s].vpos + this.minDistBetweenLineAndBox,
            s
          );
          if (o < 0) {
            o = getNodeAtUnequal(
              this.nodes[s].hpos + this.boxWidth + this.minDistBetweenLineAndBox,
              this.nodes[s].vpos + this.minDistBetweenLineAndBox,
              s
            );
          }
          if (o < 0) {
            o = findNodeOnLine(this.nodes[s].vpos, 999999, "l");
            if (o === s) {
              o = -1;
            }
          }
          if (o >= 0) {
            h = this.nodes[s].hpos - this.nodes[o].hpos;
            h = Math.abs(h);
            q = this.nodes[s].parentix;
            while (q !== -1 && this.nodes[q].contype !== "u") {
              q = this.nodes[q].parentix;
            }
            if (q < 0) {
              hShiftTree(p, this.boxWidth + this.hSpace - h);
            } else {
              us = getUParent(s);
              uo = getUParent(o);
              if (us === uo) {
                if (!nodeUnderParent(o, q)) {
                  hShiftTreeAndRBrothers(q, this.boxWidth + this.hSpace - h);
                }
              } else {
                // Shift the common parent (if any) to the right, and the uppermost
                // parent of the existing o node back to the left:
                us = getRootNode(s);
                uo = getRootNode(o);
                w = this.nodes[o].hpos - this.nodes[s].hpos + this.boxWidth + this.hSpace;
                if (us === uo) {
                  us = s;
                  while (
                    this.nodes[us].parent !== "" &&
                    !nodeUnderParent(o, this.nodes[us].parentix)
                  ) {
                    us = this.nodes[us].parentix;
                  }
                  hShiftTreeAndRBrothers(us, w);
                } else {
                  hShiftTreeAndRBrothers(s, w);
                }
              }
            }
          }
          n++;
          if (n > this.maxLoop) {
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
      v = getLowestBox(p, "lr") + this.boxHeight + this.vSpace;
      n = this.nodes[p].usib.length;

      if (n > 0) {
        // If there is a left or right subtree, the starting position is on the right, the left or in between them:
        for (i = 0; i < this.nodes[p].lsib.length; i++) {
          x = findRightMost(this.nodes[p].lsib[i], v);
          if (this.nodes[p].rsib.length > 0) {
            w = x + this.hSpace / 2 - this.boxWidth / 2 - this.nodes[p].hpos;
          } else {
            w = x + this.hShift / 2 - this.boxWidth / 2 - this.nodes[p].hpos;
          }
          if (w > 0) {
            this.nodes[p].hpos += w;
            for (l = 0; l < i; l++) {
              hShiftTree(this.nodes[p].lsib[l], w);
            }
          }
        }

        // If right trees, shift the to the right of the (repositioned) root node:
        for (i = 0; i < this.nodes[p].rsib.length; i++) {
          x = findLeftMost(this.nodes[p].rsib[i], v);
          // If the node found is the lsib itself, use this.hShift. Otherwise use hSpace/2, it looks better.
          if (x === this.nodes[this.nodes[p].rsib[i]].hpos) {
            w = this.nodes[p].hpos + this.boxWidth / 2 + this.hShift - x;
          } else {
            w = this.nodes[p].hpos + this.boxWidth / 2 + this.hSpace / 2 - x;
          }
          if (w) {
            hShiftTree(this.nodes[p].rsib[i], w);
            x += w;
          }
        }

        // If there are multiple usib nodes, try to place them under the left tree, centering under the parent:
        x1 = this.nodes[p].hpos;
        x2 = this.nodes[p].hpos;
        if (n >= 2 && x1 > 0) {
          // Check all node on this vpos to overlap.
          // Maybe we overlap a downline, this will be caught later on.
          h = findNodeOnLine(v, this.nodes[p].hpos, "l");
          if (h < 0) {
            x2 = x2 + this.boxWidth / 2 - (n * this.boxWidth + (n - 1) * this.hSpace) / 2;
            if (x2 < 0) {
              x2 = 0;
            }
            x1 = x2;
          }
          if (h >= 0 && this.nodes[h].hpos + this.boxWidth + this.hSpace < x1) {
            x1 = this.nodes[h].hpos + this.boxWidth + this.hSpace; // minimum x
            x2 = x2 + this.boxWidth / 2 - (n * this.boxWidth + (n - 1) * this.hSpace) / 2; // wanted
            if (x1 > x2) {
              x2 = x1;
            } else {
              x1 = x2;
            }
          }
        }

        for (h = 0; h < this.nodes[p].usib.length; h++) {
          s = this.nodes[p].usib[h];
          this.nodes[s].hpos = x2;
          this.nodes[s].vpos = getLowestBox(p, "lr") + this.boxHeight + this.vSpace;
          v = underVSib(s);
          // Overlap?
          n = 0;
          do {
            o = getNodeAtUnequal(
              this.nodes[s].hpos - this.minDistBetweenLineAndBox,
              this.nodes[s].vpos + this.minDistBetweenLineAndBox,
              s
            );
            if (o < 0) {
              o = getNodeAtUnequal(
                this.nodes[s].hpos + this.boxWidth + this.minDistBetweenLineAndBox,
                this.nodes[s].vpos + this.minDistBetweenLineAndBox,
                s
              );
            }
            if (o < 0) {
              o = findNodeOnLine(this.nodes[s].vpos, 999999, "l");
              if (o === s) {
                o = -1;
              }
            }
            if (o >= 0) {
              w = this.nodes[o].hpos - this.nodes[s].hpos + this.boxWidth + this.hSpace;
              // Find the highest node, not in the path of the found 'o' node:
              us = s;
              while (
                this.nodes[us].parent !== "" &&
                !nodeUnderParent(o, this.nodes[us].parentix)
              ) {
                us = this.nodes[us].parentix;
              }

              hShiftTreeAndRBrothers(us, w);
            }
            n++;
            if (n > this.maxLoop) {
              o = -1;
            }
          } while (o >= 0);
          positionTree(s);
          x2 = this.nodes[s].hpos + this.boxWidth + this.hSpace;
        }
      }

      reposParentsRec(p);
    };

    reposParents = () => {
      // All parents with usibs are repositioned (start at the lowest level!)
      let i;

      for (i = 0; i < this.nodes.length; i++) {
        if (this.nodes[i].parentix === -1) {
          reposParentsRec(i);
        }
      }
    };

    reposParentsRec = (p) => {
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

      d = debug;
      debug = 0;

      hpos = this.nodes[p].hpos;

      // The sibslings first:
      for (s = 0; s < this.nodes[p].usib.length; s++) {
        reposParentsRec(this.nodes[p].usib[s]);
      }
      for (s = 0; s < this.nodes[p].lsib.length; s++) {
        reposParentsRec(this.nodes[p].lsib[s]);
      }
      for (s = 0; s < this.nodes[p].rsib.length; s++) {
        reposParentsRec(this.nodes[p].rsib[s]);
      }

      // If this is a parent with two or more usibs, reposition it:
      // (Repos over 1 u sib too, just correct it if necessary)
      // Except if this is a sib, without room to move, limit the room to move.
      // Of course a r-sib of this sib can cause an overlap too.
      // Exception: if this is a node with only one usub, we need to position right above
      // the usib. If necessary, we need to move the complete parent tree.
      h = this.nodes[p].usib.length;
      if (h >= 1) {

        maxw = -1;
        minw = -1;
        if (this.nodes[p].contype === "l") {
          r = this.nodes[p].parentix;
          maxw =
            this.nodes[r].hpos + this.boxWidth / 2 - this.boxWidth - this.hSpace - this.nodes[p].hpos;
        }
        if (this.nodes[p].contype === "r") {
          r = this.nodes[p].parentix;
          minw =
            this.nodes[r].hpos + this.boxWidth / 2 - this.hSpace - this.boxWidth - this.nodes[p].hpos;
        }
        w = 0;
        if (this.centerParentOverCompleteTree) {
          w = (findRightMost(p) - this.nodes[p].hpos) / 2;
        } else {
          f = this.nodes[p].usib[0];
          s = this.nodes[p].usib[h - 1];
          w =
            this.nodes[f].hpos + (this.nodes[s].hpos - this.nodes[f].hpos) / 2 - this.nodes[p].hpos;
        }
        if (maxw >= 0 && w > maxw) {
          w = maxw;
        }
        if (minw >= 0 && w > minw) {
          w = minw;
        }
        s = findNodeOnLine(this.nodes[p].vpos, this.nodes[p].hpos, "r");
        if (s >= 0) {
          if (this.nodes[p].hpos + this.boxWidth + this.hSpace + w >= this.nodes[s].hpos) {
            w = this.nodes[s].hpos - this.boxWidth - this.hSpace - this.nodes[p].hpos;
          }
        }
        if (
          this.nodes[p].usib.length === 1 &&
          this.nodes[p].hpos + w !== this.nodes[this.nodes[p].usib[0]].hpos
        ) {
          w = this.nodes[this.nodes[p].usib[0]].hpos - this.nodes[p].hpos;
        }
        // Check for a crossing with a rsib connection line:
        maxw = 999999;
        for (q = 0; q < this.nodes.length; q++) {
          if (
            this.nodes[q].vpos === this.nodes[p].vpos &&
            this.nodes[q].hpos > this.nodes[p].hpos
          ) {
            maxw = this.nodes[q].hpos - this.nodes[p].hpos - this.boxWidth - this.hShift - this.hSpace;
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
          this.nodes[p].hpos += w;
          for (s = 0; s < this.nodes[p].lsib.length; s++) {
            hShiftTree(this.nodes[p].lsib[s], w);
          }
          for (s = 0; s < this.nodes[p].rsib.length; s++) {
            hShiftTree(this.nodes[p].rsib[s], w);
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

      if (this.nodes[p].vpos <= maxv) {
        maxx = this.nodes[p].hpos;
      } else {
        maxx = -1;
      }

      // usib to the right?
      for (i = 0; i < this.nodes[p].usib.length; i++) {
        x = findRightMost(this.nodes[p].usib[i], maxv);
        maxx = Math.max(x, maxx);
      }

      // Walk along the lsibs:
      for (i = 0; i < this.nodes[p].lsib.length; i++) {
        x = findRightMost(this.nodes[p].lsib[i], maxv);
        maxx = Math.max(x, maxx);
      }

      // Walk along the rsibs:
      for (i = 0; i < this.nodes[p].rsib.length; i++) {
        x = findRightMost(this.nodes[p].rsib[i], maxv);
        maxx = Math.max(x, maxx);
      }

      return maxx;
    };

    findRightMostAtVpos = (v) => {
      // return the highest hpos of any this.nodes at vpos 'v'
      let maxx;

      let i;

      maxx = -1;

      for (i = 0; i < this.nodes.length; i++) {
        if (this.nodes[i].vpos === v && this.nodes[i].hpos > maxx) {
          maxx = this.nodes[i].hpos;
        }
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

      if (this.nodes[p].vpos <= maxv) {
        minx = this.nodes[p].hpos;
      } else {
        minx = 999999;
      }

      // usib to the left?
      if (this.nodes[p].usib.length > 0) {
        x = findLeftMost(this.nodes[p].usib[0], maxv);
        minx = Math.min(x, minx);
      }

      // Walk along the lsibs:
      for (i = 0; i < this.nodes[p].lsib.length; i++) {
        x = findLeftMost(this.nodes[p].lsib[i], maxv);
        minx = Math.min(x, minx);
      }

      // Walk along the rsibs:
      for (i = 0; i < this.nodes[p].rsib.length; i++) {
        x = findLeftMost(this.nodes[p].rsib[i], maxv);
        minx = Math.min(x, minx);
      }

      return minx;
    };

    findNodeOnLine = (v, h, dir) => {
      // Search all this.nodes on vpos 'v', and return the rightmost node on the left, or the leftmost on the rest,
      // depending on the direction.
      let i;

      let fnd;
      let x;

      fnd = -1;
      x = dir === "l" ? -1 : 999999;

      for (i = 0; i < this.nodes.length; i++) {
        if (this.nodes[i].vpos === v) {
          if (dir === "l" && this.nodes[i].hpos < h && this.nodes[i].hpos > x) {
            fnd = i;
            x = this.nodes[i].hpos;
          }
          if (dir === "r" && this.nodes[i].hpos > h && this.nodes[i].hpos < x) {
            fnd = i;
            x = this.nodes[i].hpos;
          }
        }
      }

      return fnd;
    };

    this.drawImageNodes = () => {
      // Images are loaded after drawing finished.
      // After an image has been loaded, this function will be called, which redraws the this.nodes
      // with images this.nodes, have a valid image now and are drawn incomplete before.
      let i;

      let ctx;

      ctx = theCanvas.getContext("2d");

      for (i = 0; i < this.nodes.length; i++) {
        if (this.nodes[i].img && this.nodes[i].img.width > 0 && !this.nodes[i].imgDrawn) {
          drawNode(ctx, i);
        }
      }
    };

    drawNode = (ctx, i) => {
      let ix;
      let maxrad;
      let imgrad;
      let x = this.nodes[i].hpos;
      let y = this.nodes[i].vpos;
      let width = this.boxWidth;
      let height = this.boxHeight;
      let txt = this.nodes[i].txt;
      const bold = this.nodes[i].bold;
      const blcolor = this.nodes[i].linecolor;
      const bfcolor = this.nodes[i].fillcolor;
      const tcolor = this.nodes[i].textcolor;
      let font = this.nodes[i].textfont;
      const fsize = this.nodes[i].textsize;
      const valign = this.nodes[i].valign;
      const img = this.nodes[i].img;
      const imgalign = this.nodes[i].imgAlign;
      const imgvalign = this.nodes[i].imgVAlign;
      const toprad = this.nodes[i].topradius;
      const botrad = this.nodes[i].botradius;
      // Draw the box:
      ctx.lineWidth = bold ? 2 : 1;
      ctx.fillStyle = bfcolor;
      ctx.strokeStyle = blcolor;
      ctx.beginPath();
      ctx.moveTo(x + toprad, y);
      ctx.lineTo(x + width - toprad, y);
      if (toprad > 0) {
        ctx.quadraticCurveTo(x + width, y, x + width, y + toprad);
      }
      ctx.lineTo(x + width, y + height - botrad);
      if (botrad > 0) {
        ctx.quadraticCurveTo(
          x + width,
          y + height,
          x + width - botrad,
          y + height
        );
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
        } else {
          imgrad = 0.414 * (toprad + botrad);
          if (imgrad < 1) {
            imgrad = 1;
          }

          if (width > height) {
            maxy = height - 2 * imgrad;
          } else {
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
          this.nodes[i].imgDrawn = 1;
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
          this.nodes[i].imgDrawn = 0;
        }

        // Adjust the box size, so the text will be placed next to the image:
        // Find the biggest rectangle for the text:
        if (imgalign === "l") {
          if (imgvalign === "t") {
            if ((width - maxx) * height > width * (height - maxy)) {
              x += xPic + maxx;
              width -= xPic + maxx;
            } else {
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
            } else {
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
            } else {
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
            } else {
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
            } else {
              height -= yPic + maxy;
            }
          }
        }
      }

      // Draw text, break the string on spaces, and \n sequences:
      // Note: excanvas does not clip text. We need to do it ourselves.
      // ctx.save();
      // ctx.clip(); will clip on "image-not-found" now

      const tlines = []; // Split text in multiple lines if it doesn't fit
      let n = 0;
      let t1;
      let nl;
      txt = cleanText(txt);
      while (txt.length > 0 && n < this.maxLoop) {
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
        } else {
          txt = "";
        }
      }

      // IE does not clip text, so we clip it here:
      if (fsize * n > height) {
        n = Math.floor(height / fsize);
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

      let yp = 0;
      if (valign) {
        yp = Math.floor((height - n * fsize) / 2);
      }
      for (ix = 0; ix < n; ix++) {
        while (
          tlines[ix].length > 0 &&
          ctx.measureText(tlines[ix]).width > width
        ) {
          tlines[ix] = tlines[ix].substr(0, tlines[ix].length - 1);
        }
        ctx.fillText(tlines[ix], x + width / 2, y + yp);
        yp += parseInt(fsize, 10);
      }

      // ctx.restore();
    };

    drawConLines = (ctx) => {
      // Draw all connection lines.
      // We cannot simply draw all lines, over and over again, as the color will change.
      // Therefore we draw all lines separat, and only once.
      let i;

      let f;
      let l;
      const r = null;
      let v;

      ctx.strokeStyle = this.lineColor;
      ctx.beginPath();
      for (i = 0; i < this.nodes.length; i++) {
        // Top and left lines of siblings
        if (this.nodes[i].parentix >= 0) {
          if (this.nodes[i].contype === "u") {
            // Line from top of hanging node to bridging line
            ctx.moveTo(this.nodes[i].hpos + this.boxWidth / 2, this.nodes[i].vpos);
            ctx.lineTo(
              this.nodes[this.nodes[i].parentix].hpos + this.boxWidth / 2,
              this.nodes[this.nodes[i].parentix].vpos + this.boxHeight
            );
          }
          if (this.nodes[i].contype === "l") {
            ctx.moveTo(this.nodes[i].hpos + this.boxWidth, this.nodes[i].vpos + this.boxHeight / 2);
            ctx.lineTo(
              this.nodes[this.nodes[i].parentix].hpos + this.boxWidth / 2,
              this.nodes[i].vpos + this.boxHeight / 2
            );
          }
          if (this.nodes[i].contype === "r") {
            ctx.moveTo(this.nodes[i].hpos, this.nodes[i].vpos + this.boxHeight / 2);
            ctx.lineTo(
              this.nodes[this.nodes[i].parentix].hpos + this.boxWidth / 2,
              this.nodes[i].vpos + this.boxHeight / 2
            );
          }
        }

        // // Downline if any siblings:
        // v = getEndOfDownline(i);
        // if (v >= 0) {
        //   // Create the line from a parent down to the bridging line
        //   ctx.moveTo(this.nodes[i].hpos + this.boxWidth / 2, this.nodes[i].vpos + this.boxHeight);
        //   ctx.lineTo(this.nodes[i].hpos + this.boxWidth / 2, v);
        // }

        // // Horizontal line above multiple 'u' sibs (bridging line)
        // if (this.nodes[i].usib.length > 1) {
        //   f = this.nodes[i].usib[0];
        //   l = this.nodes[i].usib[this.nodes[i].usib.length - 1];

        //   ctx.moveTo(this.nodes[f].hpos + this.boxWidth / 2, this.nodes[f].vpos - this.vSpace / 2);
        //   ctx.lineTo(this.nodes[l].hpos + this.boxWidth / 2, this.nodes[f].vpos - this.vSpace / 2);
        // }
        // // Horizontal line above a single 'u' sib, if not aligned:
        // if (this.nodes[i].usib.length === 1) {
        //   f = this.nodes[i].usib[0];

        //   ctx.moveTo(this.nodes[f].hpos + this.boxWidth / 2, this.nodes[f].vpos - this.vSpace / 2);
        //   ctx.lineTo(this.nodes[i].hpos + this.boxWidth / 2, this.nodes[f].vpos - this.vSpace / 2);
        // }
      }
      ctx.stroke();
    };

    getEndOfDownline = (p) => {
      let f;
      let l;
      let r;

      // if this node has u-sibs, the endpoint can be found from the vpos of the first u-sib:
      if (this.nodes[p].usib.length > 0) {
        f = this.nodes[p].usib[0];
        return this.nodes[f].vpos - this.vSpace / 2;
      }

      // Find the lowest 'l' or 'r' sib:
      l = this.nodes[p].lsib.length;
      r = this.nodes[p].rsib.length;
      f = -1;
      if (l > 0 && r === 0) {
        f = this.nodes[p].lsib[l - 1];
      }
      if (l === 0 && r > 0) {
        f = this.nodes[p].rsib[r - 1];
      }
      if (l > 0 && r > 0) {
        l = this.nodes[p].lsib[l - 1];
        r = this.nodes[p].rsib[r - 1];
        if (this.nodes[l].vpos > this.nodes[r].vpos) {
          f = l;
        } else {
          f = r;
        }
      }

      if (f >= 0) {
        return this.nodes[f].vpos + this.boxHeight / 2;
      }

      return -1;
    };

    getNodeAt = (x, y) => {
      let i;
      let x2;
      let y2;

      x2 = x - this.boxWidth;
      y2 = y - this.boxHeight;

      for (i = 0; i < this.nodes.length; i++) {
        if (
          x > this.nodes[i].hpos &&
          x2 < this.nodes[i].hpos &&
          y > this.nodes[i].vpos &&
          y2 < this.nodes[i].vpos
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

      x2 = x - this.boxWidth;
      y2 = y - this.boxHeight;

      for (i = 0; i < this.nodes.length; i++) {
        if (
          i !== u &&
          x > this.nodes[i].hpos &&
          x2 < this.nodes[i].hpos &&
          y > this.nodes[i].vpos &&
          y2 < this.nodes[i].vpos
        ) {
          return i;
        }
      }
      return -1;
    };

    underVSib = (n) => {
      // Walk along the parents. If one is a lsib or rsib, return the index.
      while (n >= 0) {
        if (this.nodes[n].contype === "l") {
          return n;
        }
        if (this.nodes[n].contype === "r") {
          return n;
        }
        n = this.nodes[n].parentix;
      }
      return -1;
    };

    cleanText = (tin) => {
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

    overlapBoxInTree = (p) => {
      // Check all this.nodes in this tree to overlap another box already placed:
      // Return the index, or -1
      let s;

      let r;
      let i;
      let x;
      let y;

      if (this.nodes[p].hpos < 0) {
        return -1;
      }

      for (s = 0; s < this.nodes[p].usib.length; s++) {
        r = overlapBoxInTree(this.nodes[p].usib[s]);
        if (r >= 0) {
          return r;
        }
      }

      for (s = 0; s < this.nodes[p].lsib.length; s++) {
        r = overlapBoxInTree(this.nodes[p].lsib[s]);
        if (r >= 0) {
          return r;
        }
      }

      for (s = 0; s < this.nodes[p].rsib.length; s++) {
        r = overlapBoxInTree(this.nodes[p].rsib[s]);
        if (r >= 0) {
          return r;
        }
      }

      for (i = 0; i < this.nodes.length; i++) {
        if (this.nodes[i].hpos >= 0 && i !== p) {
          x = this.nodes[p].hpos - this.minDistBetweenLineAndBox;
          y = this.nodes[p].vpos + this.minDistBetweenLineAndBox;
          if (
            x > this.nodes[i].hpos &&
            x < this.nodes[i].hpos + this.boxWidth &&
            y > this.nodes[i].vpos &&
            y < this.nodes[i].vpos + this.boxHeight
          ) {
            return i;
          }
          x = this.nodes[p].hpos + this.boxWidth + this.minDistBetweenLineAndBox;
          if (
            x > this.nodes[i].hpos &&
            x < this.nodes[i].hpos + this.boxWidth &&
            y > this.nodes[i].vpos &&
            y < this.nodes[i].vpos + this.boxHeight
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

      y = this.nodes[p].vpos;

      if (subtree.includes("u")) {
        for (s = 0; s < this.nodes[p].usib.length; s++) {
          r = getLowestBox(this.nodes[p].usib[s]);
          y = Math.max(r, y);
        }
      }

      if (subtree.includes("l")) {
        for (s = 0; s < this.nodes[p].lsib.length; s++) {
          r = getLowestBox(this.nodes[p].lsib[s]);
          y = Math.max(r, y);
        }
      }

      if (subtree.includes("r")) {
        for (s = 0; s < this.nodes[p].rsib.length; s++) {
          r = getLowestBox(this.nodes[p].rsib[s]);
          y = Math.max(r, y);
        }
      }

      return y;
    };

    getRootNode = (p) => {
      while (this.nodes[p].parent !== "") {
        p = this.nodes[p].parentix;
      }
      return p;
    };

    getUParent = (n) => {
      // Walk to the top of the tree, and return the first 'u' node found.
      // If none, return the root node.
      while (n >= 0) {
        if (this.nodes[n].contype === "u" || this.nodes[n].parent === "") {
          return n;
        }
        n = this.nodes[n].parentix;
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
        n = this.nodes[n].parentix;
      }
      return 0;
    };

    getAbsPosX = (obj) => {
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

    getAbsPosY = (obj) => {
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
      // We need to do this one by one for all lsibs, otherwise upper-l-this.nodes may be shifted too much to the left.
      let maxx;

      let h;
      let x;
      let w;
      const minx = null;
      let l;
      let r;

      if (v > 0) {

        // Check 'l' sibs first
        if (this.nodes[p].lsib.length > 0) {
          maxx = -1;
          for (h = 0; h < this.nodes[p].lsib.length; h++) {
            x = findRightMost(this.nodes[p].lsib[h], v);
            maxx = Math.max(x, maxx);
            if (maxx < 0) {
              maxx = 0;
            }
            // If the node found is the lsib itself, use this.hShift. Otherwise use hSpace/2, it looks better.
            if (x === this.nodes[this.nodes[p].lsib[h]].hpos) {
              w = maxx + this.boxWidth / 2 + this.hShift - this.nodes[p].hpos;
            } else {
              w = maxx + this.boxWidth / 2 + this.hSpace / 2 - this.nodes[p].hpos;
            }
            if (w > 0) {

              this.nodes[p].hpos += w;
              for (r = 0; r < this.nodes[p].rsib.length; r++) {
                hShiftTree(this.nodes[p].rsib[r], w);
              }

              for (l = 0; l < h; l++) {
                hShiftTree(this.nodes[p].lsib[l], w);
              }
            }
          }
        }

        // If right trees, shift them to the right of the (repositioned) root node:
        // Be carefull not to shift them back over other this.nodes, which can be if the parent has no u-sibs
        // (and thus the left tree can extend to the right:
        for (r = 0; r < this.nodes[p].rsib.length; r++) {
          x = findLeftMost(this.nodes[p].rsib[r], v);
          // If the node found is the rsib itself, use hShift. Otherwise use hSpace/2, it looks better.
          if (x === this.nodes[this.nodes[p].rsib[r]].hpos) {
            w = this.nodes[p].hpos + this.boxWidth / 2 + this.hShift - x;
          } else {
            w = this.nodes[p].hpos + this.boxWidth / 2 + this.hSpace / 2 - x;
          }
          if (w) {
            hShiftTree(this.nodes[p].rsib[r], w);
          }
        }
      }
    };

    centerOnCanvas = (width) => {
      let i;
      let max;
      let min;
      let w;

      // Find the left and rightmost this.nodes:
      max = -1;
      min = 999999;
      for (i = 0; i < this.nodes.length; i++) {
        if (this.nodes[i].hpos > max) {
          max = this.nodes[i].hpos;
        }
        if (this.nodes[i].hpos < min) {
          min = this.nodes[i].hpos;
        }
      }
      max += this.boxWidth;

      w = width / 2 - (max - min) / 2;
      for (i = 0; i < this.nodes.length; i++) {
        this.nodes[i].hpos += w;
      }
    };

    leftOnCanvas = (width) => {
      let i;
      let min;
      let w;

      // Find the leftmost node:
      min = 999999;
      for (i = 0; i < this.nodes.length; i++) {
        if (this.nodes[i].hpos < min) {
          min = this.nodes[i].hpos;
        }
      }

      w = min;
      if (w > 0) {
        for (i = 0; i < this.nodes.length; i++) {
          this.nodes[i].hpos -= w;
        }
      }
    };
  }

  //////////////////////
  // Public functions:
  //////////////////////

  public setDebug(value) {
    this.debug = value;
  }

  public setSize(w, h, hspace, vspace, hshift) {
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
  }

  public setNodeStyle(toprad, botrad) {
    if (toprad !== undefined && toprad >= 0) {
      this.curtopradius = toprad;
    }
    if (botrad !== undefined && botrad >= 0) {
      this.curbotradius = botrad;
    }
  }

  public setFont(fname, size, color, valign) {
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
  }

  public setColor(l, f, t, c) {
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
  }

  public addNode(
    id?,
    parent?,
    ctype?,
    text?,
    bold?,
    url?,
    linecolor?,
    fillcolor?,
    textcolor?,
    img?,
    imgalign?
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

    let i;
    for (i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i].id === id && this.noalerts !== 1) {
        alert(
          `Duplicate node.\nNode ${1 +
            this.nodes
              .length}, id = ${id}, '${text}'\nAlready defined as node ${i}, '${
            this.nodes[i].txt
          }'\n\nThis new node will not be added.\nNo additional messages are given.`
        );
        this.noalerts = 1;
        return;
      }
    }

    const n = new this.TreeNode(
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
      imgvalign,
      this.curtopradius,
      this.curbotradius,
      this.textFont,
      this.textSize,
      this.textVAlign
    );
    if (img !== undefined) {
      n.img = new Image();
      n.img.src = img;
      n.img.onload = () => {
        this.drawImageNodes();
      };
    }

    this.nodes[this.nodes.length] = n;
  }

  public drawChart = (id, align?, fit?) => {
    // siblings may be added. Reset all positions first:
    let i;
    for (i = 0; i < this.nodes.length; i++) {
      this.nodes[i].hpos = -1;
      this.nodes[i].vpos = -1;
      this.nodes[i].usib = [];
      this.nodes[i].rsib = [];
      this.nodes[i].lsib = [];
    }

    this.drawChartPriv(id, true, align, fit);
  }

  public redrawChart = (id) => {
    this.drawChartPriv(id, false);
  }
} // orgChart
