/**
 * Viva Voce & Concept Verification Quiz Engine (10 Questions)
 */

class QuizEngine {
    constructor() {
        this.questions = [
            {
                id: 1,
                question: "What is the Process Variable (PV) in a feedback control system?",
                options: [
                    "A. The target value set by the system operator.",
                    "B. The measured physical quantity (e.g., flow rate in L/min) currently being controlled.",
                    "C. The voltage output sent directly to the final control element.",
                    "D. The difference between desired value and actual value."
                ],
                correct: 1,
                explanation: "Correct! The Process Variable (PV) is the actual measured state of the process (such as flow rate or level) measured by a sensor."
            },
            {
                id: 2,
                question: "What is the Set Point (SP)?",
                options: [
                    "A. The actual current value measured by the sensor.",
                    "B. The maximum physical limit of the pump.",
                    "C. The desired target value that the controller attempts to maintain.",
                    "D. The mathematical derivative of error."
                ],
                correct: 2,
                explanation: "Correct! Set Point (SP) is the desired operational value that the controller tries to match with the Process Variable."
            },
            {
                id: 3,
                question: "What is Controller Output (CO)?",
                options: [
                    "A. The signal (0–100%) calculated by the controller and sent to modulate the final control element (Control Valve).",
                    "B. The raw voltage output from the flow transmitter sensor.",
                    "C. The sum of Set Point and Process Variable.",
                    "D. The maximum steady-state flow rate."
                ],
                correct: 0,
                explanation: "Correct! Controller Output (CO) is the manipulated command signal calculated by the control algorithm to position the actuator."
            },
            {
                id: 4,
                question: "What is steady-state 'Offset' in process control?",
                options: [
                    "A. The transient peak overshoot during a step change.",
                    "B. The permanent non-zero difference between Set Point and Process Variable at steady state in P-only control.",
                    "C. The high-frequency noise created by turbulence.",
                    "D. The mechanical dead-band of a valve positioner."
                ],
                correct: 1,
                explanation: "Correct! Offset is the sustained steady-state error (e_ss != 0) that remains when using a Proportional-only controller."
            },
            {
                id: 5,
                question: "Why is Derivative (D) control action never used alone?",
                options: [
                    "A. Derivative action produces zero output when error is constant (de/dt = 0), regardless of how large the static error is.",
                    "B. Derivative action causes severe steady-state offset.",
                    "C. Derivative action cannot respond to fast transient changes.",
                    "D. Derivative action is physically impossible to construct."
                ],
                correct: 0,
                explanation: "Correct! Derivative action responds only to the rate of change of error (de/dt). When error is steady and constant, de/dt = 0, so D-only action produces no control output."
            },
            {
                id: 6,
                question: "What is the main advantage of adding Integral (I) action to a Proportional controller (PI Mode)?",
                options: [
                    "A. It reduces measurement noise.",
                    "B. It completely eliminates steady-state offset by integrating error over time.",
                    "C. It prevents transient overshoot entirely.",
                    "D. It speeds up the initial rise time."
                ],
                correct: 1,
                explanation: "Correct! Integral action integrates error over time, continuously adjusting CO until error is driven precisely to zero."
            },
            {
                id: 7,
                question: "What is the main drawback of a Proportional (P) controller?",
                options: [
                    "A. It is extremely slow to respond.",
                    "B. It suffers from permanent steady-state offset because non-zero error is required to sustain valve opening.",
                    "C. It always causes severe instability.",
                    "D. It requires complex numerical microprocessors."
                ],
                correct: 1,
                explanation: "Correct! P-only control u = u0 + Kp*e requires a non-zero error e to maintain control valve opening above bias u0."
            },
            {
                id: 8,
                question: "What is 'Integral Windup' in process control?",
                options: [
                    "A. Mechanical friction in the pump motor rotor.",
                    "B. Excessive accumulation of the integral term when a control valve is saturated (at 100% or 0%), delaying recovery.",
                    "C. High-frequency chatter in ON/OFF controllers.",
                    "D. Thermal expansion of liquid inside pipes."
                ],
                correct: 1,
                explanation: "Correct! Integral windup occurs when continuous error causes the integral accumulator to build up huge values while the valve is stuck at maximum limit, resulting in large recovery overshoot."
            },
            {
                id: 9,
                question: "What is 'Differential Gap' (Hysteresis) in ON/OFF control?",
                options: [
                    "A. The dead zone between upper and lower switching thresholds (SP ± ΔH/2) designed to prevent rapid valve chatter.",
                    "B. The difference between pump pressure and outlet pressure.",
                    "C. The time delay between sensor measurement and controller response.",
                    "D. The gain ratio Kp / Ki."
                ],
                correct: 0,
                explanation: "Correct! Differential gap / hysteresis defines the switching deadband to stop ON/OFF controllers from cycling rapidly at high frequencies."
            },
            {
                id: 10,
                question: "What distinguishes PID control from P and PI control?",
                options: [
                    "A. PID uses open-loop control without feedback.",
                    "B. PID combines present error (P), past accumulated error (I), and predicted rate of change (D) for fast, zero-offset control.",
                    "C. PID only works in digital bang-bang systems.",
                    "D. PID eliminates the need for a final control element."
                ],
                correct: 1,
                explanation: "Correct! PID combines proportional (present), integral (past), and derivative (future rate) terms to deliver rapid settling and zero offset."
            }
        ];
    }

    init() {
        const container = document.getElementById('quizQuestionsContainer');
        if (!container) return;

        let html = '';
        this.questions.forEach((q, idx) => {
            html += `
            <div class="quiz-q-card" id="qcard-${q.id}">
                <div class="quiz-q-title">
                    <span>Q${idx + 1}.</span>
                    <div>${q.question}</div>
                </div>
                <div class="quiz-options">
                    ${q.options.map((opt, optIdx) => `
                        <label class="quiz-option-label">
                            <input type="radio" name="q_${q.id}" value="${optIdx}">
                            <span>${opt}</span>
                        </label>
                    `).join('')}
                </div>
                <div class="quiz-explanation" id="expl-${q.id}" style="display: none;"></div>
            </div>
            `;
        });
        container.innerHTML = html;
    }

    submitQuiz() {
        let score = 0;
        this.questions.forEach((q) => {
            const selected = document.querySelector(`input[name="q_${q.id}"]:checked`);
            const explDiv = document.getElementById(`expl-${q.id}`);

            if (explDiv) {
                explDiv.style.display = 'block';
                if (selected && parseInt(selected.value) === q.correct) {
                    score++;
                    explDiv.className = 'quiz-explanation correct';
                    explDiv.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${q.explanation}`;
                } else {
                    explDiv.className = 'quiz-explanation incorrect';
                    explDiv.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Incorrect. ${q.explanation}`;
                }
            }
        });

        const scoreBadge = document.getElementById('quizScoreBadge');
        const scoreText = document.getElementById('quizScoreText');
        if (scoreBadge && scoreText) {
            scoreBadge.style.display = 'block';
            scoreText.textContent = `${score} / ${this.questions.length}`;
        }
    }

    resetQuiz() {
        const form = document.getElementById('quizForm');
        if (form) form.reset();
        
        this.questions.forEach(q => {
            const explDiv = document.getElementById(`expl-${q.id}`);
            if (explDiv) explDiv.style.display = 'none';
        });

        const scoreBadge = document.getElementById('quizScoreBadge');
        if (scoreBadge) scoreBadge.style.display = 'none';
    }
}

const quizEngine = new QuizEngine();
