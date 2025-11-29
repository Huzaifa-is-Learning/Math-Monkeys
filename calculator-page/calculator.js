const display = document.getElementById("display");
const clearBtn = document.getElementById("clear-btn");
const clearLabel = clearBtn.querySelector(".label");
const clearIcon = clearBtn.querySelector(".icon");

let current = "";

// Update clear button mode
function updateClearButton() {
  if (current === "") {
    clearLabel.classList.remove("hidden");
    clearIcon.classList.add("hidden");
  } else {
    clearLabel.classList.add("hidden");
    clearIcon.classList.remove("hidden");
  }
}

// Calculator logic
document.querySelectorAll(".btn").forEach(btn => {
  btn.addEventListener("click", () => {
    let val = btn.innerText;

    if (btn.id === "clear-btn") {
      // AC or Backspace depending on state
      if (current === "") {
        // AC behavior
        display.innerText = "0";
      } else {
        // Backspace behavior
        current = current.slice(0, -1);
        display.innerText = current || "0";
      }
      updateClearButton();
      return;
    }

    if (val === "=") {
      try {
        current = eval(
          current.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-")
        ).toString();
        display.innerText = current;
      } catch {
        display.innerText = "Error";
        current = "";
      }
    } else if (val === "±") {
      if (current) {
        current = (parseFloat(current) * -1).toString();
        display.innerText = current;
      }
    } else {
      if ((["+", "−", "×", "÷"].includes(val)) && current === "") return;
      current += val;
      display.innerText = current;
    }

    updateClearButton();
  });
});

// Initialize button state
updateClearButton();