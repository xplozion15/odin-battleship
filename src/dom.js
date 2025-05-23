import { createElementFunction } from "./helperFunctions.js";

import {
  onRandomButtonClick,
  realPlayer,
  cpuPlayer,
  getRandomValidCpuMove,
  getValidMovesForCpu,
  isCoordInArray,
  state,
} from "./gameController.js";

import { onHitSound, onVictorySound, onDefeatSound } from "./sound.js";

// DOM SELECTORS
const playerGameboard = document.querySelector("#player-gameboard");
const cpuGameboard = document.querySelector("#cpu-gameboard");
const randomShipsButton = document.querySelector("#random-ships-button");
const newGameButton = document.querySelector("#new-game-button");
const modal = document.querySelector("#modal");
const modalButton = document.querySelector("#modal-button");
const modalHeading = document.querySelector("#modal-heading");
const modalDescription = document.querySelector("#modal-description");
const placeShipsText = document.querySelector("#place-ships-text");

// EVENT LISTENERS

modalButton.addEventListener("click", () => {
  window.location.reload();
});

newGameButton.addEventListener("click", () => {
  window.location.reload();
});

cpuGameboard.addEventListener("click", (event) => {
  if (state.isRandomButtonClicked) {
    placeShipsText.textContent = "";
    let clickedElement = event.target;
    let xDatasetValue = clickedElement.dataset.indexX;
    let yDatasetValue = clickedElement.dataset.indexY;

    if (
      clickedElement.classList.contains("grid-cells") &&
      isCoordInArray(cpuPlayer.gameboard.missedAttacks, [
        xDatasetValue,
        yDatasetValue,
      ]) === false &&
      isCoordInArray(cpuPlayer.gameboard.hitAttacks, [
        xDatasetValue,
        yDatasetValue,
      ]) === false
    ) {

      cpuGameboard.style.pointerEvents = "none";

      let attack = cpuPlayer.gameboard.receiveAttack([
        xDatasetValue,
        yDatasetValue,
      ]);

      if (attack === "miss") {
        onAttackMissDom(clickedElement);
      } else if (attack === "hit") {
        onAttackHitDom(clickedElement);
        onHitSound.currentTime = 0;
        onHitSound.play();
      }

      setTimeout(() => {
        afterPlayerMakesMove(realPlayer);
        cpuGameboard.style.pointerEvents = "auto";
      }, 500);
    }
  } else if (!state.isRandomButtonClicked) {
    placeShipsText.textContent =
      "PLEASE PLACE SHIPS BEFORE CLICKING ON THE BOARD!";
  }
});

randomShipsButton.addEventListener("click", () => {
  state.isRandomButtonClicked = true;
  placeShipsText.textContent = "";
  playerGameboard.innerHTML = "";
  cpuGameboard.innerHTML = "";

  onRandomButtonClick();

  let realPlayerGameboardArray = realPlayer.gameboard.board;
  let cpuPlayerGameboardArray = cpuPlayer.gameboard.board;

  realPlayerGameboardArray.forEach((row, rowIndex) => {
    row.forEach((item, index) => {
      let createGridCellForPlayer = createElementFunction(
        "div",
        ["grid-cells"],
        { "data-index-x": rowIndex, "data-index-y": index },
      );

      if (item !== 0) {
        createGridCellForPlayer.classList.add("blue");
      }

      playerGameboard.append(createGridCellForPlayer);
    });
  });

  cpuPlayerGameboardArray.forEach((row, rowIndex) => {
    row.forEach((item, index) => {
      let createGridCellForCpu = createElementFunction("div", ["grid-cells"], {
        "data-index-x": rowIndex,
        "data-index-y": index,
      });
      cpuGameboard.append(createGridCellForCpu);
    });
  });
});

// DOM MANIPULATION FUNCTIONS

function afterPlayerMakesMove(realPlayer) {
  let playerCells = document.querySelectorAll("#player-gameboard .grid-cells");

  let validMovesForCpu = getValidMovesForCpu(realPlayer);
  let selectedValidMove = getRandomValidCpuMove(validMovesForCpu);
  realPlayer.gameboard.receiveAttack([
    selectedValidMove[0],
    selectedValidMove[1],
  ]);

  if (
    realPlayer.gameboard.board[selectedValidMove[0]][selectedValidMove[1]] !== 0
  ) {
    playerCells.forEach((cell) => {
      if (
        Number(cell.dataset.indexX) === selectedValidMove[0] &&
        Number(cell.dataset.indexY) === selectedValidMove[1]
      ) {
        cell.style.backgroundColor = "#C41E3A";
      }
    });
  } else if (
    realPlayer.gameboard.board[selectedValidMove[0]][selectedValidMove[1]] === 0
  ) {
    playerCells.forEach((cell) => {
      if (
        Number(cell.dataset.indexX) === selectedValidMove[0] &&
        Number(cell.dataset.indexY) === selectedValidMove[1]
      ) {
        cell.style.backgroundColor = "#5d6675";
      }
    });
  }

  // check if all ships of either realPlayer or cpu are sunk to end the game
  if (realPlayer.gameboard.areAllShipsSunk()) {
 
    cpuGameboard.style.pointerEvents = "none";
    playerGameboard.style.pointerEvents = "none";

    modalHeading.textContent = "DEFEAT!";
    modalDescription.textContent = "They sunk all of your ships captain!";
    modal.showModal();
    onDefeatSound.play();
  } else if (cpuPlayer.gameboard.areAllShipsSunk()) {
    cpuGameboard.style.pointerEvents = "none";
    playerGameboard.style.pointerEvents = "none";

    modalHeading.textContent = "VICTORY!";
    modalDescription.textContent = "You sunk all of their ships captain!";
    modal.showModal();
    onVictorySound.play();
  }
}

function onAttackHitDom(clickedElement) {
  clickedElement.style.backgroundColor = "#C41E3A";
}

function onAttackMissDom(clickedElement) {
  clickedElement.style.backgroundColor = "#5d6675";
}

function onPageLoadDom() {
  playerGameboard.innerHTML = "";
  cpuGameboard.innerHTML = "";

  for (let i = 0; i < 100; i++) {
    let createGridCellForPlayer = createElementFunction("div", ["grid-cells"]);
    let createGridCellForCpu = createElementFunction("div", ["grid-cells"]);

    playerGameboard.append(createGridCellForPlayer);
    cpuGameboard.append(createGridCellForCpu);
  }
}

export { onPageLoadDom };
