const playOptions = document.querySelector('.playOptions') // playOptions div
const playGround = document.querySelector('.playGround')   // playGround div
const infoDiv = document.querySelector('.info')            // info box

const playComputerButton = document.getElementById('playComputer')
const playOnlineButton = document.getElementById('playOnline')

// player and opponent boxes
const playerBox = document.getElementById('playerBox')
const opponentBox = document.getElementById('opponentBox')
const playerScoreBox = document.getElementById('playerScore')
const opponentScoreBox = document.getElementById('opponentScore')

// game variables
var opponentType = 'computer'   // who's the opponent
var playerTurn = false          // true if it is player's turn
var playerOption = undefined    // one of Rock, Paper, Scissors
var opponentOption = undefined  // one of Rock, Paper, Scissors
var playerScore = 0             // player score
var opponentScore = 0           // opponent score

// when user selects playComputer
playComputerButton.addEventListener('click', () => {
    // hide playOptions
    playOptions.style.display = 'none'
    // show playGround
    playGround.style.display = 'flex'
	// show score box
	playerScoreBox.parentElement.style.display = 'flex'
    // update info
    infoDiv.innerHTML = `<p>Press R (Rock), P (Paper) or S (Scissors)</p>`
    // first turn player
    playerTurn = true
    // initial scores
    playerScoreBox.innerHTML = playerScore
    opponentScoreBox.innerHTML = opponentScore
})

// listen for key events
document.onkeydown = (e) => {
    if (playerTurn) {
        if (e.keyCode === 82) {
            // R key
            playerOption = 'Rock'
            // put rock image in player box
            playerBox.innerHTML = `<img src="./rock.jpg"/>`
        }
        else if (e.keyCode === 80) {
            // P key
            playerOption = 'Paper'
            // put paper image in player box
            playerBox.innerHTML = `<img src="./paper.png"/>`
        }
        else if (e.keyCode === 83) {
            // S key
            playerOption = 'Scissors'
            // put scissors image in player box
            playerBox.innerHTML = `<img src="./scissor.jpg"/>`
        }
        else {
            return
        }
        playerTurn = false
        if (opponentType === 'computer') {
            opponentOption = Math.floor(Math.random() * 3) // randomly select a number from [0,2]
            if (opponentOption === 0) {
                opponentOption = 'Rock'
                // put rock image in opponent box
                opponentBox.innerHTML = `<img src="./rock.jpg"/>`
            }
            else if (opponentOption === 1) {
                opponentOption = 'Paper'
                // put paper image in opponent box
                opponentBox.innerHTML = `<img src="./paper.png"/>`
            }
            else if (opponentOption === 2) {
                opponentOption = 'Scissors'
                // put scissors image in opponent box
                opponentBox.innerHTML = `<img src="./scissor.jpg"/>`
            }
            showResult()
        }
    }
}

function replay() {
    // reset variables for same game type
    playerTurn = false
    playerOption = undefined
    opponentOption = undefined
    playerBox.setAttribute('class', 'box')
    opponentBox.setAttribute('class', 'box')
    playerBox.innerHTML = 'Make your move...'
    opponentBox.innerHTML = 'Waiting...'
    infoDiv.innerHTML = `<p>Press R (Rock), P (Paper) or S (Scissors)</p>`
    playerTurn = true
}

function showResult() {
    if(playerOption===opponentOption){
        // Tie
        infoDiv.innerHTML = '<p>Tie :\\</p>'
        setTimeout(replay, 1000)
    }
    else if ((playerOption === 'Rock' && opponentOption === 'Paper') || (playerOption === 'Paper' && opponentOption === 'Scissors') || (playerOption === 'Paper' && opponentOption === 'Scissors')) {
        // You lose
        opponentScore++
        playerBox.classList.add('loserBox')
        opponentBox.classList.add('winnerBox')
        document.body.setAttribute('class', 'loserBackground')
        setTimeout(() => {
            document.body.removeAttribute('class')
        }, 1000)
        infoDiv.innerHTML = `<p>You Lost :( <a onclick="replay()">Replay</a></p>`
    }
    else {
        // You win
        playerScore++
        playerBox.classList.add('winnerBox')
        opponentBox.classList.add('loserBox')
        document.body.setAttribute('class', 'winnerBackground')
        setTimeout(() => {
            document.body.removeAttribute('class')
        }, 1000)
        infoDiv.innerHTML = `<p>You Won :) <a onclick="replay()">Replay</a></p>`
    }
    playerScoreBox.innerHTML = playerScore
    opponentScoreBox.innerHTML = opponentScore
}