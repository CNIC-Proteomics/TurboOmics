import { Box, IconButton } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';

import downloadSVG from "./downloadSVG";

export const downloadImageDensityPlot = async (histComp, boxComp, omic) => {

    const SVG = document.createElementNS("http://www.w3.org/2000/svg", 'svg');

    SVG.appendChild(document.createElementNS("http://www.w3.org/2000/svg", 'g'));
    SVG.appendChild(document.createElementNS("http://www.w3.org/2000/svg", 'g'));
    SVG.appendChild(document.createElementNS("http://www.w3.org/2000/svg", 'g'));


    const histSVG = histComp.container.firstChild.cloneNode(true);
    Array.from(histSVG.children).map(i => SVG.children[0].appendChild(i));
    
    const boxSVG = boxComp.firstChild.firstChild.firstChild.cloneNode(true);
    
    Array.from(boxSVG.children[0].children).map(i => SVG.children[1].appendChild(i));
    SVG.children[1].setAttribute('transform', 'translate(-20, 200)');
    
    Array.from(boxSVG.children[2].children).map(i => SVG.children[2].appendChild(i));
    SVG.children[2].setAttribute('transform', 'translate(-20, 230)');

    downloadSVG(SVG, `DensityPlot_${omic}.svg`);
}

export const DownloadComponent = ({ scatterRef, name }) => {
    const downloadScatter = () => {

        const SVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        SVG.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'g'));

        const scatterComp = scatterRef.current.container.cloneNode(true);
        Array.from(scatterComp.children[0].children).map(i => SVG.children[0].appendChild(i));

        if (scatterComp.children.length == 3) {

            SVG.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
            SVG.children[1].setAttribute('transform', 'translate(600, 20)')

            const legend = convertHTMLToSVG(scatterComp.children[1]);
            Array.from(legend.children).map(i => SVG.children[1].appendChild(i));
        }

        downloadSVG(SVG, `${name}-Scatter`);
    }

    return (
        <Box sx={{ height: 0 }}>
            <Box sx={{ width: 50, position: 'relative', top: 5, zIndex: 5000 }}>
                <IconButton
                    aria-label="download"
                    size='small'
                    onClick={downloadScatter}
                    sx={{ opacity: 0.5 }}
                >
                    <DownloadIcon />
                </IconButton>
            </Box>
        </Box>
    )
}

function convertHTMLToSVG(myDiv) {

    // Crear un elemento temporal para contener el HTML
    const tempDiv = document.createElement('div');
    tempDiv.appendChild(myDiv);
    //tempDiv.innerHTML = htmlString;

    // Obtener los elementos relevantes
    const legendWrapper = tempDiv.querySelector('.recharts-legend-wrapper');
    const legendItems = legendWrapper.querySelectorAll('.recharts-legend-item');

    // Crear el elemento SVG principal
    const svgNamespace = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNamespace, 'svg');
    svg.setAttribute('xmlns', svgNamespace);
    svg.setAttribute('width', legendWrapper.style.width.replace('px', ''));
    //svg.setAttribute('height', legendWrapper.style.height.replace('px', 'auto'));
    svg.setAttribute('viewBox', `0 0 ${parseInt(legendWrapper.style.width, 10)} ${legendItems.length * 20}`);

    // Variables para posicionar los elementos en el SVG
    let currentY = 20;

    // Procesar cada elemento de la leyenda
    legendItems.forEach(item => {
        const icon = item.querySelector('svg path'); // Ícono del elemento
        const text = item.querySelector('.recharts-legend-item-text'); // Texto del elemento

        // Crear un grupo <g> para cada elemento de la leyenda
        const group = document.createElementNS(svgNamespace, 'g');
        group.setAttribute('transform', `translate(0, ${currentY})`);

        // Crear el ícono como un path
        const path = document.createElementNS(svgNamespace, 'path');
        path.setAttribute('d', icon.getAttribute('d'));
        path.setAttribute('fill', icon.getAttribute('fill'));
        //path.setAttribute('transform', icon.getAttribute('transform'));
        path.setAttribute('transform', `${icon.getAttribute('transform')} scale(0.5)`); // Reducir a la mitad

        // Crear el texto
        const svgText = document.createElementNS(svgNamespace, 'text');
        svgText.textContent = text.textContent;
        svgText.setAttribute('x', 26); // Espaciado del texto
        svgText.setAttribute('y', 21); // Centrado verticalmente
        svgText.setAttribute('fill', text.style.color);
        svgText.setAttribute('font-family', 'Calibri'); // Usar fuente Calibri
        svgText.setAttribute('font-size', '16'); // Tamaño de fuente opcional

        // Agregar el ícono y el texto al grupo
        group.appendChild(path);
        group.appendChild(svgText);

        // Agregar el grupo al SVG
        svg.appendChild(group);

        // Incrementar la posición vertical
        currentY += 20;
    });

    // Devolver el SVG como string
    return (svg);
    //const serializer = new XMLSerializer();
    //return serializer.serializeToString(svg);
}


export const DownloadComponentBarChart = ({ scatterRef, name }) => {
    const downloadScatter = () => {

        const SVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        SVG.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'g'));

        const scatterComp = scatterRef.current.container.cloneNode(true);

        Array.from(scatterComp.children[0].children).map(i => SVG.children[0].appendChild(i));

        if (scatterComp.children.length == 3) {

            SVG.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
            SVG.children[1].setAttribute('transform', 'translate(600, 20)')

            const legend = convertBarLegendHTMLToSVG(scatterComp.children[1]);
            Array.from(legend.children).map(i => SVG.children[1].appendChild(i));
        }
        downloadSVG(SVG, `${name}-BarPlot`);
    }

    return (
        <Box sx={{ height: 0 }}>
            <Box sx={{ width: 50, position: 'relative', top: 5, zIndex: 5000 }}>
                <IconButton
                    aria-label="download"
                    size='small'
                    onClick={downloadScatter}
                    sx={{ opacity: 0.5 }}
                >
                    <DownloadIcon />
                </IconButton>
            </Box>
        </Box>
    )
}

function convertBarLegendHTMLToSVG(myDiv) {
    // Crear un elemento temporal para contener el HTML
    const tempDiv = document.createElement('div');
    //tempDiv.innerHTML = htmlString;
    tempDiv.appendChild(myDiv);


    // Obtener los elementos relevantes
    const legendWrapper = tempDiv.querySelector('.recharts-legend-wrapper');
    //const legendItems = legendWrapper.querySelectorAll('div > div');
    const legendItems = Array.from(legendWrapper.children[0].children);
    // Crear el elemento SVG principal
    const svgNamespace = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNamespace, 'svg');
    svg.setAttribute('xmlns', svgNamespace);
    svg.setAttribute('width', legendWrapper.style.width.replace('px', ''));
    //svg.setAttribute('height', 'auto'); // Calcularemos dinámicamente la altura
    svg.setAttribute('viewBox', `0 0 ${parseInt(legendWrapper.style.width, 10)} ${legendItems.length * 30}`);

    // Variables para posicionar los elementos en el SVG
    let currentY = 25; // Posición inicial en X
    const spacing = 30; // Espaciado horizontal entre ítems

    // Procesar cada elemento de la leyenda
    legendItems.forEach(item => {
        const colorBox = item.querySelector('div'); // Cuadro de color
        const text = item.querySelector('span'); // Texto del ítem

        // Crear un grupo <g> para cada elemento de la leyenda
        const group = document.createElementNS(svgNamespace, 'g');
        group.setAttribute('transform', `translate(-30, ${currentY})`);

        // Crear el rectángulo del color
        const rect = document.createElementNS(svgNamespace, 'rect');
        rect.setAttribute('x', 0);
        rect.setAttribute('y', 0);
        rect.setAttribute('width', 15); // Ancho del rectángulo
        rect.setAttribute('height', 15); // Alto del rectángulo
        rect.setAttribute('fill', colorBox.style.backgroundColor);

        // Crear el texto
        const svgText = document.createElementNS(svgNamespace, 'text');
        svgText.textContent = text.textContent;
        svgText.setAttribute('x', 20); // Posición a la derecha del rectángulo
        svgText.setAttribute('y', 12); // Centrado verticalmente con el rectángulo
        svgText.setAttribute('font-family', 'Calibri'); // Fuente
        svgText.setAttribute('font-size', '12'); // Tamaño de fuente
        svgText.setAttribute('fill', '#000'); // Color del texto

        // Agregar el rectángulo y el texto al grupo
        group.appendChild(rect);
        group.appendChild(svgText);

        // Agregar el grupo al SVG
        svg.appendChild(group);

        // Incrementar la posición X para el próximo elemento
        currentY += spacing;
    });

    return (svg);

}

export const DownloadHeatmap = ({ scatterRef, name }) => {

    return (
        <Box sx={{ height: 0 }}>
            <Box sx={{ width: 50, position: 'relative', top: 5, zIndex: 5000 }}>
                <IconButton
                    aria-label="download"
                    size='small'
                    onClick={() => window.print()}
                    sx={{ opacity: 0.5 }}
                >
                    <DownloadIcon />
                </IconButton>
            </Box>
        </Box>
    )
}

export const DownloadComponentGSEA = ({ scatterRef, name }) => {


    const downloadScatter = () => {

        const SVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

        SVG.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
        SVG.children[0].setAttribute('transform', 'translate(0,70)');
        const p1Comp = scatterRef.current.p1.current.cloneNode(true);
        Array.from(p1Comp.children[0].children[0].children).map(e => SVG.children[0].appendChild(e));

        SVG.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
        SVG.children[1].setAttribute('transform', 'translate(0,291)');
        const p2Comp = scatterRef.current.p2.current.cloneNode(true);
        Array.from(p2Comp.children[0].children[0].children).map(e => SVG.children[1].appendChild(e));

        SVG.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
        SVG.children[2].setAttribute('transform', 'translate(0,342)');
        const p3Comp = scatterRef.current.p3.current.cloneNode(true);
        Array.from(p3Comp.children[0].children[0].children).map(e => SVG.children[2].appendChild(e));

        SVG.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
        SVG.children[3].setAttribute('transform', 'translate(60,0)');
        const valuesComp = convertGSEAHTMLToSVG(scatterRef.current.values.cloneNode(true));
        Array.from(valuesComp.children).map(e => SVG.children[3].appendChild(e));

        downloadSVG(SVG, `${name}`);
    }

    return (
        <Box sx={{ height: 0 }}>
            <Box sx={{ width: 50, position: 'relative', top: 5, zIndex: 5000 }}>
                <IconButton
                    aria-label="download"
                    size='small'
                    onClick={downloadScatter}
                    sx={{ opacity: 0.5 }}
                >
                    <DownloadIcon />
                </IconButton>
            </Box>
        </Box>
    )
}

function convertGSEAHTMLToSVG(myDiv) {
    // Crear un elemento temporal para analizar el HTML
    const tempDiv = document.createElement('div');
    tempDiv.appendChild(myDiv);

    // Obtener los elementos del contenido
    const parentDiv = tempDiv.querySelector('.MuiBox-root.css-0');
    const firstParagraph = parentDiv.querySelector('.MuiBox-root.css-3cj8ml p');
    const secondParagraph = parentDiv.querySelector('.MuiBox-root.css-85t6ji p');

    // Crear el elemento SVG
    const svgNamespace = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNamespace, 'svg');
    svg.setAttribute('xmlns', svgNamespace);
    svg.setAttribute('width', '300'); // Ancho del SVG
    svg.setAttribute('height', '100'); // Altura del SVG
    svg.setAttribute('viewBox', '0 0 300 100');

    // Añadir el primer texto
    const text1 = document.createElementNS(svgNamespace, 'text');
    text1.textContent = firstParagraph.textContent;
    text1.setAttribute('x', '10'); // Posición horizontal
    text1.setAttribute('y', '30'); // Posición vertical
    text1.setAttribute('font-family', 'Calibri'); // Fuente
    text1.setAttribute('font-size', '20'); // Tamaño de fuente
    text1.setAttribute('fill', '#787878'); // Color del texto

    // Añadir el segundo texto
    const text2 = document.createElementNS(svgNamespace, 'text');
    text2.textContent = secondParagraph.textContent;
    text2.setAttribute('x', '10'); // Posición horizontal
    text2.setAttribute('y', '52'); // Posición vertical
    text2.setAttribute('font-family', 'Calibri'); // Fuente
    text2.setAttribute('font-size', '20'); // Tamaño de fuente
    text2.setAttribute('fill', '#787878'); // Color del texto

    // Agregar los textos al SVG
    svg.appendChild(text1);
    svg.appendChild(text2);
    return svg;
    // Devolver el SVG como string
    /*const serializer = new XMLSerializer();
    return serializer.serializeToString(svg);*/
}