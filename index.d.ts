interface IOrgChart {
    lineColor?: string;
    boxLineColor?: string;
    boxFillColor?: string;
    textColor?: string;
    textFont?: string;
    boxWidth?: number;
    boxHeight?: number;
    hSpace?: number;
    vSpace?: number;
}

interface IDecisionTree {
    data: string[];
    subNodes?: IDecisionTree[];
}
  
interface IDecisionTreeProps {
    rootNode: IDecisionTree;
    height?: number;
    width?: number;
    chartStyles?: IOrgChart;
}