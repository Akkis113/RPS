const playOptions = document.querySelector('.playOptions')        // playOptions div
const playGround = document.querySelector('.playGround')          // playGround div
const infoDiv = document.querySelector('.info')                   // info box
const createGameDiv = document.getElementById('create-code')                 // ip address box
const joinGameDiv = document.getElementById('join-code')            // box to enter opponent IP
const createGameLabel = document.querySelector('label[for="create-code"]')  // IP box 1 label
const joinGamelabel = document.querySelector('label[for="join-code"]')  // IP box 2 label
const gameCodeInput = document.getElementById('game-code')     // Opponent IP input box
const createGameBtn = document.getElementById('create_game')      // Create game button
const joinGameBtn = document.getElementById('join_game')          // join game button
const createJoinDiv = document.querySelector('.create-join-btns') // create/join buttons container div

const playComputerButton = document.getElementById('playComputer')
const playOnlineButton = document.getElementById('playOnline')

// player and opponent boxes
const playerBox = document.getElementById('playerBox')
const opponentBox = document.getElementById('opponentBox')
const playerScoreBox = document.getElementById('playerScore')
const opponentScoreBox = document.getElementById('opponentScore')

// game variables
var opponentType = undefined    // who's the opponent
var playerTurn = false          // true if it is player's turn
var playerOption = undefined    // one of Rock, Paper, Scissors
var opponentOption = undefined  // one of Rock, Paper, Scissors
var playerScore = 0             // player score
var opponentScore = 0           // opponent score
var socket                      // socket
var serverURL = 'wss://rps113.herokuapp.com'
// var serverURL = location.origin.replace(/^http/, 'ws')
// var serverURL = 'ws://localhost:3000' // location.origin.replace(/^http/, 'ws')
var socketConnected = false
var gameCode = undefined

// when user selects playComputer
playComputerButton.addEventListener('click', () => {
	// set opponent type
	opponentType = 'computer'
	// hide playOptions
	playOptions.style.display = 'none'
	// show playGround
	playGround.style.display = 'flex'
	// update info
	infoDiv.innerHTML = `<p>Press R (Rock), P (Paper) or S (Scissors)</p>`
	// first turn player
	playerTurn = true
	// initial scores
	playerScoreBox.innerHTML = playerScore
	opponentScoreBox.innerHTML = opponentScore
})

// when user selects playOnline
playOnlineButton.addEventListener('click', () => {
	// set opponent type
	opponentType = 'online'
	// hide playOptions
	playOptions.style.display = 'none'
	// show create/join game buttons
	createJoinDiv.style.display = 'flex'
	// update info div
	infoDiv.innerHTML = '<p>connecting to server...</p>'
	// webSocket
	socket = new WebSocket(serverURL)
	// when socket opens i.e. connects to server
	socket.onopen = function (e) {
		console.log("[open] Connection established");
		infoDiv.innerHTML = `<p>Create/Join game</p>`
		socketConnected = true
	};
	// when socket receives message from server
	socket.onmessage = function (event) {
		data = JSON.parse(event.data)
		if (data.type === 'game code') {
			gameCode = data.code
			displayGameCode()
		}
		else if (data.type === 'paired') {
			// hide create join buttons
			createJoinDiv.style.display = 'none'
			// hide labels and inputs
			createGameLabel.style.display = 'none'
			joinGamelabel.style.display = 'none'
			createGameDiv.style.display = 'none'
			joinGameDiv.style.display = 'none'
			// show playGround
			playGround.style.display = 'flex'
			// update info
			infoDiv.innerHTML = `<p>Press R (Rock), P (Paper) or S (Scissors)</p>`
			// first turn player
			playerTurn = true
			// initial scores
			playerScoreBox.innerHTML = playerScore
			opponentScoreBox.innerHTML = opponentScore
		}
		else if (data.type === 'opponentOption') {
			opponentOption = data.choice
			if (playerOption !== undefined) {
				showResult()
			}
		}
		else if (data.type === 'error') {
			alert(`[error] ${data.e}`)
		}
	};
	// when socket closes
	socket.onclose = function (event) {
		socketConnected = false
		if (event.wasClean) {
			alert(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
		} else {
			// e.g. server process killed or network down
			// event.code is usually 1006 in this case
			alert('[close] Connection died');
		}
	};
	// when socket has error
	socket.onerror = function (error) {
		console.log(`[error] ${error.message}`)
	};
})

// when user click create game button
createGameBtn.addEventListener('click', () => {
	joinGameBtn.style.display = 'none'
	if (socketConnected) {
		try {
			infoDiv.innerHTML = '<p>Requesting game code...</p>'
			socket.send(JSON.stringify({ type: 'create code' }))
		} catch (e) {
			console.log(e)
		}
	}
})

// Display game code
function displayGameCode() {
	createGameDiv.innerHTML = gameCode
	createGameDiv.style.display = 'flex'
	infoDiv.innerHTML = '<p>Share this code</p>'
}

// when user clicks join game button
joinGameBtn.addEventListener('click', () => {
	createGameBtn.style.display = 'none'
	joinGameDiv.style.display = 'flex'
})

// when user submits game code for joining
gameCodeInput.addEventListener('change', () => {
	gameCode = gameCodeInput.value
	if (socketConnected) {
		try {
			socket.send(JSON.stringify({ type: 'join code', code: gameCode }))
		} catch (error) {
			console.log(e)
		}
	}
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
		else {
			if (opponentOption !== undefined) {
				showResult()
			}
			try {
				socket.send(JSON.stringify({ type: 'choice', choice: playerOption }))
			} catch (error) {
				alert(`[error] ${error}`)
			}
		}
	}
}

function replay() {
	// reset variables for same game type
	playerTurn = false
	playerBox.setAttribute('class', 'box')
	opponentBox.setAttribute('class', 'box')
	playerBox.innerHTML = 'Make your move...'
	opponentBox.innerHTML = 'Waiting...'
	infoDiv.innerHTML = `<p>Press R (Rock), P (Paper) or S (Scissors)</p>`
	playerOption = undefined
	opponentOption = undefined
	if (opponentType === 'computer') {
		playerTurn = true
	}
	else {
		try {
			socket.send(JSON.stringify({ type: 'replay' }))
		} catch (error) {
			alert(`[error] ${error}`)
		}
	}

}

function showResult() {
	if (opponentOption === 'Rock') {
		// put rock image in opponent box
		opponentBox.innerHTML = `<img src="./rock.jpg"/>`
	}
	else if (opponentOption === 'Paper') {
		// put paper image in opponent box
		opponentBox.innerHTML = `<img src="./paper.png"/>`
	}
	else if (opponentOption === 'Scissors') {
		// put scissors image in opponent box
		opponentBox.innerHTML = `<img src="./scissor.jpg"/>`
	}
	if (playerOption === opponentOption) {
		// Tie
		infoDiv.innerHTML = '<p>Tie :\\</p>'
		setTimeout(replay, 1000)
	}
	else if ((playerOption === 'Rock' && opponentOption === 'Paper') || (playerOption === 'Paper' && opponentOption === 'Scissors') || (playerOption === 'Scissors' && opponentOption === 'Rock')) {
		// You lose
		opponentScore++
		playerBox.classList.add('loserBox')
		opponentBox.classList.add('winnerBox')
		document.body.setAttribute('class', 'loserBackground')
		setTimeout(() => {
			document.body.removeAttribute('class')
		}, 1000)
		if (opponentType === 'computer') {
			infoDiv.innerHTML = `<p>You Lost :( <a onclick="replay()">Replay</a></p>`
		}
		else {
			infoDiv.innerHTML = `<p>You Lost :(</p>`
			setTimeout(replay, 1000)
		}
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
		if (opponentType === 'computer') {
			infoDiv.innerHTML = `<p>You Won :) <a onclick="replay()">Replay</a></p>`
		}
		else {
			infoDiv.innerHTML = `<p>You Won :)</p>`
			setTimeout(replay, 1000)
		}
	}
	playerScoreBox.innerHTML = playerScore
	opponentScoreBox.innerHTML = opponentScore
}