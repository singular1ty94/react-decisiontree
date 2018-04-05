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
    function DecisionTree(props) {
        var _this = _super.call(this, props) || this;
        _this.updateCanvas = function () {
            _this.state.drawChart(_this.refs.canvas);
        };
        var rootNode = _this.props.rootNode;
        var chart = new orgchart_1["default"]();
        chart.addNode(0, "", "u", rootNode.data.join("\n"));
        if (rootNode.subNodes) {
            rootNode.subNodes.map(function (subNode, subKey) {
                _this.subNodeRecursion(chart, subKey, subNode, 0);
            });
        }
        _this.setState({
            chart: chart
        });
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
        return (React.createElement("canvas", { ref: "canvas", id: "canvas", width: this.props.width || "800", height: this.props.height || "600" }));
    };
    return DecisionTree;
}(React.Component));
exports["default"] = DecisionTree;
