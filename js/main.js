const height = 6; // num of guesses
const width = 5; // num of letters

let row = 0; // attempt
let col = 0; // letter for attempt

let gameOver = false;
let secretWord = words[Math.floor(Math.random() * words.length)];
// let secretWord = "utter";

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
  let wordObj = createObject(secretWord);

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

  // console.log(correct, absent, present);
  return true;
}

function endGame() {
  if (typeof secretWord != "string") secretWord = secretWord.join("");
  document.querySelector("#answer").innerText = secretWord;
}

//! --------- SOLVE WORDLE AUTOMATICALLY ---------
function solveWordle(feedBack = {}) {
  if (Object.keys(feedBack) != 0) {
    let guessedWord = getWord(feedBack);
    let word = guessedWord.join("");

    guessedWord.forEach((letter, i) => {
      if (letter == feedBack[`l${i}`][0]) {
        switch (feedBack[`l${i}`][1]) {
          case "correct":
            words = words.filter((word) => word.split("")[i] == letter);
            break;
          case "present":
            if (countLetter(word, letter) > 1) {
              let indexes = [];
              let correctIndexes = [];

              // indexes of 2 same present letter
              for (let [key, value] of Object.entries(feedBack)) {
                if (letter == value[0] && value[1] == "present") {
                  indexes.push(key.split("")[1]);
                } else if (letter == value[0] && value[1] == "correct") {
                  correctIndexes.push(key.split("")[1]);
                }
              }
              indexes = new Set(indexes);
              indexes = [...indexes];

              if (correctIndexes.length != 0) {
                correctIndexes.forEach((index) => {
                  words = words.filter(
                    (word) =>
                      word.split("")[index] == letter &&
                      countLetter(word, letter) > 1
                  );
                });
              }

              if (indexes.length > 1) {
                indexes.forEach((index) => {
                  if (feedBack[`l${index}`][1] == "present") {
                    correctIndexes[index] = index;
                  }
                });
                console.log(correctIndexes);

                indexes.forEach((index) => {
                  words = words.filter(
                    (word) =>
                      word.split("")[index] != letter &&
                      countLetter(word, letter) > 1
                  );
                });
              } else {
                words = words.filter(
                  (word) => word.split("")[i] != letter && word.includes(letter)
                );
              }
            } else {
              words = words.filter(
                (word) => word.split("")[i] != letter && word.includes(letter)
              );
            }

            break;
          case "absent":
            if (countLetter(word, letter) < 2) {
              words = words.filter((word) => !word.includes(letter));
            } else {
              words = words.filter((word) => word.split("")[i] != letter);
            }
            break;
          default:
            console.log("error");
        }
      } else {
        console.log("delete everything");
      }
    });
  }

  console.log(words);
  return getTheBestWord(words);
}

function bot(e, answer = solveWordle()) {
  // row = 0; // attempt
  // col = 0; // letter for attempt

  for (let i = 0; i < answer.length; i++) {
    setTimeout(() => {
      let tile = document.getElementById(`${row}-${i}`);
      tile.textContent = answer[i];
      col = i;

      // desava se posle petlje
      if (i === answer.length - 1) {
        // console.log(row, col);
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

function getWord(obj) {
  let word = [];
  for (const [key, value] of Object.entries(obj)) {
    word.push(value[0]);
  }

  return word;
}

function getTheBestWord(words) {
  let bestWord = [];
  let wordsObj, letter;

  for (let i = 0; i < width; i++) {
    wordsObj = filterWords(words);
    letter = getMaxValue(wordsObj[`n${i}`]);

    words = words.filter((word) => word.split("")[i] == letter);

    bestWord.push(letter);
  }

  return bestWord;
}

function getMaxValue(obj) {
  let maxKey = null;
  let maxValue = 0;

  for (const key in obj) {
    if (obj[key] > maxValue) {
      maxValue = obj[key];
      maxKey = key;
    }
  }

  return maxKey;
}

function filterWords(words) {
  let wordObj = {
    n0: {},
    n1: {},
    n2: {},
    n3: {},
    n4: {},
  };

  for (let i = 0; i < width; i++) {
    words.forEach((word) => {
      let letter = word.split("")[i];

      let obj = wordObj[`n${i}`];
      if (obj.hasOwnProperty(letter)) {
        obj[letter] += 1;
      } else {
        obj[letter] = 1;
      }
    });
  }

  return wordObj;
}

function countLetter(word, letter) {
  let count = 0;
  for (let i = 0; i < word.length; i++) {
    if (word[i] === letter) {
      count++;
    }
  }
  return count;
}

function createObject(word) {
  let wordObj = {};

  for (let i = 0; i < word.length; i++) {
    let letter = word[i];
    if (wordObj[letter]) {
      wordObj[letter] += 1;
    } else {
      wordObj[letter] = 1;
    }
  }

  return wordObj;
}
