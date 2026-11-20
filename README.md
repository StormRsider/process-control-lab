# Process Control Lab — Flow Process Control Virtual Laboratory
### Department of Electronics and Instrumentation Engineering

An interactive, modern Virtual Laboratory (V-Lab) web application simulating the physical **Vi Microsystems (VFPA-201CE) Flow Process Control Trainer**.

Developed for engineering students to study, wire, and analyze the dynamic responses of **ON/OFF, Proportional (P), Proportional-Integral (PI), Proportional-Derivative (PD), and PID** controllers on a closed-loop liquid flow process in real time.

---

## 🌟 Key Features

1. **Interactive Signal Wiring System**:
   - **Banana Jack Patching**: Connect green Controller Output (`CO`) banana jacks, blue Process Variable (`PV`) banana jacks, and Set Point (`SP`) input.
   - **Drag & Drop + Click-to-Connect**: Freely drag flexible patch cables across terminals with real-time Bezier droop and magnetic snapping, or click terminal-to-terminal.
   - **Loop Integrity Validation**: The simulation strictly verifies that the feedback loop is closed before starting, reinforcing fundamental control theory.
   - **Auto Wiring & Reset**: One-click automatic wiring for rapid demonstration.

2. **Real-Time Dynamic Process Simulation**:
   - Continuous differential equation physics engine running at 20 Hz (50 ms steps).
   - Distinct, realistic controller behaviors:
     - **ON/OFF**: Sustained limit cycle flow oscillations with configurable differential gap.
     - **P (Proportional)**: Rapid rise time with a permanent steady-state offset (~14%).
     - **PI (Proportional-Integral)**: Integral accumulation eliminates steady-state offset ($e_{ss} = 0$).
     - **PD (Proportional-Derivative)**: Anticipatory derivative damping against rate-of-change surges.
     - **PID (Optimal)**: Balanced tuning with minimal overshoot, fast settling, and zero offset.

3. **High-Fidelity Physical Trainer Graphics**:
   - Exact replication of the physical **VFPA-201CE** trainer panel with corner mounting bolts and silkscreen piping.
   - **Bourdon Pressure Gauges ($G_1$ & $G_2$)**: Dual-ring chrome bezels and white dials with PSI graduations. $G_2$'s needle dynamically responds to 3–15 PSI pneumatic actuator pressure.
   - **Glass Rotameter ($FI$)**: Tapered borosilicate glass tube with dynamic red float bead elevation matching measured flow.
   - **Centrifugal Pump**: Animated spinning 4-vane impeller synchronized with pump state.
   - **Bypass Valve ($HV1$)**: Interactive manual hand valve to inject recirculation load disturbances.
   - **Reservoir Tank**: Acrylic water sump tank with fluid fill gradient and return lines.

4. **Real-Time Rolling Trend Plot**:
   - High-contrast, hardware-accelerated trend chart tracking **SP (Set Point)**, **PV (Process Variable)**, and **CO (Controller Output)** with 30s / 60s rolling windows.

5. **6 Comprehensive Academic Modules**:
   - **1. Experiment**: Main interactive simulation and wiring board.
   - **2. Apparatus**: Illustrated engineering breakdown of all 11 physical trainer components.
   - **3. Theory**: College-level control principles, feedback loop diagrams, and LaTeX PID equations.
   - **4. Procedure**: Interactive checklist of step-by-step laboratory instructions.
   - **5. Observations**: Experimental data log recording rise time, overshoot, settling time, and steady-state error with one-click **CSV export**.
   - **6. Viva / Quiz**: 10-question concept verification quiz with immediate feedback and scoring.

---

## 🚀 How to Run & Share

### Option 1: Direct Browser Launch (No Installation Required)
Simply double-click `index.html` or drag it into any web browser (Chrome, Edge, Firefox, Safari). The entire simulation runs 100% client-side with zero external build dependencies!

### Option 2: Local HTTP Server
Run a lightweight local server:
```bash
# Using Python
python -m http.server 8080

# Or using Node.js
npx serve .
```
Then navigate to `http://localhost:8080`.

### Option 3: GitHub Pages (Shareable Live Link)
To share this lab as a live clickable link with friends and classmates:
1. Push this repository to GitHub.
2. In your GitHub repository, go to **Settings** → **Pages**.
3. Under **Branch**, select `main` (root) and click **Save**.
4. GitHub will give you a live URL (e.g., `https://<username>.github.io/<repo-name>/`) that anyone can open on mobile or desktop!

---

## 📁 Project Structure

```
flow-level-vlab/
│
├── index.html                  # Main application structure & 6 academic tabs
├── README.md                   # Project documentation & usage guide
│
├── css/
│   └── styles.css              # Light academic styling, SVG rules & UI components
│
└── js/
    ├── app.js                  # Application orchestrator, tabs & checklists
    ├── chart-manager.js        # Real-time Chart.js rolling trend plot manager
    ├── observation-manager.js  # Experimental observations logger & CSV export
    ├── quiz.js                 # Viva voce questions, scoring & explanations
    ├── schematic-render.js     # High-fidelity SVG plant renderer & instruments
    ├── simulation-engine.js    # Multi-mode process dynamics & PID physics engine
    └── wiring-system.js        # Drag-and-drop & click-to-connect wiring engine
```

---

## 🎓 Department & Credits

- **Course**: Process Control & Instrumentation Laboratory
- **Department**: Department of Electronics and Instrumentation Engineering
- **Apparatus Reference**: Vi Microsystems VFPA-201CE Flow Process Controller
- **Author**: Engineered by Adil
