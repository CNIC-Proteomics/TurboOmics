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

    // Get data URL with image
    let svgURL = new XMLSerializer().serializeToString(fullFig);
    let svgBlob = new Blob([svgURL], { type: "image/svg+xml;charset=utf-8" });
    var url = URL.createObjectURL(svgBlob);

    // Download the image
    const fakeLink = window.document.createElement('a');
    fakeLink.style = "display:none";
    fakeLink.download = `DataDistribution_${omic}`;
    fakeLink.href = url;
    document.body.appendChild(fakeLink);
    fakeLink.click();
    document.body.removeChild(fakeLink);
    fakeLink.remove();

}

module.exports = downloadImage;