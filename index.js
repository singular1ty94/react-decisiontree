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
        var _a = this.props, width = _a.width, height = _a.height, id = _a.id, data = _a.data;
        var chart = new orgchart_1["default"]();
        data.map(function (node, key) {
            chart.addNode(key, "", "u", node.data.join("\n"));
            if (node.subNodes) {
                node.subNodes.map(function (subNode, subKey) {
                    _this.subNodeRecursion(chart, subKey, subNode, key);
                });
            }
        });
        return (React.createElement("canvas", { id: id || "decision-tree", width: width || "800", height: height || "600" }));
    };
    return DecisionTree;
}(React.Component));
