const display = document.getElementById("display");
let current = "";

// Calculator logic
document.querySelectorAll(".btn").forEach(btn => {
  btn.addEventListener("click", () => {
    let val = btn.innerText;

    if (val === "AC") {
      current = "";
      display.innerText = "0";
    } else if (val === "=") {
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
  });
});
