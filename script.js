const quoteEl = document.getElementById("quote");
const inputEl = document.getElementById("input");
const timerEl = document.getElementById("timer");
const wpmEl = document.getElementById("wpm");
const accuracyEl = document.getElementById("accuracy");
const restartBtn = document.getElementById("restart");
const durationSelect = document.getElementById("duration");

let interval = null;
let currentQuote = "";
let correctChars = 0;
let testDuration = 0; // default 0

inputEl.disabled = true; // disable typing until duration selected

// Fetch random quote from dummyjson API
async function getQuote() {
  const res = await fetch(
    "https://baconipsum.com/api/?type=all-meat&paras=1&format=text"
  );
  const data = await res.text();
  return data;
}

// Start the typing test
async function startTest() {
  if (testDuration === 0) return; // do nothing if duration not selected

  currentQuote = await getQuote();
  quoteEl.innerText = currentQuote;
  inputEl.value = "";
  correctChars = 0;
  timerEl.innerText = testDuration;
  wpmEl.innerText = "0";
  accuracyEl.innerText = "100";
  inputEl.disabled = false;
  inputEl.focus();

  clearInterval(interval);
  interval = null;
}

inputEl.addEventListener("input", () => {
  const typedText = inputEl.value;

  if (!interval) {
    let timeLeft = testDuration;
    timerEl.innerText = timeLeft;

    interval = setInterval(() => {
      timeLeft--;
      timerEl.innerText = timeLeft;

      calculateWPM(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(interval);
        inputEl.disabled = true;
      }
    }, 1000);
  }

  // Count correct characters
  let correctCount = 0;
  for (let i = 0; i < typedText.length; i++) {
    if (typedText[i] === currentQuote[i]) {
      correctCount++;
    }
  }
  correctChars = correctCount;

  // Accuracy
  let accuracy =
    typedText.length === 0 ? 100 : (correctChars / typedText.length) * 100;
  accuracyEl.innerText = Math.round(accuracy);

  // If completed early
  if (typedText === currentQuote) {
    clearInterval(interval);
    inputEl.disabled = true;
  }
});

function calculateWPM(timeLeft) {
  let wordsTyped = inputEl.value.trim().split(/\s+/).length;
  let timeSpent = testDuration - timeLeft;
  if (timeSpent > 0) {
    let wpm = Math.round((wordsTyped / timeSpent) * 60);
    wpmEl.innerText = wpm;
  }
}

// Change duration when selecting new option
durationSelect.addEventListener("change", async () => {
  testDuration = parseInt(durationSelect.value);
  if (testDuration > 0) {
    startTest();
  } else {
    quoteEl.innerText = "Select duration to start the test";
    inputEl.value = "";
    inputEl.disabled = true;
    timerEl.innerText = "0";
    wpmEl.innerText = "0";
    accuracyEl.innerText = "100";
    clearInterval(interval);
  }
});

restartBtn.addEventListener("click", startTest);
