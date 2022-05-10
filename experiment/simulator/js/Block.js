export let connectionNodes = [];

class Block {
    constructor(x, y, w, h, name = null, onclick = null, selectable = true) {
        this.name = name;
        this.xo = x;
        this.yo = y;
        this.wo = w;
        this.ho = h;

        this.cx = x;
        this.cy = y;
        this.cw = w;
        this.ch = h;

        this.selectable = selectable;

        this.onclick = onclick
        this.update_pos();
    }

    populate_modal() {}

    update_pos() {
        const width = windowWidth;
        const height = windowHeight;

        this.cx = this.xo * (width / 1920);
        this.cy = this.yo * (height / 1080);
        this.cw = this.wo * (width / 1920);
        this.ch = this.ho * (height / 1080);
    }

    mouseOver() {
        // mouseX and mouseY are p5.js provided global variables
        const x = mouseX;
        const y = mouseY;
        return this.selectable && x >= this.cx && x <= this.cx + this.cw &&
               y >= this.cy && y <= this.cy + this.ch;
    }

    draw(highlight = false) {
        const cx = this.cx;
        const cy = this.cy;
        const cw = this.cw;
        const ch = this.ch;

        const font_size = 25 * Math.min(windowWidth / 1920, windowHeight / 1080);

        fill("white");
        push();
        if (this.selectable && highlight) {
            stroke(255, 0, 0);
        } else {
            stroke(0, 0, 0);
        }
        strokeWeight(3);
        rect(cx, cy, cw, ch, 12);
        strokeWeight(2);
        pop();
        if (this.name) {
            textSize(font_size);
            textStyle('bold');
            textAlign(CENTER, CENTER);
            fill("black");
            text(this.name, cx + cw / 2, cy + ch / 2);
        }
    }

    singleClickModal() { return null; }

    doubleClickModal() { return null; }
}

function circle_dist(x1, y1, x2, y2) {
    const xd = x2 - x1;
    const yd = y2 - y1;
    return xd * xd + yd * yd;
}

export class Wire {
    constructor (components) {
        this.components = components;
        this.width = 2;
        this.selected = false;
    }

    draw() {
        push();
        strokeWeight(this.width);
        if (this.selected || this.didClick()) stroke(255, 0, 0);
        else stroke(0, 0, 0);
        
        for (let i = 0; i < this.components.length - 1; i++) {
            const start = this.components[i];
            const end = this.components[i + 1];
            line(start.x, start.y, end.x, end.y)
        }

        pop();
    }

    didClick() {
        for (let i = 0; i < this.components.length - 1; i++) {
            const start = this.components[i];
            const end = this.components[i + 1];
            const x1 = start.x, x2 = end.x;
            const y1 = start.y, y2 = end.y;
            let distance = [];

            distance.push(dist(x1, y1,
                mouseX, mouseY));
            distance.push(dist(x2, y2,
                mouseX, mouseY));
            const wireLength = dist(x1, y1,
                x2, y2);

            if (distance[0] + distance[1] >= wireLength - (this.width / (10 * 2)) &&
                distance[0] + distance[1] <= wireLength + (this.width / (10 * 2)))
                return true;
        }
        return false;
    }
}

export class WireManager {
    constructor() {
        this.wires = []
    }

    addWire(components) {
        this.wires.push(new Wire(components));
    }

    draw() {
        this.wires.forEach((wire) => {
            wire.draw();
        });
    }

    remove(wire) {
        const idx = this.wires.indexOf(wire);
        if (idx == -1) return ;
        this.wires.splice(idx, 1);
    }
}

export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.r = 15;
        this.selected = false;
    }

    didClick() {
        const rdist = circle_dist(this.x, this.y, mouseX, mouseY)
        return rdist < (this.r * this.r);
    }

    draw() {
        push();
        strokeWeight(4);
        stroke(255, 0, 0);
        if (this.selected || this.didClick()) {
            fill(255, 255, 0);
        } else {
            fill(255, 255, 255);
        }
        circle(this.x, this.y, this.r);
        pop();

    }
}

export class BID extends Block {
    constructor (x, y, w, h) {
        super(x, y, w, h, 'BINARY\nDATA SEQUENCE', null, true);
        this.amp_slider = createSlider(0, 5000, 500);
        this.amp_slider.onchange = (evt) => {
            this.amplitude = int(evt.target.value);
        };
        this.freq_slider = createSlider(0, 5000, 500);
        this.freq_slider.onchange = (evt) => {
            this.frequency = int(evt.target.value);
        };
        this.amplitude = this.amp_slider.value;
        this.frequency = this.freq_slider.value;
        this.output = new Point(this.cx + this.cw + 7, this.cy + this.ch / 2);
        connectionNodes.push(this.output);
    }

    populate_modal(modal) {
        const label1 = document.createElement("h5");
        label1.innerText = "Amplitude: ";
        label1.style = "display: block;"
        modal.appendChild(label1);
        modal.appendChild(this.amp_slider);

        const label = document.createElement("h5");
        label.innerText = "Frequency: ";
        label.style = "display: block;"
        modal.appendChild(label);
        modal.appendChild(this.freq_slider);
    }

    draw(highlight) {
        super.draw(highlight);
        this.output.draw();
    }

    doubleClickModal() {
        return 'sourceWaveGraph';
    }
}

export class NRZ extends Block {
    constructor (x, y, w, h) {
        super(x, y, w, h, 'NRZ\nPOLAR SIGNAL', null, true);
        this.sampling_frequency = 0;
        this.sampling_slider = createSlider(0, 5000, 500);
        this.sampling_slider.onchange = this.sampling_slider_change;
        this.input = new Point(this.cx - 7, this.cy + this.ch / 2);
        this.output = new Point(this.cx + this.cw + 7, this.cy + this.ch / 2);
        connectionNodes.push(this.input);
        connectionNodes.push(this.output);
    }

    sampling_slider_change() {
        let amp = this.value;
    }

    doubleClickModal() {
        return 'sampledWaveGraph';
    }

    draw() {
        super.draw();
        this.input.draw();
        this.output.draw();
    }
}

export class PM extends Block {
    constructor (x, y, w, h) {
        super(x, y, w, h, 'PRODUCT\nMODULATOR', null, true);
        this.input = new Point(this.cx - 7, this.cy + this.ch / 2);
        this.output = new Point(this.cx + this.cw + 7, this.cy + this.ch / 2);
        connectionNodes.push(this.input);
        connectionNodes.push(this.output);
    }

    draw() {
        super.draw();
        this.input.draw();
        this.output.draw();
    }

    doubleClickModal() { return 'quantizerOutput'; }
}

export class LowPassFilter extends Block {
    constructor (x, y, w, h) {
        super(x, y, w, h, 'LOW PASS\nFILTER', null, true);
        this.input = new Point(this.cx - 7, this.cy + this.ch / 2);
        this.output = new Point(this.cx + this.cw + 7, this.cy + this.ch / 2);
    }

    draw() {
        super.draw();
        this.input.draw();
        this.output.draw();
    }
}

export class PM1 extends Block {
    constructor (x, y, w, h) {
        super(x, y, w, h, 'PRODUCT\nMODULATOR', null, true);
        this.input = new Point(this.cx - 7, this.cy + this.ch / 2);
        this.output = new Point(this.cx + this.cw + 7, this.cy + this.ch / 2);
        connectionNodes.push(this.input);
        connectionNodes.push(this.output);
    }

    draw() {
        super.draw();
        this.input.draw();
        this.output.draw();
    }
}

export class PM2 extends Block {
    constructor (x, y, w, h) {
        super(x, y, w, h, 'PRODUCT\nMODULATOR', null, true);
        this.input = new Point(this.cx - 7, this.cy + this.ch / 2);
        this.output = new Point(this.cx + this.cw + 7, this.cy + this.ch / 2);
        connectionNodes.push(this.input);
        connectionNodes.push(this.output);
    }

    draw() {
        super.draw();
        this.input.draw();
        this.output.draw();
    }
}

export class AD extends Block {
    constructor (x, y, w, h) {
        super(x, y, w, h, 'ADDER', null, true);
        this.input = new Point(this.cx - 7, this.cy + this.ch / 2);
        this.output = new Point(this.cx + this.cw + 7, this.cy + this.ch / 2);
        connectionNodes.push(this.input);
        connectionNodes.push(this.output);
    }

    draw() {
        super.draw();
        this.input.draw();
        this.output.draw();
    }
}

export class I1 extends Block {
    constructor (x, y, w, h) {
        super(x, y, w, h, 'INTEGRATOR', null, true);
        this.input = new Point(this.cx - 7, this.cy + this.ch / 2);
        this.output = new Point(this.cx + this.cw + 7, this.cy + this.ch / 2);
        connectionNodes.push(this.input);
        connectionNodes.push(this.output);
    }

    draw() {
        super.draw();
        this.input.draw();
        this.output.draw();
    }
}

export class I2 extends Block {
    constructor (x, y, w, h) {
        super(x, y, w, h, 'INTEGRATOR', null, true);
        this.input = new Point(this.cx - 7, this.cy + this.ch / 2);
        this.output = new Point(this.cx + this.cw + 7, this.cy + this.ch / 2);
        connectionNodes.push(this.input);
        connectionNodes.push(this.output);
    }

    draw() {
        super.draw();
        this.input.draw();
        this.output.draw();
    }
}

export class PM3 extends Block {
    constructor (x, y, w, h) {
        super(x, y, w, h, 'PRODUCT\nMODULATOR', null, true);
        this.input = new Point(this.cx - 7, this.cy + this.ch / 2);
        this.output = new Point(this.cx + this.cw + 7, this.cy + this.ch / 2);
        connectionNodes.push(this.input);
        connectionNodes.push(this.output);
    }

    draw() {
        super.draw();
        this.input.draw();
        this.output.draw();
    }
}

export class PM4 extends Block {
    constructor (x, y, w, h) {
        super(x, y, w, h, 'PRODUCT\nMULTIPLIER', null, true);
        this.input = new Point(this.cx - 7, this.cy + this.ch / 2);
        this.output = new Point(this.cx + this.cw + 7, this.cy + this.ch / 2);
        connectionNodes.push(this.input);
        connectionNodes.push(this.output);
    }

    draw() {
        super.draw();
        this.input.draw();
        this.output.draw();
    }
}

export class DD1 extends Block {
    constructor (x, y, w, h) {
        super(x, y, w, h, 'DECISION\nDEVICE', null, true);
        this.input = new Point(this.cx - 7, this.cy + this.ch / 2);
        this.output = new Point(this.cx + this.cw + 7, this.cy + this.ch / 2);
        connectionNodes.push(this.input);
        connectionNodes.push(this.output);
    }

    draw() {
        super.draw();
        this.input.draw();
        this.output.draw();
    }
}

export class DD2 extends Block {
    constructor (x, y, w, h) {
        super(x, y, w, h, 'DEVICE\nDEVICE', null, true);
        this.input = new Point(this.cx - 7, this.cy + this.ch / 2);
        this.output = new Point(this.cx + this.cw + 7, this.cy + this.ch / 2);
        connectionNodes.push(this.input);
        connectionNodes.push(this.output);
    }

    draw() {
        super.draw();
        this.input.draw();
        this.output.draw();
    }
}

export class MUX extends Block {
    constructor (x, y, w, h) {
        super(x, y, w, h, 'MULTIPLEXER', null, true);
        this.input = new Point(this.cx - 7, this.cy + this.ch / 2);
        this.output = new Point(this.cx + this.cw + 7, this.cy + this.ch / 2);
        connectionNodes.push(this.input);
        connectionNodes.push(this.output);
    }

    draw() {
        super.draw();
        this.input.draw();
        this.output.draw();
    }
}

export class MOD extends Block {
    constructor (x, y, w, h) {
        super(x, y, w, h, 'MODULATION', null, true);
        this.input = new Point(this.cx - 7, this.cy + this.ch / 2);
        this.output = new Point(this.cx + this.cw + 7, this.cy + this.ch / 2);
        connectionNodes.push(this.input);
        connectionNodes.push(this.output);
    }

}

export class DEMOD extends Block {
    constructor (x, y, w, h) {
        super(x, y, w, h, 'DEMODULATION', null, true);
        this.input = new Point(this.cx - 7, this.cy + this.ch / 2);
        this.output = new Point(this.cx + this.cw + 7, this.cy + this.ch / 2);
        connectionNodes.push(this.input);
        connectionNodes.push(this.output);
    }

}

export class CORR extends Block {
    constructor (x, y, w, h) {
        super(x, y, w, h, 'CORRELATOR', null, true);
        this.input = new Point(this.cx - 7, this.cy + this.ch / 2);
        this.output = new Point(this.cx + this.cw + 7, this.cy + this.ch / 2);
        connectionNodes.push(this.input);
        connectionNodes.push(this.output);
    }

}

export class EMPTY extends Block {
    constructor (x, y, w, h) {
        super(x, y, w, h, '\n', null, true);
        this.input = new Point(this.cx - 7, this.cy + this.ch / 2);
        this.output = new Point(this.cx + this.cw + 7, this.cy + this.ch / 2);
        connectionNodes.push(this.input);
        connectionNodes.push(this.output);
    }

}


export class ROUTPUT extends Block {
    constructor (x, y, w, h) {
        super(x, y, w, h, 'DEMODULATED\nBPSK OUTPUT', null, true);
        this.input = new Point(this.cx - 7, this.cy + this.ch / 2);
        this.output = new Point(this.cx + this.cw + 7, this.cy + this.ch / 2);
        connectionNodes.push(this.input);
        connectionNodes.push(this.output);
    }
    doubleClickModal() { return 'reconWaveGraph'; }

    draw(highlight) {
        super.draw(highlight);
        this.input.draw();
        this.output.draw();
    }
}

export class OUTPUT extends Block {
    constructor (x, y, w, h) {
        super(x, y, w, h, 'MODULATED\nBPSK OUTPUT', null, true);
        this.input = new Point(this.cx - 7, this.cy + this.ch / 2);
        this.output = new Point(this.cx + this.cw + 7, this.cy + this.ch / 2);
        connectionNodes.push(this.input);
        connectionNodes.push(this.output);
    }

    doubleClickModal() { return 'encodedWaveGraph'; }

    draw(highlight) {
        super.draw(highlight);
        this.input.draw();
        this.output.draw();
    }
}

export class RSIG extends Block {
    constructor (x, y, w, h) {
        super(x, y, w, h, 'RECEIVED\nMODULATED\nBPSK SIGNAL', null, true);
        this.input = new Point(this.cx - 7, this.cy + this.ch / 2);
        this.output = new Point(this.cx + this.cw + 7, this.cy + this.ch / 2);
        connectionNodes.push(this.input);
        connectionNodes.push(this.output);
    }
    doubleClickModal() {
        return 'decoderWaveGraph';
    }

    draw(highlight) {
        super.draw(highlight);
        this.input.draw();
        this.output.draw();
    }
}