/**
 * Real-Time Chart Manager (Chart.js Light Theme)
 * Real-time engineering trend plot displaying SP, PV, and CO.
 */

class ChartManager {
    constructor() {
        this.chart = null;
        this.timeWindow = 60; // seconds
        this.dataSP = [];
        this.dataPV = [];
        this.dataCO = [];
        this.labels = [];
    }

    init() {
        const ctx = document.getElementById('liveTrendChart');
        if (!ctx) return;

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.labels,
                datasets: [
                    {
                        label: 'SP (Set Point)',
                        data: this.dataSP,
                        borderColor: '#2563eb',
                        borderWidth: 2,
                        borderDash: [6, 4],
                        pointRadius: 0,
                        fill: false
                    },
                    {
                        label: 'PV (Process Variable)',
                        data: this.dataPV,
                        borderColor: '#0d9488',
                        backgroundColor: 'rgba(13, 148, 136, 0.08)',
                        borderWidth: 2.5,
                        tension: 0.2,
                        pointRadius: 0,
                        fill: true
                    },
                    {
                        label: 'CO (Controller Output)',
                        data: this.dataCO,
                        borderColor: '#d97706',
                        borderWidth: 2,
                        tension: 0.05,
                        pointRadius: 0,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                scales: {
                    x: {
                        type: 'linear',
                        title: { display: true, text: 'Time (seconds)', color: '#64748b', font: { weight: '600' } },
                        grid: { color: '#f1f5f9' },
                        ticks: { color: '#64748b' }
                    },
                    y: {
                        min: 0,
                        max: 100,
                        title: { display: true, text: 'Signal Value (%)', color: '#0f172a', font: { weight: '700' } },
                        grid: { color: '#e2e8f0' },
                        ticks: { color: '#334155' }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: { mode: 'index', intersect: false }
                }
            }
        });

        simEngine.onUpdate((state) => {
            this.pushData(state);
        });
    }

    pushData(state) {
        if (!state.isRunning) return;

        const t = parseFloat(state.time.toFixed(1));
        
        if (this.labels.length > 0 && (t - this.labels[this.labels.length - 1]) < 0.15) {
            return;
        }

        this.labels.push(t);
        this.dataSP.push({ x: t, y: state.setpoint });
        this.dataPV.push({ x: t, y: state.flowPV });
        this.dataCO.push({ x: t, y: state.controlOutput });

        // Maintain Rolling Window
        const minTime = t - this.timeWindow;
        while (this.labels.length > 0 && this.labels[0] < minTime) {
            this.labels.shift();
            this.dataSP.shift();
            this.dataPV.shift();
            this.dataCO.shift();
        }

        if (this.chart) {
            const xMin = Math.max(0, minTime);
            const xMax = Math.max(this.timeWindow, t);

            this.chart.options.scales.x.min = xMin;
            this.chart.options.scales.x.max = xMax;
            this.chart.update('none');
        }
    }

    setTimeWindow(seconds) {
        this.timeWindow = seconds;
        const btns = document.querySelectorAll('.trend-controls .btn-xs');
        btns.forEach(b => {
            if (b.textContent.includes(seconds + 's')) {
                b.classList.add('active');
            } else if (!b.textContent.includes('Clear')) {
                b.classList.remove('active');
            }
        });
    }

    clearData() {
        this.labels.length = 0;
        this.dataSP.length = 0;
        this.dataPV.length = 0;
        this.dataCO.length = 0;

        if (this.chart) {
            this.chart.update();
        }
    }
}

const chartManager = new ChartManager();
