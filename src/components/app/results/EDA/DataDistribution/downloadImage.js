const { default: downloadSVG } = require("@/utils/downloadSVG");

const downloadImage = async (histComp, boxComp, omic) => {
    const histSVG = histComp.container.firstChild.cloneNode(true);
    const boxSVG = boxComp.firstChild.firstChild.firstChild//.cloneNode(true);

    const boxSVG1 = boxSVG.children[0].cloneNode(true);
    const boxSVG2 = boxSVG.children[2].cloneNode(true);


    // Create div with images
    const fullFig = window.document.createElement('div');
    fullFig.style.position = 'relative';

    const histDiv = window.document.createElement('div');
    histDiv.appendChild(histSVG);
    histDiv.style.paddingLeft = '20px'

    const box1Div = window.document.createElement('div');
    box1Div.appendChild(boxSVG1);

    const box2Div = window.document.createElement('div');
    box2Div.style.position = 'absolute';
    box2Div.style.top = "230px"
    box2Div.appendChild(boxSVG2);

    fullFig.appendChild(histDiv);
    fullFig.appendChild(box1Div);
    fullFig.appendChild(box2Div);
    //downloadSVG(fullFig, `DataDistribution_${omic}`);

    const densityDiv = window.document.createElement('div');
    densityDiv.appendChild(histDiv);
    console.log(densityDiv)

    const boxplotDiv = window.document.createElement('div');
    boxplotDiv.appendChild(box1Div)
  
    downloadSVG(densityDiv, `DensityPlot_${omic}`);
    downloadSVG(boxplotDiv, `BoxPlot_${omic}`);
}

module.exports = downloadImage;