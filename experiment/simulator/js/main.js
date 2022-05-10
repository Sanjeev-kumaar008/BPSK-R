import { BID, NRZ, PM,PM1,PM2,AD, ROUTPUT,I1,I2,PM3,PM4,DD1,DD2,MUX } from './Block.js'
import { Wire, connectionNodes, WireManager, OUTPUT, RSIG,MOD,DEMOD,CORR,EMPTY } from './Block.js';
import { drawSourceWave } from './bitwave.js';
import { drawSampledWave } from './sampledWaveGraph.js';
import { drawEncodedWave} from './encodedWaveGraph.js';
import { Line } from './Line.js';
import { drawDecoderWave } from './decoderWaveGraph.js';
import { drawReconWave } from "./reconWaveGraph.js";
import { drawQuantizedWave } from "./quantizerWaveGraph.js";

let myblocks = new Map();
let currentModal = null;

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    myblocks.forEach((block) => {
        block.update_pos();
    });
}

function setup_modulation() {
    myblocks.set('modulation', new MOD(40, 32.5, 150, 50));
    myblocks.set('generator', new BID(240-79, 132.5, 200, 100));
    myblocks.set('sampler', new NRZ(546.6-79, 132.5, 200, 100));
    myblocks.set('quantizer', new PM(853.32-79, 132.5, 220, 100));
    myblocks.set('encoder', new OUTPUT(1200-79, 132.5, 220, 100));

    /* FIXME: Find a new way to make the elements responsive to resize */
    
    // myblocks.set('line0', new Line((val) => {
    //     const generator = myblocks.get('generator');
    //     const sampler = myblocks.get('sampler');

    //     val.x1 = generator.cx + generator.cw;
    //     val.y1 = generator.cy + generator.ch / 2;
    //     val.x2 = sampler.cx;
    //     val.y2 = sampler.cy + sampler.ch / 2;
    // }, 0, 'x(t)'));
    
    // myblocks.set('line1', new Line((val) => {
    //     const sampler = myblocks.get('sampler');
    //     const quantizer = myblocks.get('quantizer');

    //     val.x1 = sampler.cx + sampler.cw;
    //     val.y1 = sampler.cy + sampler.ch / 2;
    //     val.x2 = quantizer.cx;
    //     val.y2 = quantizer.cy + quantizer.ch / 2;
    // }, 0, 'x(nTs)'));
    
    // myblocks.set('line8', new Line((val) => {
    //     const quantizer = myblocks.get('quantizer');
    //     const encoder = myblocks.get('encoder');

    //     val.x1 = quantizer.cx+quantizer.cw;
    //     val.y1 = quantizer.cy + quantizer.ch / 2;
    //     val.x2 = encoder.cx;
    //     val.y2 = encoder.cy + encoder.ch / 2;
    // }, 0, 'xq(nTs)'));
    
    // myblocks.set('line9', new Line((val) => {
    //     const encoder = myblocks.get('encoder');

    //     val.x1 = encoder.cx+encoder.cw;
    //     val.y1 = encoder.cy + encoder.ch / 2;
    //     val.x2 = encoder.cx+encoder.cw+120;
    //     val.y2 = encoder.cy + encoder.ch / 2;
    // }, 0 , "PCM\noutput"));
    
}

function setup_demodulation() {
    myblocks.set('demodulation', new DEMOD(40, 432.5, 180, 50));
    myblocks.set('correlator', new CORR(600, 532.5, 180, 50));
    myblocks.set('empty', new EMPTY(430, 600.5, 520, 250));
    myblocks.set('rsignal', new RSIG(240-79, 652.5, 200, 100));
    myblocks.set('prodmod3', new PM3(546.6-79, 652.5, 200, 100));
    myblocks.set('inte1', new I1(796.6-79, 652.5, 200, 100));
    myblocks.set('dd1', new DD1(1096.6-79, 652.5, 200, 100));

    myblocks.set('routput', new ROUTPUT(1400-79, 652.5, 220, 100));

    // myblocks.set('line1dm', new Line((val) => {
    //     const decoder = myblocks.get('decoder');
    //     val.x1 = decoder.cx -220;
    //     val.y1 = decoder.cy + (decoder.ch / 2);
    //     val.x2 = decoder.cx;
    //     val.y2 = decoder.cy + (decoder.ch / 2);
    // }, 0, 'Encoder Output'));

    // myblocks.set('line2dm', new Line((val) => {
    //     const decoder = myblocks.get('decoder');
    //     const reconstructionfilter = myblocks.get('reconstructionfilter');
    //     val.x1 = decoder.cx + decoder.cw;
    //     val.y1 = decoder.cy + (decoder.ch / 2);
    //     val.x2 = reconstructionfilter.cx;
    //     val.y2 = reconstructionfilter.cy + (reconstructionfilter.ch / 2);
    // }, 0, 'Decoded Output'));

    // myblocks.set('line3dm', new Line((val) => {
    //     const reconstructionfilter = myblocks.get('reconstructionfilter');
    //     val.x1 = reconstructionfilter.cx + reconstructionfilter.cw;
    //     val.y1 = reconstructionfilter.cy + (reconstructionfilter.ch / 2);
    //     val.x2 = reconstructionfilter.cx + reconstructionfilter.cw + 220;
    //     val.y2 = reconstructionfilter.cy + (reconstructionfilter.ch / 2);
    // }, 0, 'Reconstructed\nMessage Signal'));

    /*
    myblocks.set('line2dm', new Line((val) => {
        const decoder = myblocks.get('decoder');
        const filter = myblocks.get('predictionfilter');
        val.x1 = decoder.cx + (filter.cx - decoder.cx) * 0.5;
        val.y1 = decoder.cy + (decoder.ch / 2);
        val.x2 = filter.cx;
        val.y2 = decoder.cy + (decoder.ch / 2);
        console.log(val);
    }, 0, 'Decoded Signal'));

    myblocks.set('line3dm', new Line((val) => {
        const filter = myblocks.get('predictionfilter');
        const lpf = myblocks.get('lowpassfilter');
        val.x1 = filter.cx + (lpf.cx - filter.cx) * 0.5;
        val.y1 = filter.cy + (filter.ch / 2);
        val.x2 = lpf.cx;
        val.y2 = filter.cy + (filter.ch / 2);
        console.log(val);
    }, 0, 'Predicted Signal'));

    myblocks.set('line4dm', new Line((val) => {
        const lpf = myblocks.get('lowpassfilter');
        val.x1 = lpf.cx + lpf.cw;
        val.y1 = lpf.cy + (lpf.ch / 2);
        val.x2 = windowWidth * 0.9;
        val.y2 = val.y1;
        console.log(val);
    }, 0, 'Reconstructed \n Message Signal'));
    */
}

function openModal(obj, dblClick = false) {
    // On double click first a single click event is triggered and then the double click event
    // Return if already showing a modal and a single click was performed
    if (currentModal && !dblClick) {
        return ;
    }

    if (currentModal && dblClick) {
        $(`${currentModal}`).modal('hide');
        currentModal = null;
    }

    let _modalName = dblClick ? obj.doubleClickModal() : obj.singleClickModal();
    if (!_modalName) {
        return ;
    }
    const modalName = `#${_modalName}`;


    $(modalName).modal('show');
    $(modalName).on('shown.bs.modal', function () {
        if (modalName === '#sourceWaveGraph') {
            drawSourceWave();
        } else if (modalName === '#sampledWaveGraph') {
            drawSampledWave();
        } else if (modalName === '#decoderWaveGraph') {
            drawDecoderWave();
        }else if (modalName === '#reconWaveGraph') {
            drawReconWave();
        } else if (modalName === '#quantizerOutput') {
            // const binLength = getQuantizationLevels();
            drawQuantizedWave();
        } else if (modalName == '#encodedWaveGraph') {
            drawEncodedWave();
        }
    });
    currentModal = modalName;

    $(`${modalName}`).on('hidden.bs.modal', function () {
        currentModal = null;
    })
}

function doubleClicked() {
    myblocks.forEach((val, key) => {
        if (val.mouseOver()) {
            openModal(val, true);
        }
    });
}

let wireManager = new WireManager();
let currentStartNode = null;
let currentSelected = null;


function keyPressed() {
    if (keyCode === DELETE) {
        if (currentSelected) {
            console.log('removing ', currentSelected);
            wireManager.remove(currentSelected);
            currentSelected = null;
        }
        components = [];
        if (currentStartNode) currentStartNode = null;
    }
    if (keyCode === ENTER) {
        console.log(components);
        console.log(wireManager);
    }
}

let components = [];

function mouseClicked() {
    let anySelected = false;
    if (currentSelected instanceof Wire) currentSelected.selected = false;
    connectionNodes.forEach((node) => {
        if (node.didClick()) {
            if (!currentStartNode) {
                currentStartNode = node;
                console.log('current start node: ', currentStartNode);
                components.push(currentStartNode);
            }
            else {
                components.push(node);
                console.log(components);
                wireManager.addWire(components);
                console.log('adding wire from: ', currentStartNode, ' to ', node);
                currentStartNode = null;
                components = [];
            }
            anySelected = true;
        }
    });
    wireManager.wires.forEach((wire) => {
        if (wire.didClick()) {
            console.log('clicked on wire ', wire);
            currentSelected = wire;
            wire.selected = true;
            anySelected = true;
        }
    })
    if (!anySelected && currentStartNode) {
        const v = createVector(mouseX, mouseY)
        // line(currentStartNode.x, currentStartNode.y, v.x, v.y);
        components.push(v);
        currentStartNode = v;
    }

    if (!anySelected) { currentSelected = null; console.log('setting curretnSelcted to ', currentSelected); }
}

export function draw() {
    clear();

    myblocks.forEach((val, key) => {
        const highlight = val.mouseOver() && !currentModal;
        val.draw(highlight);
    });

    wireManager.draw();

    if (components)
        new Wire(components).draw();

    if (currentStartNode)
        line(currentStartNode.x, currentStartNode.y, mouseX, mouseY);
}

export function setup() {
    createCanvas(windowWidth, windowHeight);

    setup_modulation();
    setup_demodulation();
}

/** @type {Window} */
window.setup = setup;
window.draw = draw;
window.windowResized = windowResized;
window.onclick = mouseClicked;
window.doubleClicked = doubleClicked;
window.onkeydown = keyPressed;