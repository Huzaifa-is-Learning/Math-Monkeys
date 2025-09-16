// Quizzer.js

// Wait until DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {

    // Check for saved difficulty, default to 'easy' if not found
    let difficulty = localStorage.getItem('difficulty') || 'easy';

    // Helpers
    function randomInt(max) {
        return Math.floor(Math.random() * max) + 1;
    }

    function digitLength(num) {
        return Math.floor(Math.log10(Math.abs(num))) + 1;
    }

    // Adjust operands for Hard mode (ratio system)
    function adjustOperands(a, b) {
        const lenA = digitLength(a);
        const lenB = digitLength(b);

        if (lenA >= 4 && lenB >= 4) {
            b = randomInt(90) + 10; // force b into 2 digits
        } else if (lenA === 3 && lenB === 3) {
            b = randomInt(9); // make b 1 digit
        }
        return [a, b];
    }

    // Quiz stats
    let totalQuestions = 0;
    let correctAnswers = 0;

    // DOM elements
    const questionEl = document.getElementById('question');
    const answerEl = document.getElementById('answer');
    const submitBtn = document.getElementById('submit');
    const skipBtn = document.getElementById('skip');
    const exitBtn = document.getElementById('exit');
    const feedbackEl = document.getElementById('feedback');
    const scoreEl = document.getElementById('score');
    const historyListEl = document.getElementById('historyList');
    const finalSummaryEl = document.getElementById('finalSummary');

    let currentQ = {};

    // Sounds 
    const correctSound = new Audio('/assets/correct.mp3');
    const wrongSound = new Audio('/assets/error.mp3');
    const skipSound = new Audio('/assets/skip.mp3');
    const exitSound = new Audio('/assets/exit.wav');

    // -------------------------------
    // Question generator
    // -------------------------------
    function generateQuestion() {
        if (difficulty === "easy") {
            // Basic + - × ÷, safe rules
            const op = randomInt(4);
            let a = randomInt(10);
            let b = randomInt(10);

            if (op === 2 && a < b) [a, b] = [b, a]; // no negatives
            if (op === 4) a = a * b; // clean division

            switch (op) {
                case 1: return { questionText: `${a} + ${b}`, answer: a + b };
                case 2: return { questionText: `${a} - ${b}`, answer: a - b };
                case 3: return { questionText: `${a} × ${b}`, answer: a * b };
                case 4: return { questionText: `${a} ÷ ${b}`, answer: a / b };
            }
        }

        if (difficulty === "medium") {
            // BODMAS, up to 3 digits, negatives + decimals allowed
            let a = randomInt(999);
            let b = randomInt(999);
            const op = ["+", "-", "×", "÷"][randomInt(4) - 1];

            let expression = `${a} ${op} ${b}`;
            let answer;

            // Use eval safely with replacements
            expression = expression.replace(/×/g, "*").replace(/÷/g, "/");
            answer = eval(expression);

            // Handle recurring decimals: allow 2–3 significant figures
            let roundedAns = parseFloat(answer.toPrecision(3));

            return {
                questionText: `Solve: ${a} ${op} ${b}`,
                answer: roundedAns
            };
        }

        if (difficulty === "hard") {
            // Hard: multi-expression, brackets, percentages, large numbers
            const type = randomInt(2); // 1 = arithmetic, 2 = percentage

            if (type === 2) {
                // Percentage style
                let part = randomInt(9999) + 1;
                let whole = randomInt(99999) + 100;
                let percent = (part / whole) * 100;

                return {
                    questionText: `The percentage of ${part} bananas out of ${whole}`,
                    answer: parseFloat(percent.toFixed(2))
                };
            } else {
                // Arithmetic with up to 3–4 expressions
                let ops = ["+", "-", "×", "÷"];
                let exprParts = [];
                let terms = randomInt(3) + 1; // 2–4 terms

                for (let i = 0; i < terms; i++) {
                    let a = randomInt(99999); // up to 5 digits
                    let b = randomInt(9999);  // up to 4 digits
                    [a, b] = adjustOperands(a, b);

                    let op = ops[randomInt(4) - 1];
                    let piece = `(${a} ${op} ${b})`;
                    exprParts.push(piece);
                }

                let expression = exprParts.join(" ");
                let evalExpr = expression.replace(/×/g, "*").replace(/÷/g, "/");
                let answer = eval(evalExpr);

                return {
                    questionText: `Solve: ${expression}`,
                    answer: parseFloat(answer.toFixed(2))
                };
            }
        }
    }

    // -------------------------------
    // UI + Quiz Flow
    // -------------------------------
    function updateScore() {
        scoreEl.textContent = correctAnswers;
    }

    function updateHistory(question, userAnswer, status) {
        const li = document.createElement('li');

        if (status === "skipped") {
            li.textContent = `${question} | Correct answer: ${currentQ.answer} | You skipped`;
        } else if (status === "wrong") {
            li.textContent = `${question} | Correct answer: ${currentQ.answer} | Your answer: ${userAnswer}`;
        } else {
            li.textContent = `${question} | Your answer: ${userAnswer}`;
        }

        li.className = status;
        historyListEl.prepend(li);
    }

    function updateFinalSummary() {
        if (totalQuestions > 0) {
            const percent = Math.round((correctAnswers / totalQuestions) * 100);
            finalSummaryEl.textContent =
                `${correctAnswers} out of ${totalQuestions} questions correct (${percent}%). Thanks for playing!`;
        }
    }

    function nextQuestion() {
        currentQ = generateQuestion();
        questionEl.textContent = currentQ.questionText;
        answerEl.value = '';

        setTimeout(() => {
            feedbackEl.textContent = '';
        }, 2500);
    }

    function submitAnswer() {
        if (answerEl.value === '') {
            feedbackEl.textContent = "Please enter a number!";
            feedbackEl.style.color = "#ffcccc";
            return;
        }

        const userAnswer = Number(answerEl.value);
        let status;

        if (Math.abs(userAnswer - currentQ.answer) < 0.01) {
            // accept close decimals
            status = "correct";
            correctAnswers++;
            feedbackEl.textContent = "Correct! ✅";
            feedbackEl.style.color = "#00ff88";
            correctSound.play();
        } else {
            status = "wrong";
            feedbackEl.textContent = `Wrong ❌ (Correct: ${currentQ.answer})`;
            feedbackEl.style.color = "#ff4c4c";
            wrongSound.play();
        }

        totalQuestions++;
        updateScore();
        updateHistory(currentQ.questionText, userAnswer, status);

        setTimeout(() => {
            nextQuestion();
        }, 1000);
    }

    function skipQuestion() {
        totalQuestions++;
        updateHistory(currentQ.questionText, "-", "skipped");
        feedbackEl.textContent = `Skipped ⏭️ Correct answer: ${currentQ.answer}`;
        feedbackEl.style.color = "#ffd700";
        skipSound.play();

        setTimeout(() => {
            nextQuestion();
        }, 1000);
    }

    function exitQuiz() {
        exitSound.play();
        answerEl.disabled = true;
        submitBtn.disabled = true;
        skipBtn.disabled = true;
        exitBtn.disabled = true;
        feedbackEl.textContent = "Quiz Ended!";
        updateFinalSummary();
    }

    // Event listeners
    submitBtn.addEventListener('click', submitAnswer);
    skipBtn.addEventListener('click', skipQuestion);
    exitBtn.addEventListener('click', exitQuiz);

    // Start first question
    nextQuestion();
});
