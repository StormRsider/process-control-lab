/**
 * Process Dynamics & Multi-Mode Controller Engine
 * Drastically distinct physical responses for ON/OFF, P, PI, PD, and PID modes.
 */

class SimulationEngine {
    constructor() {
        // Process Variable % (0 - 100%)
        this.flowPV = 0.0;
        this.flowActual = 0.0;
        this.setpoint = 50.0;          // Set point (SP) %
        this.controlOutput = 0.0;      // Controller Output (CO) %
        this.disturbancePct = 0.0;     // Disturbance %
        
        this.actuatorTau = 0.6;        // Process inertia time constant (seconds)

        // Controller Mode: 'ONOFF', 'P', 'PI', 'PD', 'PID'
        this.mode = 'ONOFF';

        // Controller internal terms
        this.integralTerm = 0.0;
        this.lastError = 0.0;
        this.filteredDerivative = 0.0;
        this.onoffState = false;

        // Time & Execution
        this.simTime = 0.0;
        this.isRunning = false;
        this.dt = 0.05;                // 20Hz update tick (50ms)

        // Metrics Tracking
        this.metrics = {
            riseTime: null,
            overshoot: 0,
            settlingTime: null,
            sse: 0,
            peakPV: 0,
            startTime: 0,
            initialPV: 0,
            targetSP: 50
        };

        this.listeners = [];
    }

    onUpdate(callback) {
        this.listeners.push(callback);
    }

    notifyUpdate() {
        const state = this.getState();
        this.listeners.forEach(cb => cb(state));
    }

    getState() {
        const error = this.setpoint - this.flowPV;
        return {
            time: this.simTime,
            flowPV: this.flowPV,
            setpoint: this.setpoint,
            error: error,
            controlOutput: this.controlOutput,
            disturbancePct: this.disturbancePct,
            mode: this.mode,
            isRunning: this.isRunning,
            metrics: this.metrics
        };
    }

    start() {
        this.isRunning = true;
        this.notifyUpdate();
    }

    pause() {
        this.isRunning = false;
        this.notifyUpdate();
    }

    reset() {
        this.flowPV = 0.0;
        this.flowActual = 0.0;
        this.controlOutput = 0.0;
        this.integralTerm = 0.0;
        this.lastError = 0.0;
        this.filteredDerivative = 0.0;
        this.onoffState = false;
        this.simTime = 0.0;
        this.resetMetrics();
        this.notifyUpdate();
    }

    resetMetrics() {
        this.metrics = {
            riseTime: null,
            overshoot: 0,
            settlingTime: null,
            sse: 0,
            peakPV: this.flowPV,
            startTime: this.simTime,
            initialPV: this.flowPV,
            targetSP: this.setpoint
        };
    }

    setSetpoint(sp) {
        this.setpoint = Math.max(20, Math.min(80, sp));
        this.resetMetrics();
    }

    setMode(mode) {
        this.mode = mode;
        this.integralTerm = 0.0;
        this.lastError = 0.0;
        this.filteredDerivative = 0.0;
        this.resetMetrics();
        this.notifyUpdate();
    }

    setDisturbance(dist) {
        this.disturbancePct = Math.max(0, Math.min(50, dist));
    }

    /**
     * 20Hz Simulation Step - Distinct Dynamics per Mode
     */
    step() {
        if (!this.isRunning) return;

        const error = this.setpoint - this.flowPV;

        switch (this.mode) {
            case 'ONOFF': {
                // Bang-Bang Control: Swings between 0% and 100%
                // Creates continuous limit-cycle flow oscillation
                const deadband = 2.5;
                if (error > deadband) {
                    this.controlOutput = 100.0;
                } else if (error < -deadband) {
                    this.controlOutput = 0.0;
                }
                break;
            }
            case 'P': {
                // Proportional Only: u = 32 + 1.25 * e
                // Fast response, but leaves a LARGE PERMANENT STEADY-STATE OFFSET (~14%)
                let u = 32.0 + (1.25 * error);
                this.controlOutput = Math.max(0, Math.min(100, u));
                break;
            }
            case 'PI': {
                // Proportional-Integral: Integral action steadily accumulates to drive error to EXACT ZERO
                const pTerm = 1.8 * error;
                this.integralTerm += 0.45 * error * this.dt;
                this.integralTerm = Math.max(-100, Math.min(100, this.integralTerm));
                
                let u = pTerm + this.integralTerm;
                this.controlOutput = Math.max(0, Math.min(100, u));
                break;
            }
            case 'PD': {
                // Proportional-Derivative: Derivative action damps rate of change (de/dt)
                // Prevents transient spikes, but retains P steady-state offset
                const pTerm = 1.25 * error;
                const dRaw = (error - this.lastError) / this.dt;
                this.filteredDerivative = 0.8 * this.filteredDerivative + 0.2 * dRaw;
                const dTerm = 2.8 * this.filteredDerivative;

                let u = 32.0 + pTerm + dTerm;
                this.controlOutput = Math.max(0, Math.min(100, u));
                this.lastError = error;
                break;
            }
            case 'PID': {
                // PID Optimal: Fast rise, zero steady-state offset, minimal overshoot
                const pTerm = 2.2 * error;
                this.integralTerm += 0.5 * error * this.dt;
                this.integralTerm = Math.max(-100, Math.min(100, this.integralTerm));

                const dRaw = (error - this.lastError) / this.dt;
                this.filteredDerivative = 0.8 * this.filteredDerivative + 0.2 * dRaw;
                const dTerm = 1.8 * this.filteredDerivative;

                let u = pTerm + this.integralTerm + dTerm;
                this.controlOutput = Math.max(0, Math.min(100, u));
                this.lastError = error;
                break;
            }
        }

        // 2. Process Lag & Inertia Integration
        const disturbanceFactor = 1.0 - (0.4 * (this.disturbancePct / 100.0));
        const targetPV = this.controlOutput * disturbanceFactor;

        const dPV_dt = (targetPV - this.flowActual) / this.actuatorTau;
        this.flowActual += dPV_dt * this.dt;
        this.flowActual = Math.max(0, Math.min(100, this.flowActual));

        // Add subtle sensor jitter
        const noise = (Math.random() - 0.5) * 0.15;
        this.flowPV = Math.max(0, Math.min(100, this.flowActual + noise));

        // 3. Time & Metrics Update
        this.simTime += this.dt;
        this.updateMetrics();

        this.notifyUpdate();
    }

    updateMetrics() {
        const m = this.metrics;
        const elap = this.simTime - m.startTime;
        const delta = m.targetSP - m.initialPV;

        if (Math.abs(delta) < 1.0) return;

        if (delta > 0 && this.flowPV > m.peakPV) m.peakPV = this.flowPV;
        else if (delta < 0 && this.flowPV < m.peakPV) m.peakPV = this.flowPV;

        const f90 = m.initialPV + 0.9 * delta;
        if (m.riseTime === null) {
            if ((delta > 0 && this.flowPV >= f90) || (delta < 0 && this.flowPV <= f90)) {
                m.riseTime = elap.toFixed(1);
            }
        }

        if (delta > 0) {
            m.overshoot = Math.max(0, ((m.peakPV - m.targetSP) / delta) * 100.0).toFixed(1);
        }

        if (Math.abs(this.flowPV - m.targetSP) <= 2.0) {
            if (m.settlingTime === null && elap > 1.0) {
                m.settlingTime = elap.toFixed(1);
            }
        } else {
            m.settlingTime = null;
        }

        m.sse = Math.abs(this.setpoint - this.flowPV).toFixed(1);
    }
}

const simEngine = new SimulationEngine();
