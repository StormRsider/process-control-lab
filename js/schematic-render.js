/**
 * Schematic & Plant Visualizer Renderer - High-Fidelity Academic Trainer Edition
 * 100% faithful to the physical VFPA-201CE Flow Process Controller board.
 * Equipped with generous terminal hit areas, drag-and-drop wire support,
 * realistic Bourdon gauges, glass rotameter with dynamic float, and spinning pump.
 */

class SchematicRenderer {
    constructor() {
        this.container = null;
    }

    init() {
        this.container = document.getElementById('svgContainer');
        this.renderDiagram(simEngine.getState());

        simEngine.onUpdate((state) => {
            this.updateVisualizer(state);
        });
    }

    renderDiagram(state) {
        if (!this.container) return;

        // Dynamic rotameter float elevation based on actual flow PV
        // Float moves between y = -15 (0%) to y = -41 (100%) inside the tapered tube
        const floatY = -15 - (state.flowPV / 100.0) * 26;
        const isBypassActive = state.disturbancePct > 0;

        // G2 gauge needle rotation based on Controller Output (3 - 15 PSI)
        const g2Angle = -40 + (state.controlOutput / 100.0) * 85;

        const svgHTML = `
        <svg id="schematicSvg" viewBox="0 0 780 490" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <!-- Water gradient for reservoir -->
                <linearGradient id="tankWaterGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.3" />
                    <stop offset="100%" stop-color="#0284c7" stop-opacity="0.6" />
                </linearGradient>

                <!-- Bezel gradient for pressure gauges -->
                <linearGradient id="gaugeBezelGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#f8fafc" />
                    <stop offset="50%" stop-color="#cbd5e1" />
                    <stop offset="100%" stop-color="#94a3b8" />
                </linearGradient>

                <!-- Rotameter glass tube gradient -->
                <linearGradient id="glassTubeGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
                    <stop offset="20%" stop-color="#e0f2fe" stop-opacity="0.5" />
                    <stop offset="80%" stop-color="#bae6fd" stop-opacity="0.4" />
                    <stop offset="100%" stop-color="#ffffff" stop-opacity="0.9" />
                </linearGradient>

                <!-- Panel Corner Bolt Pattern -->
                <g id="cornerBolt">
                    <circle cx="0" cy="0" r="4.5" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1" />
                    <line x1="-2.5" y1="0" x2="2.5" y2="0" stroke="#64748b" stroke-width="1" />
                    <line x1="0" y1="-2.5" x2="0" y2="2.5" stroke="#64748b" stroke-width="1" />
                </g>
            </defs>

            <!-- ======================================================== -->
            <!-- PHYSICAL LABORATORY TRAINER PANEL BOARD BASE             -->
            <!-- ======================================================== -->
            <rect x="14" y="12" width="752" height="466" rx="12" fill="#0f172a" fill-opacity="0.04" />
            <rect x="12" y="10" width="756" height="470" rx="10" fill="#ffffff" stroke="#1d4ed8" stroke-width="2.8" />

            <!-- 4 Corner Mounting Screws/Bolts -->
            <use href="#cornerBolt" x="26" y="24" />
            <use href="#cornerBolt" x="754" y="24" />
            <use href="#cornerBolt" x="26" y="466" />
            <use href="#cornerBolt" x="754" y="466" />

            <!-- Title Header in Bold Red -->
            <text x="390" y="34" fill="#dc2626" font-size="14" font-family="'Inter', system-ui, sans-serif" font-weight="800" text-anchor="middle" letter-spacing="0.5">PROCESS CONTROL LAB — FLOW CONTROLLER (VFPA-201CE)</text>

            <!-- Bottom Department Label in Red -->
            <text x="390" y="470" fill="#dc2626" font-size="11" font-family="'Inter', system-ui, sans-serif" font-weight="700" text-anchor="middle" letter-spacing="0.3">Department of Electronics and Instrumentation Engineering</text>

            <!-- SIGNAL WIRES LAYER (Dynamic Bezier curves + Live Dragging Wire) -->
            <g id="svgWiresLayer">
                <g id="svgPermanentWires"></g>
                <g id="svgLiveDragLayer"></g>
            </g>

            <!-- ======================================================== -->
            <!-- SECTION 1: PNEUMATIC AIR LINE, AR, G1, I/P, G2, CV       -->
            <!-- ======================================================== -->

            <!-- Air Input Point (Left) -->
            <circle cx="55" cy="145" r="5" fill="#1d4ed8" stroke="#ffffff" stroke-width="1.5" />
            <text x="55" y="164" fill="#1d4ed8" font-size="9" font-weight="700" text-anchor="middle">AIR</text>
            <text x="55" y="175" fill="#1d4ed8" font-size="9" font-weight="700" text-anchor="middle">INPUT</text>

            <!-- Pneumatic Line from Air Input to AR with hash marks -->
            <path d="M 60 145 L 124 145" stroke="#1d4ed8" stroke-width="2.2" />
            <line x1="86" y1="138" x2="93" y2="152" stroke="#1d4ed8" stroke-width="1.6" />
            <line x1="91" y1="138" x2="98" y2="152" stroke="#1d4ed8" stroke-width="1.6" />

            <!-- Air Regulator (AR) -->
            <g transform="translate(135, 145)">
                <polygon points="-11,-7 -11,7 0,0" fill="#ffffff" stroke="#1d4ed8" stroke-width="1.8" />
                <polygon points="11,-7 11,7 0,0" fill="#ffffff" stroke="#1d4ed8" stroke-width="1.8" />
                <line x1="0" y1="0" x2="0" y2="-12" stroke="#1d4ed8" stroke-width="1.8" />
                <path d="M -10 -20 L 10 -20 L 0 -12 Z" fill="#ffffff" stroke="#1d4ed8" stroke-width="1.5" />
                <line x1="-12" y1="-26" x2="6" y2="-12" stroke="#1d4ed8" stroke-width="1.6" />
                <text x="0" y="18" fill="#1d4ed8" font-size="9" font-weight="700" text-anchor="middle">AR</text>
            </g>

            <!-- Line AR to G1 branch -->
            <path d="M 146 145 L 175 145" stroke="#1d4ed8" stroke-width="2.2" />

            <!-- Pressure Gauge G1 (PI) -->
            <g transform="translate(175, 145)">
                <line x1="0" y1="0" x2="0" y2="-27" stroke="#1d4ed8" stroke-width="1.8" />
                <line x1="-4" y1="-14" x2="4" y2="-8" stroke="#1d4ed8" stroke-width="1.5" />
                <circle cx="0" cy="-40" r="14" fill="url(#gaugeBezelGrad)" stroke="#1d4ed8" stroke-width="1.8" />
                <circle cx="0" cy="-40" r="11" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
                <line x1="-8" y1="-37" x2="-6" y2="-38" stroke="#64748b" stroke-width="1" />
                <line x1="0" y1="-49" x2="0" y2="-47" stroke="#64748b" stroke-width="1" />
                <line x1="8" y1="-37" x2="6" y2="-38" stroke="#64748b" stroke-width="1" />
                <line x1="0" y1="-40" x2="5" y2="-47" stroke="#dc2626" stroke-width="1.5" stroke-linecap="round" />
                <circle cx="0" cy="-40" r="2" fill="#0f172a" />
                <text x="0" y="-57" fill="#1d4ed8" font-size="9" font-weight="700" text-anchor="middle">G1</text>
                <text x="0" y="-33" fill="#1d4ed8" font-size="7.5" font-weight="700" text-anchor="middle">PI</text>
            </g>

            <!-- Line G1 to I/P Converter with hash marks -->
            <path d="M 175 145 L 235 145" stroke="#1d4ed8" stroke-width="2.2" />
            <line x1="202" y1="138" x2="209" y2="152" stroke="#1d4ed8" stroke-width="1.6" />
            <line x1="207" y1="138" x2="214" y2="152" stroke="#1d4ed8" stroke-width="1.6" />

            <!-- I/P Converter -->
            <g transform="translate(235, 127)">
                <rect x="0" y="0" width="36" height="36" rx="2" fill="#ffffff" stroke="#1d4ed8" stroke-width="2" />
                <line x1="0" y1="36" x2="36" y2="0" stroke="#1d4ed8" stroke-width="1.6" />
                <text x="8" y="16" fill="#1d4ed8" font-size="10.5" font-weight="800">I</text>
                <text x="21" y="28" fill="#1d4ed8" font-size="10.5" font-weight="800">P</text>
                <path d="M 14 -7 L 18 0 L 22 -7" fill="none" stroke="#1d4ed8" stroke-width="1.8" stroke-linejoin="round" />

                <!-- Hit target on top of I/P converter -->
                <g class="term-target" data-term="CV_IN" style="cursor: grab;">
                    <circle cx="18" cy="0" r="15" fill="transparent" />
                    <circle id="termRing_CV_IN" cx="18" cy="0" r="7" fill="transparent" stroke="#ffffff" stroke-width="1.5" />
                </g>
            </g>

            <!-- Line I/P to G2 branch with hash marks -->
            <path d="M 271 145 L 325 145" stroke="#1d4ed8" stroke-width="2.2" />
            <line x1="293" y1="138" x2="300" y2="152" stroke="#1d4ed8" stroke-width="1.6" />
            <line x1="298" y1="138" x2="305" y2="152" stroke="#1d4ed8" stroke-width="1.6" />

            <!-- Pressure Gauge G2 (PI) with Dynamic Needle -->
            <g transform="translate(325, 145)">
                <line x1="0" y1="0" x2="0" y2="-27" stroke="#1d4ed8" stroke-width="1.8" />
                <line x1="-4" y1="-14" x2="4" y2="-8" stroke="#1d4ed8" stroke-width="1.5" />
                <circle cx="0" cy="-40" r="14" fill="url(#gaugeBezelGrad)" stroke="#1d4ed8" stroke-width="1.8" />
                <circle cx="0" cy="-40" r="11" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
                <line x1="-8" y1="-37" x2="-6" y2="-38" stroke="#64748b" stroke-width="1" />
                <line x1="0" y1="-49" x2="0" y2="-47" stroke="#64748b" stroke-width="1" />
                <line x1="8" y1="-37" x2="6" y2="-38" stroke="#64748b" stroke-width="1" />
                <g id="svgG2Needle" transform="rotate(${g2Angle}, 0, -40)">
                    <line x1="0" y1="-40" x2="0" y2="-49" stroke="#dc2626" stroke-width="1.6" stroke-linecap="round" />
                </g>
                <circle cx="0" cy="-40" r="2" fill="#0f172a" />
                <text x="0" y="-57" fill="#1d4ed8" font-size="9" font-weight="700" text-anchor="middle">G2</text>
                <text x="0" y="-33" fill="#1d4ed8" font-size="7.5" font-weight="700" text-anchor="middle">PI</text>
            </g>

            <!-- Pneumatic line past G2 continuing right then turning down to CV dome -->
            <path d="M 325 145 L 365 145 L 365 203" fill="none" stroke="#1d4ed8" stroke-width="2.2" stroke-linejoin="round" />
            <line x1="342" y1="138" x2="349" y2="152" stroke="#1d4ed8" stroke-width="1.6" />
            <line x1="347" y1="138" x2="354" y2="152" stroke="#1d4ed8" stroke-width="1.6" />

            <!-- CONTROL VALVE (CV) in Process Pipe -->
            <g transform="translate(365, 215)">
                <path d="M -14 -8 Q 0 -20 14 -8 Z" fill="#ffffff" stroke="#1d4ed8" stroke-width="2" />
                <line x1="-14" y1="-8" x2="14" y2="-8" stroke="#1d4ed8" stroke-width="1.8" />
                <line x1="0" y1="-8" x2="0" y2="0" stroke="#1d4ed8" stroke-width="2" />
                <polygon points="-11,-7 -11,7 0,0" fill="#ffffff" stroke="#1d4ed8" stroke-width="1.8" />
                <polygon points="11,-7 11,7 0,0" fill="#ffffff" stroke="#1d4ed8" stroke-width="1.8" />
                <text x="0" y="20" fill="#1d4ed8" font-size="9" font-weight="700" text-anchor="middle">CV</text>
            </g>

            <!-- ======================================================== -->
            <!-- SECTION 2: CO & PV BANANA TERMINAL JACKS & FIC           -->
            <!-- ======================================================== -->

            <!-- CO Green Terminal Jacks Box -->
            <g transform="translate(266, 50)">
                <rect x="0" y="0" width="88" height="44" rx="8" fill="#f8fafc" stroke="#1d4ed8" stroke-width="2" />
                <text x="44" y="-7" fill="#1d4ed8" font-size="10" font-weight="800" text-anchor="middle">CO</text>
                
                <!-- Green Banana Jack 1 (Left: to I/P) -->
                <g class="term-target" data-term="CO_JACK_LEFT" style="cursor: grab;">
                    <!-- Generous invisible hit zone -->
                    <circle cx="22" cy="22" r="16" fill="transparent" />
                    <!-- Visual 3D Socket -->
                    <circle cx="22" cy="22" r="10" fill="#16a34a" stroke="#15803d" stroke-width="1.8" />
                    <circle cx="22" cy="22" r="5.5" fill="#14532d" stroke="#166534" stroke-width="1" />
                    <circle cx="22" cy="22" r="2.8" fill="#022c22" />
                    <circle id="termRing_CO_JACK_LEFT" cx="22" cy="22" r="8" fill="transparent" stroke="#ffffff" stroke-width="1.5" />
                </g>

                <!-- Green Banana Jack 2 (Right: from FIC) -->
                <g class="term-target" data-term="CO_JACK_RIGHT" style="cursor: grab;">
                    <!-- Generous invisible hit zone -->
                    <circle cx="66" cy="22" r="16" fill="transparent" />
                    <!-- Visual 3D Socket -->
                    <circle cx="66" cy="22" r="10" fill="#16a34a" stroke="#15803d" stroke-width="1.8" />
                    <circle cx="66" cy="22" r="5.5" fill="#14532d" stroke="#166534" stroke-width="1" />
                    <circle cx="66" cy="22" r="2.8" fill="#022c22" />
                    <circle id="termRing_CO_JACK_RIGHT" cx="66" cy="22" r="8" fill="transparent" stroke="#ffffff" stroke-width="1.5" />
                </g>

                <!-- Printed Curved Dashed Jumper Arc under jacks -->
                <path d="M 22 32 Q 44 48 66 32" fill="none" stroke="#1d4ed8" stroke-width="1.8" stroke-dasharray="3,2" />
            </g>

            <!-- Printed Dashed Line from Left Green Jack down-left to I/P Converter -->
            <path id="boardTrace_CO" d="M 288 72 L 253 72 L 253 127" fill="none" stroke="#1d4ed8" stroke-width="1.8" stroke-dasharray="4,3" />

            <!-- Printed Dashed Line from Right Green Jack right to FIC -->
            <path d="M 332 72 L 440 72" fill="none" stroke="#1d4ed8" stroke-width="1.8" stroke-dasharray="4,3" />

            <!-- FIC Controller Circle -->
            <g transform="translate(458, 72)">
                <circle cx="0" cy="0" r="18" fill="#ffffff" stroke="#1d4ed8" stroke-width="2.2" />
                <text x="0" y="4" fill="#1d4ed8" font-size="10.5" font-weight="800" text-anchor="middle">FIC</text>

                <!-- Arrowhead from SP into right of FIC -->
                <path d="M 12 -4 L 18 0 L 12 4" fill="none" stroke="#1d4ed8" stroke-width="1.8" transform="rotate(180 18 0)" />

                <!-- Terminal Node: FIC_SP_IN -->
                <g class="term-target" data-term="FIC_SP_IN" style="cursor: grab;">
                    <!-- Generous invisible hit zone -->
                    <circle cx="18" cy="0" r="16" fill="transparent" />
                    <circle id="termRing_FIC_SP_IN" cx="18" cy="0" r="6.5" fill="#0d9488" stroke="#ffffff" stroke-width="1.5" />
                </g>

                <!-- Arrowhead from PV into bottom of FIC -->
                <path d="M -4 14 L 0 18 L 4 14" fill="none" stroke="#1d4ed8" stroke-width="1.8" transform="rotate(180 0 18)" />

                <!-- Terminal Node: FIC_PV_IN -->
                <g class="term-target" data-term="FIC_PV_IN" style="cursor: grab;">
                    <!-- Generous invisible hit zone -->
                    <circle cx="0" cy="18" r="16" fill="transparent" />
                    <circle id="termRing_FIC_PV_IN" cx="0" cy="18" r="6.5" fill="#2563eb" stroke="#ffffff" stroke-width="1.5" />
                </g>
            </g>

            <!-- SP Input Line with 3 dots into FIC from the right -->
            <path id="boardTrace_SP" d="M 590 72 L 476 72" fill="none" stroke="#1d4ed8" stroke-width="2" />
            <circle cx="505" cy="72" r="3" fill="#1d4ed8" />
            <circle cx="535" cy="72" r="3" fill="#1d4ed8" />
            <circle cx="565" cy="72" r="3" fill="#1d4ed8" />
            <text x="610" y="76" fill="#1d4ed8" font-size="11" font-weight="800" class="term-target" data-term="SP_OUT" style="cursor: grab;">SP</text>

            <!-- Terminal Node: SP_OUT (Absolute coordinates: 590, 72) -->
            <g class="term-target" data-term="SP_OUT" style="cursor: grab;">
                <!-- Generous invisible hit zone (r=20) -->
                <circle cx="590" cy="72" r="20" fill="transparent" />
                <circle cx="590" cy="72" r="5" fill="#1d4ed8" stroke="#ffffff" stroke-width="1.5" />
                <circle id="termRing_SP_OUT" cx="590" cy="72" r="8" fill="transparent" stroke="#0d9488" stroke-width="2" />
            </g>

            <!-- Printed Dashed Line from FIC down into PV Box -->
            <path id="boardTrace_PV" d="M 458 90 L 458 116" fill="none" stroke="#1d4ed8" stroke-width="1.8" stroke-dasharray="4,3" />

            <!-- PV Blue Terminal Jacks Box (Vertical) -->
            <g transform="translate(434, 116)">
                <rect x="0" y="0" width="48" height="70" rx="8" fill="#f8fafc" stroke="#1d4ed8" stroke-width="2" />
                <text x="24" y="-7" fill="#1d4ed8" font-size="10" font-weight="800" text-anchor="middle">PV</text>

                <!-- Blue Banana Jack 1 (Top: to FIC) -->
                <g class="term-target" data-term="PV_JACK_TOP" style="cursor: grab;">
                    <!-- Generous invisible hit zone -->
                    <circle cx="24" cy="18" r="16" fill="transparent" />
                    <!-- Visual 3D Socket -->
                    <circle cx="24" cy="18" r="10" fill="#2563eb" stroke="#1d4ed8" stroke-width="1.8" />
                    <circle cx="24" cy="18" r="5.5" fill="#1e3a8a" stroke="#1e40af" stroke-width="1" />
                    <circle cx="24" cy="18" r="2.8" fill="#0f172a" />
                    <circle id="termRing_PV_JACK_TOP" cx="24" cy="18" r="8" fill="transparent" stroke="#ffffff" stroke-width="1.5" />
                </g>

                <!-- Blue Banana Jack 2 (Bottom: from FT) -->
                <g class="term-target" data-term="PV_JACK_BOTTOM" style="cursor: grab;">
                    <!-- Generous invisible hit zone -->
                    <circle cx="24" cy="52" r="16" fill="transparent" />
                    <!-- Visual 3D Socket -->
                    <circle cx="24" cy="52" r="10" fill="#2563eb" stroke="#1d4ed8" stroke-width="1.8" />
                    <circle cx="24" cy="52" r="5.5" fill="#1e3a8a" stroke="#1e40af" stroke-width="1" />
                    <circle cx="24" cy="52" r="2.8" fill="#0f172a" />
                    <circle id="termRing_PV_JACK_BOTTOM" cx="24" cy="52" r="8" fill="transparent" stroke="#ffffff" stroke-width="1.5" />
                </g>

                <!-- Printed Curved Dashed Jumper Arc to the left -->
                <path d="M 0 18 Q -16 35 0 52" fill="none" stroke="#1d4ed8" stroke-width="1.8" stroke-dasharray="3,2" />
            </g>

            <!-- Printed Dashed Line from bottom of PV Box down into FT -->
            <path d="M 458 186 L 458 202" fill="none" stroke="#1d4ed8" stroke-width="1.8" stroke-dasharray="4,3" />
            <path d="M 454 192 L 458 186 L 462 192" fill="none" stroke="#1d4ed8" stroke-width="1.8" stroke-linejoin="round" />

            <!-- ======================================================== -->
            <!-- SECTION 3: HYDRAULIC PIPING LOOP, PUMP, ROTAMETER, BYPASS -->
            <!-- ======================================================== -->

            <!-- RESERVOIR TANK (Bottom Right) -->
            <g transform="translate(485, 360)">
                <path d="M -8 0 L 0 0 M 100 0 L 108 0" stroke="#1d4ed8" stroke-width="2.2" />
                <rect x="0" y="0" width="100" height="55" rx="2" fill="url(#tankWaterGrad)" stroke="#1d4ed8" stroke-width="2.2" />
                <line x1="12" y1="18" x2="38" y2="18" stroke="#1d4ed8" stroke-width="1.5" stroke-dasharray="4,3" />
                <line x1="48" y1="18" x2="85" y2="18" stroke="#1d4ed8" stroke-width="1.5" stroke-dasharray="4,3" />
                <line x1="20" y1="28" x2="55" y2="28" stroke="#1d4ed8" stroke-width="1.5" stroke-dasharray="4,3" />
                <line x1="65" y1="28" x2="90" y2="28" stroke="#1d4ed8" stroke-width="1.5" stroke-dasharray="4,3" />
                <line x1="10" y1="38" x2="45" y2="38" stroke="#1d4ed8" stroke-width="1.5" stroke-dasharray="4,3" />
                <line x1="55" y1="38" x2="80" y2="38" stroke="#1d4ed8" stroke-width="1.5" stroke-dasharray="4,3" />
                <text x="50" y="70" fill="#1d4ed8" font-size="9" font-weight="700" text-anchor="middle">RESERVOIR TANK</text>
            </g>

            <!-- Suction line: Reservoir Tank bottom left to Pump -->
            <path d="M 485 415 L 105 415" fill="none" stroke="#1d4ed8" stroke-width="2.4" />
            <path d="M 400 411 L 400 415 L 406 415" fill="none" stroke="#1d4ed8" stroke-width="1.6" />
            <path d="M 240 411 L 240 415 L 246 415" fill="none" stroke="#1d4ed8" stroke-width="1.6" />

            <!-- PUMP (Bottom Left) -->
            <g transform="translate(105, 415)">
                <circle cx="0" cy="0" r="16" fill="#ffffff" stroke="#1d4ed8" stroke-width="2.2" />
                <path d="M 8 0 L 16 0 L 16 -12 L 0 -12" fill="#ffffff" stroke="#1d4ed8" stroke-width="1.6" />
                <line x1="-13" y1="16" x2="13" y2="16" stroke="#1d4ed8" stroke-width="2.2" />
                
                <!-- Rotating Impeller -->
                <g id="svgPumpImpeller">
                    <line x1="-8" y1="0" x2="8" y2="0" stroke="#1d4ed8" stroke-width="2" />
                    <line x1="0" y1="-8" x2="0" y2="8" stroke="#1d4ed8" stroke-width="2" />
                </g>
                <text x="-28" y="4" fill="#1d4ed8" font-size="9" font-weight="700" text-anchor="middle">PUMP</text>
            </g>

            <!-- Discharge line upwards from Pump to Rotameter -->
            <path d="M 105 403 L 105 260" stroke="#1d4ed8" stroke-width="2.4" />
            <path d="M 101 375 L 105 375 L 105 369" fill="none" stroke="#1d4ed8" stroke-width="1.6" />

            <!-- BYPASS RECIRCULATION LINE (HV1) -->
            <g>
                <path d="M 105 345 L 515 345 L 515 375" fill="none" stroke="#1d4ed8" stroke-width="${isBypassActive ? '2.8' : '2.2'}" stroke-linejoin="round" />
                <path d="M 210 341 L 210 345 L 216 345" fill="none" stroke="#1d4ed8" stroke-width="1.6" />
                <path d="M 430 341 L 430 345 L 436 345" fill="none" stroke="#1d4ed8" stroke-width="1.6" />
                <path d="M 511 365 L 515 365 L 515 371" fill="none" stroke="#1d4ed8" stroke-width="1.6" />

                <!-- Manual Bypass Hand Valve HV1 -->
                <g transform="translate(320, 345)" style="cursor: pointer;" onclick="toggleDisturbance()" title="Click to toggle Bypass Valve (Recirculation load disturbance)">
                    <polygon points="-11,-7 -11,7 0,0" fill="${isBypassActive ? '#fed7aa' : '#ffffff'}" stroke="#1d4ed8" stroke-width="1.8" />
                    <polygon points="11,-7 11,7 0,0" fill="${isBypassActive ? '#fed7aa' : '#ffffff'}" stroke="#1d4ed8" stroke-width="1.8" />
                    <line x1="0" y1="0" x2="0" y2="-10" stroke="#1d4ed8" stroke-width="1.8" />
                    <line x1="-9" y1="-10" x2="9" y2="-10" stroke="#1d4ed8" stroke-width="2.4" />
                    <text x="0" y="-14" fill="#1d4ed8" font-size="9" font-weight="700" text-anchor="middle">HV1</text>
                </g>
            </g>

            <!-- ROTAMETER (FI) on vertical pipe -->
            <g transform="translate(105, 260)">
                <circle cx="0" cy="0" r="13" fill="#ffffff" stroke="#1d4ed8" stroke-width="2.2" />
                <text x="0" y="4" fill="#1d4ed8" font-size="9.5" font-weight="800" text-anchor="middle">FI</text>

                <!-- Tapered Borosilicate Glass Metering Tube -->
                <polygon points="-9,-13 9,-13 14,-45 -14,-45" fill="url(#glassTubeGrad)" stroke="#1d4ed8" stroke-width="2" />
                <line x1="-8" y1="-21" x2="-3" y2="-21" stroke="#1d4ed8" stroke-width="1" />
                <line x1="-9" y1="-29" x2="-3" y2="-29" stroke="#1d4ed8" stroke-width="1" />
                <line x1="-11" y1="-37" x2="-3" y2="-37" stroke="#1d4ed8" stroke-width="1" />

                <!-- Dynamic Red Float Bead -->
                <circle id="svgRotameterFloat" cx="0" cy="${floatY}" r="5" fill="#dc2626" stroke="#ffffff" stroke-width="1.2" />

                <text x="35" y="-24" fill="#1d4ed8" font-size="11" font-weight="800" letter-spacing="0.5">ROTAMETER</text>
            </g>

            <!-- Main Process Pipe: From top of Rotameter (105, 215) across to CV (354, 215) -->
            <path d="M 105 215 L 354 215" fill="none" stroke="#1d4ed8" stroke-width="2.4" stroke-linejoin="round" />
            <path d="M 230 211 L 230 215 L 236 215" fill="none" stroke="#1d4ed8" stroke-width="1.6" />

            <!-- Pipe from CV (376, 215) to Flow Transmitter FT (450, 215) -->
            <path d="M 376 215 L 450 215" fill="none" stroke="#1d4ed8" stroke-width="2.4" />
            <path d="M 410 211 L 410 215 L 416 215" fill="none" stroke="#1d4ed8" stroke-width="1.6" />

            <!-- FLOW TRANSMITTER (FT) in Process Pipe -->
            <g transform="translate(458, 215)">
                <line x1="-8" y1="-8" x2="-8" y2="8" stroke="#1d4ed8" stroke-width="2" />
                <line x1="8" y1="-8" x2="8" y2="8" stroke="#1d4ed8" stroke-width="2" />
                <line x1="-6" y1="8" x2="-6" y2="24" stroke="#1d4ed8" stroke-width="1.5" stroke-dasharray="3,2" />
                <line x1="6" y1="8" x2="6" y2="24" stroke="#1d4ed8" stroke-width="1.5" stroke-dasharray="3,2" />
                <circle cx="0" cy="-13" r="13" fill="#ffffff" stroke="#1d4ed8" stroke-width="2.2" />
                <text x="0" y="-9" fill="#1d4ed8" font-size="9" font-weight="800" text-anchor="middle">FT</text>

                <!-- Hit target on FT -->
                <g class="term-target" data-term="FT_PV_OUT" style="cursor: grab;">
                    <circle cx="0" cy="-13" r="16" fill="transparent" />
                    <circle id="termRing_FT_PV_OUT" cx="0" cy="-13" r="7" fill="transparent" stroke="#ffffff" stroke-width="1.5" />
                </g>
            </g>

            <!-- Return discharge line from FT to Reservoir Tank -->
            <path d="M 466 215 L 550 215 L 550 375" fill="none" stroke="#1d4ed8" stroke-width="2.4" stroke-linejoin="round" />
            <path d="M 505 211 L 505 215 L 511 215" fill="none" stroke="#1d4ed8" stroke-width="1.6" />
            <path d="M 546 300 L 550 300 L 550 306" fill="none" stroke="#1d4ed8" stroke-width="1.6" />
            <path d="M 545 370 L 550 376 L 555 370" fill="none" stroke="#1d4ed8" stroke-width="2" stroke-linejoin="round" />
        </svg>
        `;

        this.container.innerHTML = svgHTML;
        wiringManager.init();
        wiringManager.renderWires();
    }

    updateVisualizer(state) {
        const floatObj = document.getElementById('svgRotameterFloat');
        if (floatObj) {
            const floatOffset = -15 - (state.flowPV / 100.0) * 26;
            floatObj.setAttribute('cy', floatOffset);
        }

        const g2Needle = document.getElementById('svgG2Needle');
        if (g2Needle) {
            const g2Angle = -40 + (state.controlOutput / 100.0) * 85;
            g2Needle.setAttribute('transform', `rotate(${g2Angle}, 0, -40)`);
        }

        const impeller = document.getElementById('svgPumpImpeller');
        if (impeller && state.isRunning && state.flowPV > 0.5) {
            const rot = (state.time * 720) % 360;
            impeller.setAttribute('transform', `rotate(${rot}, 0, 0)`);
        }
    }
}

const schematicRenderer = new SchematicRenderer();
