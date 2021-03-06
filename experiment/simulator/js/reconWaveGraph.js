let encodedWaveCanvas = document.getElementById('reconWaveCanvas');
let encodedWaveCtx = encodedWaveCanvas.getContext('2d');

let canvas_width = encodedWaveCanvas.parentElement.clientWidth || 1100;
let canvas_height = 250;
let orgx = 50;
let orgy = canvas_height / 2;

encodedWaveCanvas.width = canvas_width;
encodedWaveCanvas.height = canvas_height;

const wave_amplitude_element = document.getElementById("swamplitude");
const wave_frequency_element = document.getElementById("swfrequency");
const sampling_frequency_element = document.getElementById("safrequency")
const vertical_scale_element = document.getElementById("reconwave_vertical_scale_factor");
const horizontal_scale_element = document.getElementById("reconwave_horizontal_scale_factor");
const bl_scale_element = document.getElementById("bit_length_factor");
const check_quantized_points = document.getElementById("quantized_points");
const n1 = document.getElementById("noisefrequency");


// Draws the axes for the graph
function drawAxes(ctx, orgx, orgy, line_start, line_end) {
    ctx.beginPath();
    // Vertical line
    ctx.moveTo(orgx, line_start);
    ctx.lineTo(orgx, line_end);
    ctx.strokeStyle = "black";
    ctx.stroke();

    // Horizontal line
    ctx.moveTo(orgx, line_end);
    ctx.lineTo(canvas_width - 50, line_end);
    ctx.strokeStyle = "black";
    ctx.stroke();

    // Base line
    ctx.moveTo(orgx, (line_start + line_end) / 2);
    ctx.lineTo(canvas_width - 50, (line_start + line_end) / 2);
    ctx.strokeStyle = "black";
    ctx.stroke();

    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Y-Axis:Amplitude(Volts)", orgx + 10, line_start + 10, 100);
    ctx.fillText("X-Axis:Timeperiod(ms)", canvas_width - 300, line_end + 13, 170);
    ctx.closePath();
}

function drawPoint(ctx, x, y) {
    var radius = 3.0;
    ctx.beginPath();
    ctx.strokeStyle = "blue";
    ctx.stroke();
    ctx.fillStyle = 'black';
    ctx.lineWidth = 1;
    ctx.arc(x, y, radius*1.3, 0, 2 * Math.PI, false);
    ctx.fill();

    ctx.closePath();
}

/*
 * Returns an array of values starting with value *start* ending
 * at value *stop* and with an increment of *step*.
 * xrange(1, 3, 0.5) will return [1, 1.5, 2, 2.5, 3]
 */
function xrange(start, stop, step) {
    var res = [];
    var i = start;
    while (i <= stop) {
        res.push(i);
        i += step;
    }
    return res;
}



function d2b(x,bitLength=8)
{
    var result = "0000000000000000000000000"+(x >>> 0).toString(2);
    return(result.substr(result.length-bitLength));
}



function plotStairCase(ctx, arr, vertical_scaling_factor, horizontal_scaling_factor) {
    ctx.beginPath();
    ctx.strokeStyle = "blue";
    ctx.stroke();

    // Scale the values in the array for plotting
    // Eg: if arr = [1, 1, 2] and scaling factor is 10
    // then arr = [10, 10, 20]
    arr.forEach((_, idx) => {
        arr[idx] *= vertical_scaling_factor;
    });

    //console.log(arr);
    // Learn about moveTo from the docs
    const offset = 0;
    ctx.moveTo(orgx, orgy - arr[0] + offset);

    // The below code is bit hard to explain through comments try going throught them
    // if you don't understand then i'll try explaining it.
    ctx.lineWidth = 1;

    var px = orgx;
    var py = arr[0];

    for (var i = 1; i < arr.length; i++) {
        var xoff = i * horizontal_scaling_factor;
        ctx.lineTo(xoff + orgx, orgy - py + offset);
        ctx.lineTo(xoff + orgx, orgy - arr[i] + offset);
        px = xoff;
        py = arr[i];
    }

    ctx.stroke();
    ctx.closePath();
}



// Will draw the sine wave starting from loc xOffset, yOffset
function plotSine(ctx, amplitude, frequency, xOffset, yOffset, vertical_scaling_factor, horizontal_scaling_factor,noise) {
    var width = 1000;

    // 1-5: 80
    // 6-12: 140
    // 13-20: 200
    var Fs = 0;
    if (frequency >= 1 && frequency <= 5) Fs = 80;
    else if (frequency >= 6 && frequency <= 12) Fs = 140;
    else Fs = 250;

    // Generates the values for the sine wave.
    var StopTime = 1;
    var dt = 1 / Fs;
    var t = xrange(0, StopTime + dt, dt);
    var x = [];
    t.forEach((val) => {
        x.push((Math.sqrt(2/sampling_frequency_element.value) * Math.cos(2 * Math.PI * 2 * frequency * val)));
        // x.push(amplitude * Math.sin(2 * Math.PI * frequency * val));
    });

    var main_sig = [];
    for (let i = 1; i <= 8; i++) {
        main_sig.push(parseInt(document.getElementById(`bit${i}`).value));
    }
    
    
    if (noise == 5) {
        main_sig[3] = (main_sig[3] == 1) ? 0 : 1;
        document.getElementById("ber").innerHTML = (1 / 8);
        document.getElementById("eff").innerHTML = ((7 / 8) * 100) + "%";
    }
    else if (noise == 10) {
        main_sig[3] = (main_sig[3] == 1) ? 0 : 1;
        main_sig[4] = (main_sig[4] == 1) ? 0 : 1;
        document.getElementById("ber").innerHTML = (2 / 8);
        document.getElementById("eff").innerHTML = ((6 / 8) * 100) + "%";
    }
    else if (noise == 15) {
        main_sig[3] = (main_sig[3] == 1) ? 0 : 1;
        main_sig[4] = (main_sig[4] == 1) ? 0 : 1;
        main_sig[5] = (main_sig[5] == 1) ? 0 : 1;
        document.getElementById("ber").innerHTML = (3 / 8);
        document.getElementById("eff").innerHTML = ((5 / 8) * 100) + "%";
    }
    else if (noise == 20) {
        main_sig[3] = (main_sig[3] == 1) ? 0 : 1;
        main_sig[4] = (main_sig[4] == 1) ? 0 : 1;
        main_sig[5] = (main_sig[5] == 1) ? 0 : 1;
        main_sig[6] = (main_sig[6] == 1) ? 0 : 1;
        document.getElementById("ber").innerHTML = (4 / 8);
        document.getElementById("eff").innerHTML = ((4 / 8) * 100) + "%";
    }
    else {
        document.getElementById("ber").innerHTML = (0 / 8);
        document.getElementById("eff").innerHTML = ((8 / 8) * 100) + "%";
    }
    document.getElementById("bits").innerHTML = main_sig;
    plotStairCase(ctx, main_signal, vertical_scaling_factor, horizontal_scaling_factor);

    
}


let size_set = false;



export function drawReconWave() {
    var wave_amplitude = wave_amplitude_element.value*2;
    var wave_frequency = wave_frequency_element.value;
    var vertical_scaling_factor = vertical_scale_element.value;
    var noise = n1.value;
    var horizontal_scaling_factor = horizontal_scale_element.value;

    canvas_height = encodedWaveCanvas.parentElement.clientHeight;
    canvas_width = encodedWaveCanvas.parentElement.clientWidth;
    if (canvas_height > 100 && !size_set) {
        canvas_height = encodedWaveCanvas.parentElement.clientHeight;
        canvas_width = encodedWaveCanvas.parentElement.clientWidth;
        encodedWaveCtx.canvas.width = canvas_width;
        encodedWaveCtx.canvas.height = canvas_height;
        size_set = true;
    }

    // Clear the screen
    encodedWaveCtx.fillStyle = "white";
    encodedWaveCtx.fillRect(0, 0, canvas_width, canvas_height);

    // Vertical line start and end
    var line_start = 20;
    var line_end = canvas_height - 50;
    var mid_of_line = (line_start + line_end) / 2;

    drawAxes(encodedWaveCtx, orgx, orgy, line_start, line_end);
    plotSine(encodedWaveCtx, wave_amplitude, wave_frequency, orgx, mid_of_line, vertical_scaling_factor, horizontal_scaling_factor,mid_of_line,noise);
    requestAnimationFrame(drawReconWave);
}