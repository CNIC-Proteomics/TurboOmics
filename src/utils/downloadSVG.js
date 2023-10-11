export default function downloadSVG(fullFig, fileName) {
    // Get data URL with image
    let svgURL = new XMLSerializer().serializeToString(fullFig);
    let svgBlob = new Blob([svgURL], { type: "image/svg+xml;charset=utf-8" });
    var url = URL.createObjectURL(svgBlob);

    // Download the image
    const fakeLink = window.document.createElement('a');
    fakeLink.style = "display:none";
    fakeLink.download = `${fileName}`;
    fakeLink.href = url;
    document.body.appendChild(fakeLink);
    fakeLink.click();
    document.body.removeChild(fakeLink);
    fakeLink.remove();
}