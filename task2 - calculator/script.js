/* ===== KALKULUS CALCULATOR — JavaScript ===== */

(function () {
  "use strict";

  // ── STATE ─────────────────────────────────────────────────────────────────
  let displayVal  = "0";   // what's shown on screen
  let storedVal   = null;  // first operand
  let pendingOp   = null;  // pending operator
  let waitingNext = false; // after operator pressed, next digit starts fresh
  let justEvaled  = false; // just hit equals
  let lastHistory = null;  // last completed calculation

  // ── ELEMENTS ──────────────────────────────────────────────────────────────
  const resultEl     = document.getElementById("result");
  const expressionEl = document.getElementById("expression");
  const historyVal   = document.getElementById("history-val");
  const allOpBtns    = document.querySelectorAll(".op-btn");
  const btnGrid      = document.getElementById("btn-grid");

  // ── DISPLAY ───────────────────────────────────────────────────────────────
  function updateDisplay(val, isResult = false) {
    // Format large numbers with commas but preserve decimal during input
    let display = val;
    if (!val.includes("e") && !isNaN(parseFloat(val))) {
      const parts = val.split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      display = parts.join(".");
    }
    resultEl.textContent = display || "0";
    if (isResult) {
      resultEl.classList.add("active-op");
      setTimeout(() => resultEl.classList.remove("active-op"), 300);
    }
  }

  function updateExpression(text) {
    expressionEl.textContent = text;
  }

  function updateHistory(text) {
    historyVal.textContent = text || "—";
  }

  // ── ARITHMETIC ────────────────────────────────────────────────────────────
  function calculate(a, op, b) {
    const fa = parseFloat(a);
    const fb = parseFloat(b);
    switch (op) {
      case "+": return fa + fb;
      case "−": return fa - fb;
      case "×": return fa * fb;
      case "÷":
        if (fb === 0) return "Error";
        return fa / fb;
    }
    return fb;
  }

  function formatNumber(num) {
    if (typeof num === "string") return num;
    // Avoid floating point noise
    const str = parseFloat(num.toPrecision(12)).toString();
    return str;
  }

  // ── ACTIONS ───────────────────────────────────────────────────────────────
  function handleNum(digit) {
    if (displayVal === "Error") { reset(); }
    if (justEvaled) {
      // After equals, start fresh number
      displayVal = digit;
      justEvaled = false;
    } else if (waitingNext) {
      displayVal = digit;
      waitingNext = false;
    } else {
      if (displayVal === "0" && digit !== ".") {
        displayVal = digit;
      } else if (displayVal.length < 14) {
        displayVal += digit;
      }
    }
    updateDisplay(displayVal);
    updateExpression(pendingOp ? `${storedVal} ${pendingOp}` : "");
  }

  function handleDecimal() {
    if (waitingNext) {
      displayVal = "0.";
      waitingNext = false;
    } else if (justEvaled) {
      displayVal = "0.";
      justEvaled = false;
    } else if (!displayVal.includes(".")) {
      displayVal += ".";
    }
    updateDisplay(displayVal);
  }

  function handleOperator(op) {
    if (displayVal === "Error") { reset(); return; }

    // Chain operations: if already pending, compute first
    if (pendingOp && !waitingNext && !justEvaled) {
      const result = calculate(storedVal, pendingOp, displayVal);
      const formatted = formatNumber(result);
      updateHistory(`${storedVal} ${pendingOp} ${displayVal} = ${formatted}`);
      storedVal = formatted;
      displayVal = formatted;
      updateDisplay(displayVal, true);
    } else {
      storedVal = displayVal;
    }

    pendingOp   = op;
    waitingNext = true;
    justEvaled  = false;

    // Highlight active op button
    allOpBtns.forEach(b => {
      b.classList.toggle("op-active", b.dataset.op === op);
    });

    updateExpression(`${storedVal} ${op}`);
  }

  function handleEquals() {
    if (!pendingOp || storedVal === null) return;

    const a = storedVal;
    const b = displayVal;
    const result = calculate(a, pendingOp, b);
    const formatted = typeof result === "string" ? result : formatNumber(result);

    updateHistory(`${a} ${pendingOp} ${b} = ${formatted}`);
    updateHistory(`${a} ${pendingOp} ${b} = ${formatted}`);
    updateExpression(`${a} ${pendingOp} ${b} =`);
    displayVal = formatted;
    updateDisplay(displayVal, true);

    pendingOp   = null;
    storedVal   = null;
    waitingNext = false;
    justEvaled  = true;

    // Clear op highlights
    allOpBtns.forEach(b => b.classList.remove("op-active"));
  }

  function handleClear() {
    reset();
  }

  function handleSign() {
    if (displayVal === "0" || displayVal === "Error") return;
    displayVal = displayVal.startsWith("-")
      ? displayVal.slice(1)
      : "-" + displayVal;
    updateDisplay(displayVal);
  }

  function handlePercent() {
    if (displayVal === "Error") return;
    const val = parseFloat(displayVal) / 100;
    displayVal = formatNumber(val);
    updateDisplay(displayVal);
  }

  function reset() {
    displayVal  = "0";
    storedVal   = null;
    pendingOp   = null;
    waitingNext = false;
    justEvaled  = false;
    updateDisplay("0");
    updateExpression("");
    allOpBtns.forEach(b => b.classList.remove("op-active"));
  }

  // ── BUTTON CLICK HANDLER ─────────────────────────────────────────────────
  btnGrid.addEventListener("click", e => {
    const btn = e.target.closest(".calc-btn");
    if (!btn) return;

    // Flash animation
    btn.classList.remove("btn-flash");
    void btn.offsetWidth;
    btn.classList.add("btn-flash");

    const action = btn.dataset.action;
    if (action === "num")     handleNum(btn.dataset.num);
    if (action === "decimal") handleDecimal();
    if (action === "op")      handleOperator(btn.dataset.op);
    if (action === "equals")  handleEquals();
    if (action === "clear")   handleClear();
    if (action === "sign")    handleSign();
    if (action === "percent") handlePercent();
  });

  // ── KEYBOARD SUPPORT ─────────────────────────────────────────────────────
  const keyMap = {
    "0": () => handleNum("0"),
    "1": () => handleNum("1"),
    "2": () => handleNum("2"),
    "3": () => handleNum("3"),
    "4": () => handleNum("4"),
    "5": () => handleNum("5"),
    "6": () => handleNum("6"),
    "7": () => handleNum("7"),
    "8": () => handleNum("8"),
    "9": () => handleNum("9"),
    ".": () => handleDecimal(),
    ",": () => handleDecimal(),
    "+": () => handleOperator("+"),
    "-": () => handleOperator("−"),
    "*": () => handleOperator("×"),
    "/": () => handleOperator("÷"),
    "Enter":     () => handleEquals(),
    "=":         () => handleEquals(),
    "Escape":    () => handleClear(),
    "Backspace": () => handleBackspace(),
    "%":         () => handlePercent(),
  };

  function handleBackspace() {
    if (waitingNext || justEvaled || displayVal === "Error") return;
    displayVal = displayVal.length > 1 ? displayVal.slice(0, -1) : "0";
    updateDisplay(displayVal);
  }

  document.addEventListener("keydown", e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const handler = keyMap[e.key];
    if (handler) {
      e.preventDefault();
      handler();
      // Highlight corresponding button briefly
      highlightKeyBtn(e.key);
    }
  });

  function highlightKeyBtn(key) {
    const keyToData = {
      "Enter": "[data-action='equals']",
      "=":     "[data-action='equals']",
      "Escape":"[data-action='clear']",
      "Backspace": null,
      "+":  "[data-op='+']",
      "-":  "[data-op='−']",
      "*":  "[data-op='×']",
      "/":  "[data-op='÷']",
      ".":  "[data-action='decimal']",
    };
    let selector = keyToData[key];
    if (!selector && /^\d$/.test(key)) selector = `[data-num='${key}']`;
    if (selector) {
      const btn = document.querySelector(selector);
      if (btn) {
        btn.classList.remove("btn-flash");
        void btn.offsetWidth;
        btn.classList.add("btn-flash");
      }
    }
  }

  // ── INIT ──────────────────────────────────────────────────────────────────
  updateDisplay("0");
  updateExpression("");
  updateHistory("—");

})();
