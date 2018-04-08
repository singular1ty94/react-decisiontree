# React Decision Tree

A decision tree implemented in React.

Based on the code by https://jvloenen.home.xs4all.nl/orgchart.

## Usage

```
import * as React from 'react';
import { DecisionTree } from 'react-decisiontree/dist';
```

The `IDecisionTree` interface is a recursive one that contains arrays with a `data` array of text
that will be joined together in the box, and an optional `subNodes` array of recursive `data/subNode` elements
that forms the body of the decision tree.

```
<DecisionTree
    chartStyles={
        {
            lineColor: "#1D78BC",
            boxFillColor: "#1D78BC",
            textColor: "#FFFFFF"
        }
    }
    rootNode={{
        data: ["petalWidth=9.8", "entropy=1.0", "class=Iris-vertosa"],
        subNodes: [
            {
                data: ["petalWidth=6.8", "entropy=0.7", "class=Iris-vertosa"],
            }, {
                data: ["petalWidth=5.8", "entropy=1.3", "class=Iris-versicolor"],
                subNodes: [
                    {
                        data: ["petalWidth=6.8", "entropy=0.7", "class=Iris-vertosa"],
                    }
                ]
            }
        ]
    }}
 />
```
