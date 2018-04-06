"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
/// <reference path="./index.d.ts" />
var React = require("react");
var uuid_1 = require("uuid");
var orgchart_1 = require("./orgchart");
var DecisionTree = /** @class */ (function (_super) {
    __extends(DecisionTree, _super);
    function DecisionTree(props) {
        var _this = _super.call(this, props) || this;
        _this.updateCanvas = function () {
            _this.state.chart.drawChart("canvas");
        };
        var _a = _this.props, rootNode = _a.rootNode, chartStyles = _a.chartStyles;
        var chart = new orgchart_1.OrgChart(chartStyles);
        var rootId = uuid_1.v4();
        chart.addNode(rootId, "", "u", rootNode.data.join("\n"));
        if (rootNode.subNodes) {
            rootNode.subNodes.map(function (subNode, subKey) {
                _this.subNodeRecursion(chart, uuid_1.v4(), subNode, rootId);
            });
        }
        _this.state = {
            chart: chart
        };
        return _this;
    }
    DecisionTree.prototype.componentDidMount = function () {
        this.updateCanvas();
    };
    DecisionTree.prototype.subNodeRecursion = function (chart, subKey, childNode, parentNode) {
        var _this = this;
        chart.addNode(subKey, parentNode, "u", childNode.data.join("\n"));
        if (childNode.subNodes) {
            childNode.subNodes.map(function (subNode, newKey) {
                _this.subNodeRecursion(chart, newKey, subNode, subKey);
            });
        }
    };
    DecisionTree.prototype.render = function () {
        return (React.createElement("canvas", { id: "canvas", width: this.props.width || "1000", height: this.props.height || "800" }));
    };
    return DecisionTree;
}(React.Component));
exports["default"] = DecisionTree;
