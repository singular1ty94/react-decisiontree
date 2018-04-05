import * as React from "react";
import OrgChart from "./orgchart";

/**
 * Example usage:
   <DecisionTree 
        width={500}
        height={300}
        data={
            {
  data: [
    "petallength < 2.45",
    "entropy = 1.585",
    "samples = 150",
    "value = [50, 50, 50]",
    "class = Iris-setosa"
  ],
  subNodes : [{
    data: [
      "entropy = 0.0",
      "samples = 50",
      "value = [50, 0, 0]",
      "class = Iris-setosa"
    ]
  },{
    data: [
      "petalwidth < 1.75",
      "entropy = 1.0",
      "samples = 100",
      "value = [0, 50, 50]",
      "class = Iris-versicolor"
    ],
    subNodes : [{
        data: [
          "petallength < 4.95",
          "entropy = 0.445",
          "samples = 54",
          "value = [0, 49, 5]",
          "class = Iris-versicolor"
        ]
      }, {
        data: [
          "petallength < 4.85",
          "entropy = 0.151",
          "samples = 56",
          "value = [0, 1, 45]",
          "class = Iris-virginica"
        ]
      }]
  }]
}
        }
   />
   {
    data: [
      "petallength < 2.45",
      "entropy = 1.585",
      "samples = 150",
      "value = [50, 50, 50]",
      "class = Iris-setosa"
    ],
    subNodes: []
  }
 */

interface IDecisionTree {
  data: string[];
  subNodes?: IDecisionTree[];
}

export default class DecisionTree extends React.Component<any, any> {
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
    const { width, height, id, rootNode } = this.props;

    const chart = new OrgChart();


    chart.addNode(0, "", "u", rootNode.data.join("\n"));
    if (rootNode.subNodes) {
      rootNode.subNodes.map((subNode: IDecisionTree, subKey: number) => {
        this.subNodeRecursion(chart, subKey, subNode, 0);
      });
    }

    

    return (
      <div>
	      <canvas
		id={id || "decision-tree"}
		width={width || "800"}
		height={height || "600"}
	      />
	      {chart.drawChart(`${id || "decision-tree"}`)}
      </div>
    );
  }
}
