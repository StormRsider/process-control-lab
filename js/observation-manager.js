/**
 * Student Observation Manager
 * Records, manages, and exports student experiment trial results.
 */

class ObservationManager {
    constructor() {
        this.observations = [];
    }

    recordCurrentState() {
        const state = simEngine.getState();
        const obs = {
            id: this.observations.length + 1,
            mode: state.mode,
            kp: state.mode === 'ONOFF' ? '-' : state.Kp.toFixed(1),
            ti: (state.mode === 'PI' || state.mode === 'PID') ? state.Ti.toFixed(1) : '-',
            td: (state.mode === 'PD' || state.mode === 'PID') ? state.Td.toFixed(1) : '-',
            sp: state.setpoint.toFixed(1),
            pv: state.flowPV.toFixed(1),
            overshoot: state.metrics.overshoot || '0.0',
            settlingTime: state.metrics.settlingTime || 'N/A',
            sse: Math.abs(state.setpoint - state.flowPV).toFixed(1)
        };

        this.observations.push(obs);
        this.renderTable();
    }

    renderTable() {
        const tbody = document.getElementById('obsTableBody');
        if (!tbody) return;

        if (this.observations.length === 0) {
            tbody.innerHTML = '<tr><td colspan="11" class="text-center text-muted">No observations recorded yet. Run simulation and click "Record Current Result".</td></tr>';
            return;
        }

        let html = '';
        this.observations.forEach((o, idx) => {
            html += `
            <tr>
                <td>${idx + 1}</td>
                <td><span class="value-badge badge-blue">${o.mode}</span></td>
                <td>${o.kp}</td>
                <td>${o.ti}</td>
                <td>${o.td}</td>
                <td class="val-blue">${o.sp}%</td>
                <td class="val-teal">${o.pv}%</td>
                <td>${o.overshoot}%</td>
                <td>${o.settlingTime}</td>
                <td>${o.sse}%</td>
                <td>
                    <button class="btn btn-outline btn-xs" onclick="observationManager.deleteRow(${idx})">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </td>
            </tr>
            `;
        });

        tbody.innerHTML = html;
    }

    deleteRow(index) {
        this.observations.splice(index, 1);
        this.renderTable();
    }

    clearObservations() {
        this.observations = [];
        this.renderTable();
    }

    exportCSV() {
        if (this.observations.length === 0) {
            alert('No observations recorded yet. Run the experiment and click "Record Current Result"!');
            return;
        }

        let csv = 'Trial,Controller,Kp,Ti(s),Td(s),SetPoint(%),Final_PV(%),Overshoot(%),SettlingTime(s),SteadyStateError(%)\n';
        this.observations.forEach((o, idx) => {
            csv += `${idx + 1},${o.mode},${o.kp},${o.ti},${o.td},${o.sp},${o.pv},${o.overshoot},${o.settlingTime},${o.sse}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', `Process_Control_Observations_${Date.now()}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}

const observationManager = new ObservationManager();
