/**
 * Interactive Signal Wiring System - Drag-and-Drop & Click-to-Connect
 * 100% faithful to the physical VFPA-201CE Flow Process Controller board.
 * Allows users to either DRAG cables between terminals or CLICK terminal-to-terminal.
 */

class WiringSystem {
    constructor() {
        this.loopStatus = {
            co: false,
            pv: false,
            sp: false
        };

        this.activeConnections = [];
        this.selectedTerminal = null;

        // Absolute coordinates of terminals in SVG viewBox coordinates (0 to 780, 0 to 490)
        this.terminals = {
            // --- CO Loop ---
            'CO_JACK_LEFT': { 
                x: 288, y: 72, 
                label: 'CO Green Jack (to I/P)', 
                loop: 'co', 
                color: '#16a34a' 
            },
            'CO_JACK_RIGHT': { 
                x: 332, y: 72, 
                label: 'CO Green Jack (from FIC)', 
                loop: 'co', 
                color: '#16a34a' 
            },
            'CV_IN': { 
                x: 253, y: 127, 
                label: 'I/P Transducer (CO In)', 
                loop: 'co', 
                color: '#16a34a' 
            },
            'FIC_CO_OUT': { 
                x: 440, y: 72, 
                label: 'FIC Controller (CO Out)', 
                loop: 'co', 
                color: '#16a34a' 
            },

            // --- PV Loop ---
            'PV_JACK_TOP': { 
                x: 458, y: 134, 
                label: 'PV Blue Jack (to FIC)', 
                loop: 'pv', 
                color: '#2563eb' 
            },
            'PV_JACK_BOTTOM': { 
                x: 458, y: 168, 
                label: 'PV Blue Jack (from FT)', 
                loop: 'pv', 
                color: '#2563eb' 
            },
            'FT_PV_OUT': { 
                x: 458, y: 202, 
                label: 'Flow Transmitter FT (PV Out)', 
                loop: 'pv', 
                color: '#2563eb' 
            },
            'FIC_PV_IN': { 
                x: 458, y: 90, 
                label: 'FIC Controller (PV In)', 
                loop: 'pv', 
                color: '#2563eb' 
            },

            // --- SP Loop ---
            'SP_OUT': { 
                x: 590, y: 72, 
                label: 'SP Set Point Source', 
                loop: 'sp', 
                color: '#0d9488' 
            },
            'FIC_SP_IN': { 
                x: 476, y: 72, 
                label: 'FIC Controller (SP In)', 
                loop: 'sp', 
                color: '#0d9488' 
            }
        };

        // Drag & Drop State
        this.isPointerDown = false;
        this.isDragging = false;
        this.dragStartTerm = null;
        this.dragStartPos = { x: 0, y: 0 };
        this.dragCurrentPos = { x: 0, y: 0 };
        this.hoveredSnapTerm = null;
        this.dragDistanceThreshold = 6;

        this.listeners = [];
        this.eventsInitialized = false;
    }

    init() {
        this.initEvents();
    }

    initEvents() {
        if (this.eventsInitialized) return;
        const svg = document.getElementById('schematicSvg');
        if (!svg) return;

        svg.addEventListener('pointerdown', (e) => this.onPointerDown(e));
        window.addEventListener('pointermove', (e) => this.onPointerMove(e));
        window.addEventListener('pointerup', (e) => this.onPointerUp(e));
        window.addEventListener('pointercancel', (e) => this.onPointerCancel(e));

        this.eventsInitialized = true;
    }

    getSVGPoint(e) {
        const svg = document.getElementById('schematicSvg');
        if (!svg) return { x: e.clientX, y: e.clientY };
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const ctm = svg.getScreenCTM();
        if (!ctm) return { x: e.clientX, y: e.clientY };
        const transformed = pt.matrixTransform(ctm.inverse());
        return { x: transformed.x, y: transformed.y };
    }

    findNearestTerminal(svgP, maxDist = 26) {
        let nearest = null;
        let minDist = maxDist;

        for (const [id, t] of Object.entries(this.terminals)) {
            const d = Math.hypot(svgP.x - t.x, svgP.y - t.y);
            if (d < minDist) {
                minDist = d;
                nearest = id;
            }
        }

        // Special zone detection for FIC Controller bubble (x: 458, y: 72, radius: 24)
        if (!nearest) {
            const distToFIC = Math.hypot(svgP.x - 458, svgP.y - 72);
            if (distToFIC <= 24) {
                // If dragging from SP, route to FIC_SP_IN
                if (this.dragStartTerm && this.terminals[this.dragStartTerm].loop === 'sp') {
                    return 'FIC_SP_IN';
                }
                // If dragging from PV, route to FIC_PV_IN
                if (this.dragStartTerm && this.terminals[this.dragStartTerm].loop === 'pv') {
                    return 'FIC_PV_IN';
                }
                return 'FIC_SP_IN';
            }
        }

        return nearest;
    }

    onPointerDown(e) {
        const svgP = this.getSVGPoint(e);
        
        // Find if user pressed on or near a terminal
        let termId = null;
        const targetElem = e.target.closest('[data-term]');
        if (targetElem) {
            termId = targetElem.getAttribute('data-term');
        } else {
            termId = this.findNearestTerminal(svgP, 26);
        }

        if (!termId) return;

        e.preventDefault();
        this.isPointerDown = true;
        this.isDragging = false;
        this.dragStartTerm = termId;
        this.dragStartPos = svgP;
        this.dragCurrentPos = svgP;
        this.hoveredSnapTerm = null;

        this.highlightTerminal(termId, true);
    }

    onPointerMove(e) {
        if (!this.isPointerDown || !this.dragStartTerm) return;

        const svgP = this.getSVGPoint(e);
        const dist = Math.hypot(svgP.x - this.dragStartPos.x, svgP.y - this.dragStartPos.y);

        if (dist > this.dragDistanceThreshold) {
            this.isDragging = true;
            this.dragCurrentPos = svgP;

            // Check if hovering near a candidate destination terminal
            const candidate = this.findNearestTerminal(svgP, 28);
            if (candidate && candidate !== this.dragStartTerm) {
                const t1 = this.terminals[this.dragStartTerm];
                const t2 = this.terminals[candidate];
                if (t1.loop === t2.loop) {
                    this.hoveredSnapTerm = candidate;
                    this.dragCurrentPos = { x: t2.x, y: t2.y };
                    this.highlightTerminal(candidate, true);
                } else {
                    this.hoveredSnapTerm = null;
                }
            } else {
                if (this.hoveredSnapTerm) {
                    this.highlightTerminal(this.hoveredSnapTerm, false);
                    this.hoveredSnapTerm = null;
                }
            }

            this.renderDragWire();
        }
    }

    onPointerUp(e) {
        if (!this.isPointerDown) return;

        const svgP = this.getSVGPoint(e);
        const startTerm = this.dragStartTerm;
        const wasDragging = this.isDragging;

        this.isPointerDown = false;
        this.isDragging = false;
        this.removeDragWire();

        if (wasDragging) {
            // Drag and drop completed
            let targetTerm = this.hoveredSnapTerm || this.findNearestTerminal(svgP, 28);

            this.highlightTerminal(startTerm, false);
            if (this.hoveredSnapTerm) {
                this.highlightTerminal(this.hoveredSnapTerm, false);
            }

            if (targetTerm && targetTerm !== startTerm) {
                this.attemptConnection(startTerm, targetTerm);
            } else {
                this.updateHeaderStatusPill();
            }
        } else {
            // Clean click (no drag)
            this.highlightTerminal(startTerm, false);
            this.handleTerminalClick(startTerm);
        }

        this.dragStartTerm = null;
        this.hoveredSnapTerm = null;
    }

    onPointerCancel(e) {
        if (this.dragStartTerm) {
            this.highlightTerminal(this.dragStartTerm, false);
        }
        if (this.hoveredSnapTerm) {
            this.highlightTerminal(this.hoveredSnapTerm, false);
        }
        this.isPointerDown = false;
        this.isDragging = false;
        this.dragStartTerm = null;
        this.hoveredSnapTerm = null;
        this.removeDragWire();
    }

    renderDragWire() {
        const dragLayer = document.getElementById('svgLiveDragLayer');
        if (!dragLayer || !this.dragStartTerm) return;

        const t1 = this.terminals[this.dragStartTerm];
        const p2 = this.dragCurrentPos;

        // Dynamic Bezier with natural cable droop
        const dx = p2.x - t1.x;
        const dy = p2.y - t1.y;
        const dist = Math.hypot(dx, dy);
        const sag = Math.min(45, dist * 0.35);

        const cx1 = t1.x + dx * 0.35;
        const cy1 = t1.y + dy * 0.35 + sag;
        const cx2 = p2.x - dx * 0.35;
        const cy2 = p2.y - dy * 0.35 + sag;

        const pathD = `M ${t1.x} ${t1.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p2.x} ${p2.y}`;

        dragLayer.innerHTML = `
            <!-- Live Wire Outer Glow -->
            <path d="${pathD}" fill="none" stroke="${t1.color}" stroke-width="8" stroke-opacity="0.25" stroke-linecap="round" />
            <!-- Live Wire Cable Core -->
            <path d="${pathD}" fill="none" stroke="${t1.color}" stroke-width="3.8" stroke-linecap="round" />
            <!-- Highlight Ribbon -->
            <path d="${pathD}" fill="none" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="4,6" />
            
            <!-- Origin Plug Cap -->
            <circle cx="${t1.x}" cy="${t1.y}" r="6" fill="#334155" stroke="${t1.color}" stroke-width="1.8" />
            
            <!-- Mouse Cursor Banana Plug Tip -->
            <circle cx="${p2.x}" cy="${p2.y}" r="7" fill="#334155" stroke="${t1.color}" stroke-width="2" />
            <circle cx="${p2.x}" cy="${p2.y}" r="3" fill="#f8fafc" />
        `;
    }

    removeDragWire() {
        const dragLayer = document.getElementById('svgLiveDragLayer');
        if (dragLayer) dragLayer.innerHTML = '';
    }

    onLoopStateChange(callback) {
        this.listeners.push(callback);
    }

    notifyLoopState() {
        const isComplete = this.isLoopComplete();
        this.listeners.forEach(cb => cb(isComplete));
        this.updateHeaderStatusPill();
    }

    isLoopComplete() {
        return this.loopStatus.co && this.loopStatus.pv && this.loopStatus.sp;
    }

    getCompletedLoopsCount() {
        let count = 0;
        if (this.loopStatus.co) count++;
        if (this.loopStatus.pv) count++;
        if (this.loopStatus.sp) count++;
        return count;
    }

    updateHeaderStatusPill() {
        const pill = document.getElementById('simStatusPill');
        const pillText = document.getElementById('simStatusText');
        const alertBox = document.getElementById('wiringAlertBox');
        const alertText = document.getElementById('wiringAlertText');

        const count = this.getCompletedLoopsCount();
        const isComplete = this.isLoopComplete();

        if (isComplete) {
            if (pill) {
                pill.className = simEngine.isRunning ? 'sim-status-pill running' : 'sim-status-pill ready';
                pillText.textContent = simEngine.isRunning ? 'Simulation Running' : 'Simulation Ready';
            }
            if (alertBox && alertText) {
                alertBox.className = 'wiring-alert-box valid';
                alertText.innerHTML = '<i class="fa-solid fa-circle-check"></i> Control Loop Complete! All 3 signal circuits wired. You may start simulation.';
            }
        } else {
            if (pill) {
                pill.className = 'sim-status-pill pending';
                pillText.textContent = count === 0 ? 'Wiring Incomplete (0/3)' : `Wiring (${count}/3 Loops)`;
            }
            if (alertBox && alertText) {
                alertBox.className = 'wiring-alert-box';
                let missing = [];
                if (!this.loopStatus.co) missing.push('CO Green Jacks');
                if (!this.loopStatus.pv) missing.push('PV Blue Jacks');
                if (!this.loopStatus.sp) missing.push('SP to FIC');
                alertText.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Incomplete: Connect <strong>${missing.join(', ')}</strong> (drag wire or click).`;
            }
        }
    }

    handleTerminalClick(termId) {
        if (!this.terminals[termId]) return;

        if (!this.selectedTerminal) {
            this.selectedTerminal = termId;
            this.highlightTerminal(termId, true);
            this.showConnectingGuidance(termId);
        } else if (this.selectedTerminal === termId) {
            this.highlightTerminal(termId, false);
            this.selectedTerminal = null;
            this.updateHeaderStatusPill();
        } else {
            const from = this.selectedTerminal;
            const to = termId;

            this.highlightTerminal(from, false);
            this.selectedTerminal = null;

            this.attemptConnection(from, to);
        }
    }

    showConnectingGuidance(termId) {
        const term = this.terminals[termId];
        const alertBox = document.getElementById('wiringAlertBox');
        const alertText = document.getElementById('wiringAlertText');
        if (alertBox && alertText) {
            alertBox.className = 'wiring-alert-box';
            let targetTip = '';
            if (term.loop === 'co') {
                targetTip = 'Drag or click to the other Green Banana Jack (or I/P / FIC) to complete CO circuit.';
            } else if (term.loop === 'pv') {
                targetTip = 'Drag or click to the other Blue Banana Jack (or FT / FIC) to complete PV circuit.';
            } else if (term.loop === 'sp') {
                targetTip = 'Drag or click to the FIC controller to complete Set Point circuit.';
            }
            alertText.innerHTML = `<i class="fa-solid fa-hand-pointer"></i> Selected <strong>${term.label}</strong>. ${targetTip}`;
        }
    }

    attemptConnection(from, to) {
        const t1 = this.terminals[from];
        const t2 = this.terminals[to];

        if (!t1 || !t2) return;

        // Check if both terminals belong to the same loop
        if (t1.loop === t2.loop && from !== to) {
            const loop = t1.loop;
            this.loopStatus[loop] = true;

            // Normalize connection pair to render standard physical patch lead
            let renderFrom = from;
            let renderTo = to;

            if (loop === 'co') {
                renderFrom = 'CO_JACK_LEFT';
                renderTo = 'CO_JACK_RIGHT';
            } else if (loop === 'pv') {
                renderFrom = 'PV_JACK_TOP';
                renderTo = 'PV_JACK_BOTTOM';
            } else if (loop === 'sp') {
                renderFrom = 'SP_OUT';
                renderTo = 'FIC_SP_IN';
            }

            // Avoid duplicate active connections
            const exists = this.activeConnections.some(c => 
                (c.from === renderFrom && c.to === renderTo) || (c.from === renderTo && c.to === renderFrom)
            );
            if (!exists) {
                this.activeConnections.push({ from: renderFrom, to: renderTo, loop });
            }

            this.renderWires();
            this.notifyLoopState();
        } else {
            this.flashInvalidConnection(from, to);
        }
    }

    renderWires() {
        const wiresLayer = document.getElementById('svgPermanentWires');
        if (!wiresLayer) return;

        let html = '';

        this.activeConnections.forEach((conn) => {
            const t1 = this.terminals[conn.from];
            const t2 = this.terminals[conn.to];
            if (!t1 || !t2) return;

            let pathD = '';
            let pulseDur = '1.4s';

            if (conn.loop === 'co') {
                // Curved downward arch between the two green banana jacks matching physical panel jumper arc
                pathD = `M ${t1.x} ${t1.y} C ${t1.x + 4} ${t1.y + 28}, ${t2.x - 4} ${t2.y + 28}, ${t2.x} ${t2.y}`;
            } else if (conn.loop === 'pv') {
                // Curved arch to the left between top and bottom blue banana jacks matching physical panel jumper arc
                pathD = `M ${t1.x} ${t1.y} C ${t1.x - 28} ${t1.y + 4}, ${t2.x - 28} ${t2.y - 4}, ${t2.x} ${t2.y}`;
            } else {
                // Set point line from SP to FIC
                const midX = (t1.x + t2.x) / 2;
                pathD = `M ${t1.x} ${t1.y} C ${midX} ${t1.y - 14}, ${midX} ${t2.y - 14}, ${t2.x} ${t2.y}`;
            }

            html += `
                <!-- Cable Outer Shadow -->
                <path d="${pathD}" fill="none" stroke="#0f172a" stroke-width="8" stroke-opacity="0.12" stroke-linecap="round" />
                <!-- Cable Body -->
                <path d="${pathD}" fill="none" stroke="${t1.color}" stroke-width="3.8" stroke-linecap="round" />
                <!-- Cable Highlight Rib -->
                <path d="${pathD}" fill="none" stroke="#ffffff" stroke-width="1.2" stroke-opacity="0.6" stroke-linecap="round" stroke-dasharray="4,6" />
                
                <!-- Banana Plug Ends at Sockets -->
                <circle cx="${t1.x}" cy="${t1.y}" r="5.5" fill="#334155" stroke="${t1.color}" stroke-width="2" />
                <circle cx="${t2.x}" cy="${t2.y}" r="5.5" fill="#334155" stroke="${t2.color}" stroke-width="2" />

                <!-- Active Signal Motion Pulse -->
                <circle r="4" fill="#ffffff" stroke="${t1.color}" stroke-width="1.5">
                    <animateMotion path="${pathD}" dur="${pulseDur}" repeatCount="indefinite" />
                </circle>
            `;
        });

        wiresLayer.innerHTML = html;
        this.updateTerminalNodesUI();
        this.updateActiveSignalTraces();
    }

    updateActiveSignalTraces() {
        const coTrace = document.getElementById('boardTrace_CO');
        if (coTrace) {
            coTrace.setAttribute('stroke', this.loopStatus.co ? '#16a34a' : '#1d4ed8');
            coTrace.setAttribute('stroke-width', this.loopStatus.co ? '2.4' : '1.8');
        }

        const pvTrace = document.getElementById('boardTrace_PV');
        if (pvTrace) {
            pvTrace.setAttribute('stroke', this.loopStatus.pv ? '#2563eb' : '#1d4ed8');
            pvTrace.setAttribute('stroke-width', this.loopStatus.pv ? '2.4' : '1.8');
        }

        const spTrace = document.getElementById('boardTrace_SP');
        if (spTrace) {
            spTrace.setAttribute('stroke', this.loopStatus.sp ? '#0d9488' : '#1d4ed8');
            spTrace.setAttribute('stroke-width', this.loopStatus.sp ? '2.4' : '1.8');
        }
    }

    updateTerminalNodesUI() {
        Object.keys(this.terminals).forEach(id => {
            const nodeElem = document.getElementById(`termRing_${id}`);
            if (nodeElem) {
                const term = this.terminals[id];
                const isConnected = this.loopStatus[term.loop];
                if (isConnected) {
                    nodeElem.setAttribute('stroke', '#16a34a');
                    nodeElem.setAttribute('stroke-width', '2.5');
                    nodeElem.setAttribute('stroke-opacity', '0.9');
                } else {
                    nodeElem.setAttribute('stroke', '#ffffff');
                    nodeElem.setAttribute('stroke-width', '1.5');
                    nodeElem.setAttribute('stroke-opacity', '0.6');
                }
            }
        });
    }

    highlightTerminal(termId, isHighlighted) {
        const nodeElem = document.getElementById(`termRing_${termId}`);
        if (nodeElem) {
            if (isHighlighted) {
                nodeElem.setAttribute('stroke', '#d97706');
                nodeElem.setAttribute('stroke-width', '4');
                nodeElem.setAttribute('stroke-opacity', '1');
            } else {
                const term = this.terminals[termId];
                const isConnected = this.loopStatus[term.loop];
                nodeElem.setAttribute('stroke', isConnected ? '#16a34a' : '#ffffff');
                nodeElem.setAttribute('stroke-width', isConnected ? '2.5' : '1.5');
            }
        }
    }

    flashInvalidConnection(from, to) {
        const alertBox = document.getElementById('wiringAlertBox');
        const alertText = document.getElementById('wiringAlertText');

        if (alertBox && alertText) {
            alertBox.className = 'wiring-alert-box';
            alertText.innerHTML = `<i class="fa-solid fa-circle-xmark" style="color: #dc2626;"></i> Incompatible signal circuits: <strong>${this.terminals[from].label}</strong> cannot connect to <strong>${this.terminals[to].label}</strong>.`;
            
            setTimeout(() => {
                this.updateHeaderStatusPill();
            }, 3000);
        }
    }

    clearConnections() {
        this.activeConnections = [];
        this.selectedTerminal = null;
        this.loopStatus = { co: false, pv: false, sp: false };
        this.removeDragWire();
        this.renderWires();
        this.notifyLoopState();
    }

    autoConnect() {
        this.activeConnections = [
            { from: 'CO_JACK_LEFT', to: 'CO_JACK_RIGHT', loop: 'co' },
            { from: 'PV_JACK_TOP', to: 'PV_JACK_BOTTOM', loop: 'pv' },
            { from: 'SP_OUT', to: 'FIC_SP_IN', loop: 'sp' }
        ];
        this.loopStatus = { co: true, pv: true, sp: true };
        this.selectedTerminal = null;
        this.removeDragWire();
        this.renderWires();
        this.notifyLoopState();
    }
}

const wiringManager = new WiringSystem();
