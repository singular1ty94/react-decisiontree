/// <reference path="./index.d.ts" />
import * as React from "react";
import { v4 } from "uuid";
import { OrgChart } from "./orgchart";

interface IDecisionTreeState {
  chart: OrgChart;
}

export default class DecisionTree extends React.Component<IDecisionTreeProps, IDecisionTreeState> {
  constructor(props) {
    super(props);
    const { rootNode, chartStyles } = this.props;
    const chart = new OrgChart(chartStyles);

    const rootId = v4();

    chart.addNode(rootId, "", "u", rootNode.data.join("\n"));
    if (rootNode.subNodes) {
      rootNode.subNodes.map((subNode: IDecisionTree, subKey: number) => {
        this.subNodeRecursion(chart, v4(), subNode, rootId);
      });
    }

    this.state = {
        chart
    };
  }

  public componentDidMount() {
     this.updateCanvas();
  }

  public updateCanvas = () => {
     this.state.chart.drawChart("canvas");
  }

  public subNodeRecursion(
    chart: OrgChart,
    subKey: number,
    childNode: IDecisionTree,
    parentNode: number
  ) {
    chart.addNode(subKey, parentNode, "u", childNode.data.join("\n"));
    if (childNode.subNodes) {
      childNode.subNodes.map((subNode: IDecisionTree, newKey: number) => {
        this.subNodeRecursion(chart, newKey, subNode, subKey);
      });
    }
  }

  public render() {
    return (
      <canvas
        id="canvas"
        width={this.props.width || "1000"}
        height={this.props.height || "800"}
      />
    );
  }
}
