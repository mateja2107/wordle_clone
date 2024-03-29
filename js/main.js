const height = 6; // num of guesses
const width = 5; // num of letters

let row = 0; // attempt
let col = 0; // letter for attempt

let gameOver = false;
let secretWord = words[Math.floor(Math.random() * words.length)];
// let secretWord = "pince";

document.getElementById("asd").innerHTML = secretWord;

window.onload = () => initialize();

function initialize() {
  // grid 6x5
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      let tile = document.createElement("span");
      tile.id = r.toString() + "-" + c.toString();
      tile.classList.add("tile");
      tile.innerText = "";
      document.querySelector("#board").appendChild(tile);
    }
  }

  // funkcija koja se pokrece na klik na tastaturi
  document.addEventListener("keyup", (e) => {
    if (gameOver) return;

    if ("KeyA" <= e.code && e.code <= "KeyZ") {
      if (col < width) {
        let currTile = document.getElementById(`${row}-${col}`);

        if (currTile.innerText === "") {
          currTile.innerText = e.key.toUpperCase();
        } else {
          if (col >= 4) return;

          col += 1;

          let currTile = document.getElementById(`${row}-${col}`);
          currTile.innerText = e.key.toUpperCase();
        }
      }
    }

    if (e.key === "Enter") {
      onEnter();
    }

    if (e.key === "Backspace") {
      let currTile = document.getElementById(`${row}-${col}`);
      if (currTile.innerText != "") {
        currTile.innerText = "";
        if (col != 0) col -= 1;
      }
    }

    if (!gameOver && row == height) {
      gameOver = true;
      endGame();
      return;
    }
  });

  // tastatura
  let keyboard = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L", " "],
    ["Enter", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
  ];

  for (let i = 0; i < keyboard.length; i++) {
    let currRow = keyboard[i];
    let keyboardRow = document.createElement("div");
    keyboardRow.classList.add("keyboard-row");

    for (let j = 0; j < currRow.length; j++) {
      let keyTile = document.createElement("div");

      let key = currRow[j];
      keyTile.innerText = key;
      if (key == "Enter") {
        keyTile.id = "Enter";
      } else if (key == "⌫") {
        keyTile.id = "Backspace";
      } else if ("A" <= key && key <= "Z") {
        keyTile.id = "Key" + key; // "Key" + "A";
      }

      if (key == "Enter") {
        keyTile.classList.add("enter-key-tile");
      } else {
        keyTile.classList.add("key-tile");
      }
      keyboardRow.appendChild(keyTile);
    }
    document.body.appendChild(keyboardRow);
  }
}

function onEnter() {
  let currTile = document.getElementById(`${row}-${col}`);
  if (col == 4 && currTile.innerText != "") {
    if (!readWord()) {
      alert("word does not exists");
      return;
    }

    if (gameOver) {
      endGame();
    }

    row += 1;
    col = 0;
  }
}

// row je definisano gore, zbog toga nema argumenta
function readWord() {
  let correct = 0;
  let present = 0;
  let absent = 0;

  let guessedWord = document.querySelectorAll(`span[id*="${row}-"`);
  guessedWord = Array.from(guessedWord)
    .map((el) => el.innerText)
    .join("")
    .toLowerCase();
  // da li rec postoji?
  if (!words.some((el) => el === guessedWord)) return false;

  guessedWord = Array.from(guessedWord);
  secretWord = Array.from(secretWord);

  // kreiranje objekta "speed" {s: 1, p: 1, e: 2, d: 1}
  // pomocu tog objekta kasnije odredjujem da li se slovo ponavlja
  let wordObj = {};
  for (let i = 0; i < secretWord.length; i++) {
    let letter = secretWord[i];
    if (wordObj[letter]) {
      wordObj[letter] += 1;
    } else {
      wordObj[letter] = 1;
    }
  }

  for (let i = 0; i < secretWord.length; i++) {
    let letterTile = document.getElementById(`${row}-${i}`);
    let letter = letterTile.textContent.toLocaleLowerCase();
    let key = document.getElementById(`Key${letter.toUpperCase()}`);

    if (wordObj[letter] > 0) {
      // ako rec sadrzi slovo i isto se nalazi na odgovarajucem mestu
      if (secretWord[i] == letter) {
        correct += 1;
        wordObj[letter] -= 1;

        key.classList.add("correct");
        letterTile.classList.add("correct");
        if (key.classList.contains("present")) key.classList.remove("present");
      }
    }
  }

  for (let i = 0; i < secretWord.length; i++) {
    let letterTile = document.getElementById(`${row}-${i}`);
    let letter = letterTile.textContent.toLocaleLowerCase();
    let key = document.getElementById(`Key${letter.toUpperCase()}`);

    // ako slovo nije oznaceno kao ispravno
    if (!letterTile.classList.contains("correct")) {
      // ako rec sadrzi slovo ali slovo nije na odgovarajucem mestu
      if (secretWord.includes(letter) && wordObj[letter] > 0) {
        present += 1;
        wordObj[letter] -= 1;

        if (!key.classList.contains("correct")) key.classList.add("present");
        letterTile.classList.add("present");

        // ako rec ne sadrzi slovo
      } else {
        absent += 1;

        if (Array.from(letterTile.classList).length == 1) {
          letterTile.classList.add("absent");
        }

        if (Array.from(key.classList).length == 1) {
          key.classList.add("absent");
        }
      }
    }
  }

  // ako je rec pogodjena
  if (guessedWord.join("") === secretWord.join("")) return (gameOver = true);

  console.log(correct, absent, present);
  return true;
}

function endGame() {
  if (typeof secretWord != "string") secretWord = secretWord.join("");
  document.querySelector("#answer").innerText = secretWord;
}

//! --------- SOLVE WORDLE AUTOMATICALLY ---------
function solveWordle(feedBack = {}) {
  if (Object.keys(feedBack) != 0) {
    return ["s", "p", "e", "e", "d"];
  }

  return ["e", "x", "i", "s", "t"];
}

function bot(e, answer = solveWordle()) {
  // row = 0; // attempt
  // col = 0; // letter for attempt

  console.log(answer);

  for (let i = 0; i < answer.length; i++) {
    setTimeout(() => {
      let tile = document.getElementById(`${row}-${i}`);
      tile.textContent = answer[i];
      col = i;

      // desava se posle petlje
      if (i === answer.length - 1) {
        console.log(row, col);
        onEnter();
        let data = document.querySelectorAll(`span[id*="${row - 1}-"]`);
        data = Array.from(data);

        let feedBack = {};
        data.forEach((letter, i) => {
          feedBack[`l${i}`] = [
            letter.textContent,
            Array.from(letter.classList)[1],
          ];
        });
        answer = solveWordle(feedBack);

        if (!gameOver) {
          if (row != height) {
            bot(e, answer);
          } else {
            endGame();
          }
        }
      }
    }, i * 500);
  }
}

let button = document.getElementById("startBtn");
button.addEventListener("click", bot);
