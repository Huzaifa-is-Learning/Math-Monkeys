// Quizzer.js

// Wait until DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {

    // Generate random integer between 1 and max
    function randomInt(max) {
        return Math.floor(Math.random() * max) + 1;
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

    // Sounds (place your mp3 files in the project folder)
    const correctSound = new Audio('correct.mp3');
    const wrongSound = new Audio('error.mp3');
    const skipSound = new Audio('skip.mp3');
    const exitSound = new Audio('exit.wav');

    // Generate a new math question
    function generateQuestion() {
        const op = randomInt(4);
        let a = randomInt(10);
        let b = randomInt(10);

        // Ensure no negative subtraction
        if (op === 2 && a < b) [a, b] = [b, a];

        // Ensure clean division
        if (op === 4) {
            a = a * b; // makes a divisible by b
        }

        let questionText, answer;
        switch(op) {
            case 1: questionText = `${a} + ${b}`; answer = a + b; break;
            case 2: questionText = `${a} - ${b}`; answer = a - b; break;
            case 3: questionText = `${a} × ${b}`; answer = a * b; break;
            case 4: questionText = `${a} ÷ ${b}`; answer = a / b; break;
        }

        return { questionText, answer };
    }

    // Update score display
    function updateScore() {
        scoreEl.textContent = correctAnswers;
    }

    // Update question history
    function updateHistory(question, userAnswer, status) {
        const li = document.createElement('li');

        if (status === "skipped" || status === "wrong") {
            li.textContent = `${question} | Correct answer: ${currentQ.answer}`;
        } else {
            li.textContent = `${question} | Your answer: ${userAnswer}`;
        }

        li.className = status;
        historyListEl.prepend(li);
    }

    // Update final summary
    function updateFinalSummary() {
        if (totalQuestions > 0){
            const percent = Math.round((correctAnswers / totalQuestions) * 100);
            finalSummaryEl.textContent = `${correctAnswers} out of ${totalQuestions} questions correct (${percent}%). Thanks for playing!`;
        }
    }

    // Load next question
    function nextQuestion() {
    currentQ = generateQuestion();
    questionEl.textContent = `Solve: ${currentQ.questionText}`;
    answerEl.value = '';

    // Clear previous feedback after 2.5 seconds
    setTimeout(() => {
        feedbackEl.textContent = '';
    }, 2500);
}


    // Handle answer submission
    function submitAnswer() {
        if(answerEl.value === '') {
            feedbackEl.textContent = "Please enter a number!";
            feedbackEl.style.color = "#ffcccc";
            return;
        }

        const userAnswer = Number(answerEl.value);
        let status;

        if(userAnswer === currentQ.answer){
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

        // Delay next question so feedback is visible
        setTimeout(() => {
            nextQuestion();
        }, 1000);
    }

    // Handle skipping a question
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

    // Exit quiz
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
