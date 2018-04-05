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
var React = require("react");
var orgchart_1 = require("./orgchart");
var DecisionTree = /** @class */ (function (_super) {
    __extends(DecisionTree, _super);
    function DecisionTree() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
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
        var _this = this;
        var _a = this.props, width = _a.width, height = _a.height, id = _a.id, rootNode = _a.rootNode;
        var chart = new orgchart_1["default"]();
        chart.addNode(0, "", "u", rootNode.data.join("\n"));
        if (rootNode.subNodes) {
            rootNode.subNodes.map(function (subNode, subKey) {
                _this.subNodeRecursion(chart, subKey, subNode, 0);
            });
        }
        chart.drawChart("" + (id || "decision-tree"));
        return (React.createElement("canvas", { id: id || "decision-tree", width: width || "800", height: height || "600" }));
    };
    return DecisionTree;
}(React.Component));
exports["default"] = DecisionTree;
