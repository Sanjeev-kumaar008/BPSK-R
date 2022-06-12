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
                console.log('adding wire from: ', currentStartNode, ' to ', node);
                const n = components.length;
                if (validConnection(components[0].name, components[n - 1].name)) {
                    totalConnection ++;
                    wireManager.addWire(components);
                } else {
                    alert("Invalid Connection. Please check your connections");
                }
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



const questions = {
    1: {
        "question": "In BPSK, the Balanced Modulator can act as",
        "options": [
            "Phase Reversing Switch",
            "Phase Reversing Amplifier",
            "Phase Propagating Amplifier",
            "Phase modulating Switch",
            "Phase Propagating Switch"
        ],
        "answer": "Phase Reversing Switch"
    },
    2: {
        "question": "In BPSK, the symbols 1 and 0 are denoted by carrier wave with phase shift of",
        "options": [
            "π/2",
            "2π",
            "π",
            "0",
            "3π/4"
        ],
        "answer": "π"
    },
    3: {
        "question": "What is the Minimum Bandwidth in BPSK when Baud rate is Fb/2?",
        "options": [
            "Fb",
            "Fb/2",
            "4Fb",
            "2Fb",
            "Fb/4"
        ],
        "answer": "Fb/2"
    },
    4: {
        "question": "The average energy per bit in BPSK is calculated by",
        "options": [
            "Average energy symbol/ log2M",
            "log2M/ Average energy symbol",
            "Average energy symbol *log2M",
            "Average energy symbol- log2M",
            "log2M- Average energy symbol"
        ],
        "answer": "0.687V and 8.6mW"
    }
};

function generateQuizQuestions() {
    let quizBody = document.getElementById("quizBody");
    for (const [qnno, qobj] of Object.entries(questions)) {
        let question_div = document.createElement("div");

        let question = document.createElement("h5");
        question.innerHTML = qnno + ') ' + qobj.question;

        question_div.appendChild(question);

        qobj.options.forEach((option) => {
            let b = document.createElement("input");

            b.type = "radio"
            b.name = 'qn'+qnno;
            b.value = option;
            b.style = "margin-left: 25px";
            let  c = document.createElement("label");
            c.for = qnno;
            c.innerText = option;
            c.style = "margin-left: 10px";
            question_div.appendChild(b);
            question_div.appendChild(c);

            question_div.appendChild(document.createElement("br"));
        });
        question_div.appendChild(document.createElement("br"));
        quizBody.append(question_div);
    }
}

function validateQuiz() {
    console.log('Validate Quiz');
    const num_questions = Object.entries(questions).length;
    const questionMap = new Map(Object.entries(questions));
    console.log(questionMap);
    for (let i = 1; i <= num_questions; i++) {
        const name = 'qn' + i;
        const elements = document.getElementsByName(name);
        let checked = false;
        elements.forEach((element) => {
            if (element.checked)
                checked = true;
        });
        if (!checked) {
            alert('Answer all questions');
            return ;
        }
    }
    const labels = document.getElementsByTagName('label');
    console.log('Labels: ', labels);

    for (let i = 1; i <= num_questions; i++) {
        const name = 'qn' + i;
        const elements = document.getElementsByName(name);

        let ans = '';
        elements.forEach((element) => {
            if (element.checked) {
                ans = element.value;
            }
        });
        const correct_ans = questionMap.get(`${i}`).answer;
        labels.forEach((label) => {
            if (label.for !== `${i}`)
                return ;
            if (label.innerText === correct_ans) {
                label.style = 'color: green; margin-left: 10px';
            } else if (label.innerText === ans && ans !== correct_ans) {
                label.style = 'color: red; margin-left: 10px';
            }
        });
    }
}

function showQuizes() {
    $('#quizModal').modal('show');
    generateQuizQuestions();
}

document.getElementById('quizbtn').onclick = showQuizes;
document.getElementById('submitbtn').onclick = validateQuiz;