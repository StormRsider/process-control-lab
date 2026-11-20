/**
 * Main Application Orchestrator & UI Controller
 * Clean Light Academic Theme - Simplified Controller Mode Selection
 */

class VLabApp {
    constructor() {
        this.simInterval = null;
    }

    init() {
        console.log("%c Process Control Lab • Dept. of Electronics & Instrumentation %c Made by Adil ", "background: #0d9488; color: #fff; padding: 3px 6px; border-radius: 3px 0 0 3px; font-weight: bold;", "background: #f1f5f9; color: #0f172a; padding: 3px 6px; border-radius: 0 3px 3px 0; border: 1px solid #cbd5e1; font-weight: 600;");

        schematicRenderer.init();
        chartManager.init();
        quizEngine.init();

        this.renderApparatusCards();
        this.renderProcedureSteps();

        this.bindEvents();
        this.bindWiringListener();

        this.updateUIFromEngine(simEngine.getState());
        this.startSimLoop();
    }

    bindEvents() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-tab');
                this.switchTab(targetTab);
            });
        });
    }

    switchTab(tabId) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            if (btn.getAttribute('data-tab') === tabId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        document.querySelectorAll('.tab-panel').forEach(panel => {
            if (panel.id === tabId) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });
    }

    bindWiringListener() {
        wiringManager.onLoopStateChange((isComplete) => {
            const pill = document.getElementById('simStatusPill');
            const pillText = document.getElementById('simStatusText');
            const alertBox = document.getElementById('wiringAlertBox');
            const alertText = document.getElementById('wiringAlertText');

            if (isComplete) {
                if (pill) {
                    pill.className = 'sim-status-pill ready';
                    pillText.textContent = 'Simulation Ready';
                }
                if (alertBox) {
                    alertBox.className = 'wiring-alert-box valid';
                    alertText.textContent = 'Control loop signal wiring complete! You may start simulation.';
                }
            } else {
                if (simEngine.isRunning) {
                    stopSimulation();
                }
                if (pill) {
                    pill.className = 'sim-status-pill pending';
                    pillText.textContent = 'Wiring Incomplete';
                }
                if (alertBox) {
                    alertBox.className = 'wiring-alert-box';
                    alertText.textContent = 'Complete control loop signal wiring to enable simulation.';
                }
            }
        });

        simEngine.onUpdate((state) => {
            this.updateUIFromEngine(state);
        });
    }

    startSimLoop() {
        if (this.simInterval) clearInterval(this.simInterval);
        this.simInterval = setInterval(() => {
            simEngine.step();
        }, 50);
    }

    updateUIFromEngine(state) {
        const readoutSP = document.getElementById('readoutSP');
        const readoutPV = document.getElementById('readoutPV');
        const readoutCO = document.getElementById('readoutCO');
        const readoutError = document.getElementById('readoutError');
        const readoutStatus = document.getElementById('readoutStatus');

        if (readoutSP) readoutSP.textContent = state.setpoint.toFixed(1) + ' %';
        if (readoutPV) readoutPV.textContent = state.flowPV.toFixed(1) + ' %';
        if (readoutCO) readoutCO.textContent = state.controlOutput.toFixed(1) + ' %';
        if (readoutError) readoutError.textContent = state.error.toFixed(1) + ' %';

        if (readoutStatus) {
            if (!state.isRunning) {
                readoutStatus.textContent = wiringManager.isLoopComplete() ? 'Ready to Start' : 'Loop Open / Idle';
                readoutStatus.style.color = '#64748b';
            } else {
                const absErr = Math.abs(state.error);
                if (state.mode === 'ONOFF') {
                    readoutStatus.textContent = 'Limit Cycle Oscillating';
                    readoutStatus.style.color = '#d97706';
                } else if (state.mode === 'P' || state.mode === 'PD') {
                    readoutStatus.textContent = `Steady State Offset (${absErr.toFixed(1)}%)`;
                    readoutStatus.style.color = '#d97706';
                } else if (absErr <= 1.5) {
                    readoutStatus.textContent = 'Steady State Reached (0% Offset)';
                    readoutStatus.style.color = '#059669';
                } else {
                    readoutStatus.textContent = 'PV Approaching Set Point';
                    readoutStatus.style.color = '#0d9488';
                }
            }
        }

        const statusPump = document.getElementById('statusPump');
        const statusValve = document.getElementById('statusValve');
        const statusFlow = document.getElementById('statusFlow');
        const statusFT = document.getElementById('statusFT');
        const statusController = document.getElementById('statusController');
        const statusSimState = document.getElementById('statusSimState');

        if (statusPump) statusPump.textContent = state.isRunning ? 'ON' : 'OFF';
        if (statusValve) statusValve.textContent = state.controlOutput.toFixed(1) + ' %';
        if (statusFlow) statusFlow.textContent = (state.flowPV * 0.5).toFixed(1) + ' L/min';
        if (statusFT) statusFT.textContent = (state.flowPV * 0.5).toFixed(1) + ' L/min';
        if (statusController) statusController.textContent = state.mode;
        if (statusSimState) statusSimState.textContent = state.isRunning ? 'RUNNING' : 'STOPPED';

        const btnStart = document.getElementById('btnStartSim');
        const btnStop = document.getElementById('btnStopSim');
        const pill = document.getElementById('simStatusPill');
        const pillText = document.getElementById('simStatusText');

        if (state.isRunning) {
            if (btnStart) btnStart.classList.add('hidden');
            if (btnStop) btnStop.classList.remove('hidden');
            if (pill) {
                pill.className = 'sim-status-pill running';
                pillText.textContent = 'Simulation Running';
            }
        } else {
            if (btnStart) btnStart.classList.remove('hidden');
            if (btnStop) btnStop.classList.add('hidden');
            if (pill && wiringManager.isLoopComplete()) {
                pill.className = 'sim-status-pill ready';
                pillText.textContent = 'Simulation Ready';
            }
        }
    }

    renderApparatusCards() {
        const grid = document.getElementById('apparatusCardsGrid');
        if (!grid) return;

        const items = [
            { name: 'Air Input Supply', icon: 'fa-wind', desc: 'Main pneumatic air line supplying clean compressed air at 30–60 PSI.', func: 'Provides actuation energy for pneumatic control valve.' },
            { name: 'Air Regulator (AR)', icon: 'fa-gauge-high', desc: 'Precision pressure regulator with filter bowl.', func: 'Regulates raw supply air down to 20 PSI.' },
            { name: 'Pressure Indicators (G1 & G2)', icon: 'fa-gauge', desc: 'Analog Bourdon pressure gauges G1 (supply) and G2 (actuator).', func: 'Indicates air pressure (3–15 PSI) fed to the control valve diaphragm.' },
            { name: 'I/P Converter', icon: 'fa-microchip', desc: 'Current-to-Pressure electro-pneumatic transducer.', func: 'Translates 4–20 mA electrical Controller Output into 3–15 PSI pneumatic valve pressure.' },
            { name: 'Flow Control Valve (CV)', icon: 'fa-sliders', desc: 'Pneumatic diaphragm-operated globe control valve.', func: 'Throttles water discharge flow rate in response to pneumatic pressure signal.' },
            { name: 'Flow Transmitter (FT)', icon: 'fa-satellite-dish', desc: 'In-line differential pressure / turbine flow transmitter.', func: 'Measures pipeline flow rate and transmits 4-20mA PV signal to controller.' },
            { name: 'Rotameter (FI)', icon: 'fa-glass-water', desc: 'Tapered glass variable-area flowmeter tube with calibrated float.', func: 'Provides direct visual indication of flow in L/min.' },
            { name: 'Bypass Hand Valve (HV1)', icon: 'fa-faucet-drip', desc: 'Manual recirculation bypass valve branching back to reservoir.', func: 'Simulates a demand load disturbance by diverting liquid away from main line.' },
            { name: 'Centrifugal Pump', icon: 'fa-bolt', desc: 'Electric motor-driven centrifugal water pump.', func: 'Draws water from reservoir tank and pressurizes supply pipe.' },
            { name: 'Reservoir Tank', icon: 'fa-box-archive', desc: 'Open water sump reservoir tank.', func: 'Holds recycled water supply for continuous circulation.' },
            { name: 'Process Controller (FIC)', icon: 'fa-brain', desc: 'Digital Process Indicating Controller with green CO and blue PV jacks.', func: 'Computes ON/OFF, P, PI, PD, or PID feedback algorithm.' }
        ];

        let html = '';
        items.forEach(item => {
            html += `
            <div class="app-item-card">
                <div class="app-item-icon"><i class="fa-solid ${item.icon}"></i></div>
                <h3>${item.name}</h3>
                <p>${item.desc}</p>
                <div class="app-item-func"><i class="fa-solid fa-circle-check"></i> ${item.func}</div>
            </div>
            `;
        });

        grid.innerHTML = html;
    }

    renderProcedureSteps() {
        const container = document.getElementById('procedureList');
        if (!container) return;

        const steps = [
            "Switch on the virtual process power supply.",
            "Identify the process instruments (Pump, Rotameter, Control Valve, FT, Controller).",
            "Click banana jacks to connect required signal wires (Green CO Jacks, Blue PV Jacks, SP to FIC).",
            "Verify that the control loop status indicates 'Simulation Ready'.",
            "Select the desired controller mode (ON/OFF, P, PI, PD, or PID).",
            "Set the desired Flow Set Point target (30%, 50%, or 70%).",
            "Click 'Start Simulation' to initiate real-time loop operation.",
            "Observe SP, PV, and CO curves updating continuously on the real-time trend plot.",
            "Test disturbance rejection by clicking 'Inject Bypass Disturbance (HV1)'.",
            "Record experimental trials into the Observations table.",
            "Click 'Stop Simulation' and reset the experiment upon completion."
        ];

        let html = '';
        steps.forEach((st, idx) => {
            html += `
            <div class="proc-step-item" onclick="toggleStepCheckbox(${idx})">
                <input type="checkbox" class="proc-step-checkbox" id="chkStep_${idx}">
                <span class="proc-step-num">Step ${idx + 1}.</span>
                <span class="proc-step-text">${st}</span>
            </div>
            `;
        });

        container.innerHTML = html;
    }
}

const app = new VLabApp();
document.addEventListener('DOMContentLoaded', () => app.init());

// Global Helper Handlers
function switchTab(tabId) {
    app.switchTab(tabId);
}

function setControllerMode(mode) {
    simEngine.setMode(mode);

    const modes = ['ONOFF', 'P', 'PI', 'PD', 'PID'];
    modes.forEach(m => {
        const btn = document.getElementById('btnMode' + m);
        if (btn) {
            if (m === mode) btn.classList.add('active');
            else btn.classList.remove('active');
        }
    });

    const eduTitle = document.getElementById('eduTitle');
    const eduText = document.getElementById('eduText');

    if (eduTitle && eduText) {
        switch (mode) {
            case 'ONOFF':
                eduTitle.textContent = 'ON/OFF Control Mode';
                eduText.textContent = 'ON/OFF control switches output fully between 0% and 100%, causing continuous limit cycle flow oscillations around setpoint.';
                break;
            case 'P':
                eduTitle.textContent = 'Proportional (P) Control Mode';
                eduText.textContent = 'Proportional control responds directly to current error. It achieves fast response but leaves a prominent, permanent steady-state offset (~14%).';
                break;
            case 'PI':
                eduTitle.textContent = 'Proportional-Integral (PI) Control Mode';
                eduText.textContent = 'Integral action accumulates past error over time, completely eliminating steady-state offset and driving PV to 100% match SP.';
                break;
            case 'PD':
                eduTitle.textContent = 'Proportional-Derivative (PD) Control Mode';
                eduText.textContent = 'Derivative action responds to rate of change (de/dt) to damp transient surges, but retains steady-state offset.';
                break;
            case 'PID':
                eduTitle.textContent = 'PID Optimal Control Mode';
                eduText.textContent = 'Combines proportional, integral, and derivative actions for fast rise time, zero steady-state offset, and smooth settling.';
                break;
        }
    }

    chartManager.clearData();
}

function setSetpointPreset(val) {
    simEngine.setSetpoint(val);
    const btns = document.querySelectorAll('.sp-btn-row .btn');
    btns.forEach(b => {
        if (b.textContent.includes(val + ' %')) {
            b.classList.add('active');
        } else {
            b.classList.remove('active');
        }
    });
    chartManager.clearData();
}

function toggleDisturbance() {
    const btn = document.getElementById('btnToggleDisturbance');
    if (simEngine.disturbancePct === 0) {
        simEngine.setDisturbance(30);
        if (btn) {
            btn.className = 'btn btn-primary btn-sm';
            btn.innerHTML = '<i class="fa-solid fa-faucet-drip"></i> Close Bypass Valve (HV1)';
        }
    } else {
        simEngine.setDisturbance(0);
        if (btn) {
            btn.className = 'btn btn-secondary btn-sm';
            btn.innerHTML = '<i class="fa-solid fa-faucet-drip"></i> Open Bypass Valve (HV1 Disturbance)';
        }
    }
    schematicRenderer.renderDiagram(simEngine.getState());
}

function startSimulation() {
    if (!wiringManager.isLoopComplete()) {
        alert('Complete the control loop before starting the simulation.');
        return;
    }
    simEngine.start();
}

function stopSimulation() {
    simEngine.pause();
}

function resetSimulation() {
    simEngine.reset();
    chartManager.clearData();
}

function toggleStepCheckbox(idx) {
    const chk = document.getElementById(`chkStep_${idx}`);
    if (chk) chk.checked = !chk.checked;
}
