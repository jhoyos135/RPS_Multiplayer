document.addEventListener('DOMContentLoaded', () => {

	let p1display = document.querySelector("#p1display");
	let p2display = document.querySelector("#p2display");

	let chatText = document.querySelector('#chat-text');

	// firebase project configuration settings
	const config = {
		apiKey: "AIzaSyB-AFFloR1fkcEQewi8GxRQ65HPeMzINUM",
		authDomain: "bootcamp-5f71e.firebaseapp.com",
		databaseURL: "https://bootcamp-5f71e.firebaseio.com",
		projectId: "bootcamp-5f71e",
		storageBucket: "bootcamp-5f71e.appspot.com",
		messagingSenderId: "864146685641"
	  };
	
	// Initialize the FireBase Database connection
	firebase.initializeApp(config);
	
	const database = firebase.database();
	
	let p1 = null;
	let p2 = null;
	
	let p1name = "";
	let p2name = "";
	
	let yourPlayerName = "";
	
	let p1Choice = "";
	let p2Choice = "";
	
	let turn = 1;
	
	database.ref("/players/").on("value", function(snapshot) {
		
		if (snapshot.child("p1").exists()) {
	
			p1 = snapshot.val().p1;
			p1name = p1.name;
	
			// display player 1's name and score 
			p1display.innerHTML = `
			<div class="card text-white bg-dark mb-3">
			<div class="card-header">
			${p1name}
			</div>
			<ul class="list-group list-group-flush text-dark">
			<li class="list-group-item">Wins: ${p1.win} </li>
			<li class="list-group-item">Losses: ${p1.loss} </li>
			<li class="list-group-item">Ties: ${p1.tie} </li>
			</ul>
			</div>
			`;

		} else {
			
			p1 = null;
			p1name = "";
	
			p1display.textContent = 'Waiting for Player 1 to enter a name...';
			database.ref("/outcome/").remove();

		}
	
		if (snapshot.child("p2").exists()) {
	
			p2 = snapshot.val().p2;
			p2name = p2.name;
	
			// display player 1's name and score 
			p2display.innerHTML = `
			<div class="card text-white bg-dark mb-3">
			<div class="card-header">
			${p2name}
			</div>
			<ul class="list-group list-group-flush text-dark">
			<li class="list-group-item">Wins: ${p2.win} </li>
			<li class="list-group-item">Losses: ${p2.loss} </li>
			<li class="list-group-item">Ties: ${p2.tie} </li>
			</ul>
			</div>
			`;

		} else {
			p2 = null;
			p2name = "";
	
			p2display.textContent = 'Waiting for Player 2 to enter a name...';

			database.ref("/outcome/").remove();

		}
		
		// If both players are now present, it's player 1s turn
		if (p1 && p2) {

			console.log('both here');
			document.querySelector("#formcontain").classList.add('d-none');
			// Update the display with a green bg for player 1
			p1display.classList.add("yourTurn");
			document.querySelector("#p1display .card").classList.add("bg-success");
			document.querySelector("#p1display .card").classList.remove("bg-dark");

			document.querySelector("#outcome").textContent = "Waiting on " + p1name + " to choose...";
		}
	
		// If both players leave, empty the chat
		if (!p1 && !p2) {
			database.ref("/chat/").remove();
			database.ref("/turn/").remove();
			database.ref("/outcome/").remove();
			document.querySelector("#chatdisplay").innerHTML = '';
			p1display.classList.remove("yourTurn");
			p2display.classList.remove("yourTurn");

		}
		
	});

	database.ref("/players/").on("child_removed", (snapshot) => {
		let msg = snapshot.val().name + " has disconnected!";
	
		// use a unique key for the disconnection chat entry
		let chatKey = database.ref().child("/chat/").push().key;
	
		// save the disconnection chat entry to the database with the key
		database.ref("/chat/" + chatKey).set(msg);
	});

	database.ref("/chat/").on("child_added", function(snapshot) {
		let chatdisplay = document.querySelector("#chatdisplay");
		// get the new message from the database
		let chatMsg = snapshot.val();
		let chatEntry;
		
			chatEntry = `
			<div class="pcolor">
			${chatMsg}
			</div>
			`;

		
	
		chatdisplay.innerHTML += chatEntry;
		// use ScrollHeight to keep the chat going up
		chatdisplay.scrollTop = chatdisplay.scrollHeight;
	});
	
	
	database.ref("/turn/").on("value", function(snapshot) {
		// Check if it's p1's turn
		if (snapshot.val() === 1) {
			turn = 1;

			if (p1 && p2) {
				p1display.classList.add("yourTurn");
				p2display.classList.remove("yourTurn");

				document.querySelector("#outcome").textContent = "Waiting on " + p1name + " to choose...";
			}
			
			// Update the bg displays
		} else if (snapshot.val() === 2) {
			turn = 2;
			if (p1 && p2) {
				p1display.classList.remove("yourTurn");
				p2display.classList.add("yourTurn");
				document.querySelector("#p1display .card").classList.remove("bg-success");
				document.querySelector("#p1display .card").classList.add("bg-dark");
				document.querySelector("#p2display .card").classList.add("bg-success");
				document.querySelector("#p2display .card").classList.remove("bg-dark");
	
				document.querySelector("#outcome").textContent = "Waiting on " + p2name + " to choose...";
			}
		}
	});
	
	document.querySelector("#add-name").addEventListener("click", (event) => {
		event.preventDefault();

		if ( (document.querySelector("#name-input").value.trim() !== "") && !(p1 && p2) ) {

			if (p1 === null) {
	
			yourPlayerName = document.querySelector("#name-input").value.trim();
				p1 = {
					name: yourPlayerName,
					win: 0,
					loss: 0,
					tie: 0,
					choice: ""
				};
	
				// if there is no player 1, write the above object to the db
				database.ref().child("/players/p1").set(p1);
	
				// set turn to 1 becauase player 1 goes first
				database.ref().child("/turn").set(1);

				database.ref("/players/p1").onDisconnect().remove();
				
		} else if ( (p1 !== null) && (p2 === null) ) {
			yourPlayerName = document.querySelector("#name-input").value.trim();
				p2 = {
					name: yourPlayerName,
					win: 0,
					loss: 0,
					tie: 0,
					choice: ""
				};
	
				database.ref().child("/players/p2").set(p2);
	
				database.ref("/players/p2").onDisconnect().remove();
			}
	
			// print a message to the chat when a user joins
			let msg = yourPlayerName + " has joined!";
			let chatKey = database.ref().child("/chat/").push().key;
			// push message to the database
			database.ref("/chat/" + chatKey).set(msg);
	
			document.querySelector("#formcontain").classList.add('d-none');
		}
	});
	

	document.querySelector("#chat-send").addEventListener("click", (e) => {
		e.preventDefault();

		if ( (yourPlayerName !== "") && (chatText.value.trim() !== "") ) {

			let msg = ` ${yourPlayerName} : ${chatText.value.trim()} `;
			chatText.value = '';
	
			let chatKey = database.ref().child("/chat/").push().key;
	
			database.ref("/chat/" + chatKey).set(msg);
		}
	});
	
	document.querySelector("#rock").addEventListener("click", function() {

		if (p1 && p2 && (yourPlayerName === p1.name) && (turn === 1) ) {

			let choice = this.textContent.trim();
			p1Choice = choice;

			database.ref().child("/players/p1/choice").set(choice);
	
			turn = 2;
			database.ref().child("/turn").set(2);
		}
	});
	
	document.querySelector("#paper").addEventListener("click", function() {

		if (p1 && p2 && (yourPlayerName === p1.name) && (turn === 1) ) {

			let choice = this.textContent.trim();
			// Record the player choice into the database
			p1Choice = choice;
			database.ref().child("/players/p1/choice").set(choice);
	
			// Set the turn value to 2, as it is now player 2s turn
			turn = 2;
			database.ref().child("/turn").set(2);
		}
	});
	
	document.querySelector("#scissors").addEventListener("click", function() {

		if (p1 && p2 && (yourPlayerName === p1.name) && (turn === 1) ) {

			let choice = this.textContent.trim();

			p1Choice = choice;
			database.ref().child("/players/p1/choice").set(choice);
	
			turn = 2;
			database.ref().child("/turn").set(2);
		}
	});
	

	document.querySelector("#rock").addEventListener("click", function() {
	
		// Make selections only when both players are in the game
		if (p1 && p2 && (yourPlayerName === p2.name) && (turn === 2) ) {

			let choice = this.textContent.trim();
	
			p2Choice = choice;
			database.ref().child("/players/p2/choice").set(choice);
	
			// Compare choices
			compareChoices();
		}
	});
	
	document.querySelector("#paper").addEventListener("click", function() {
	
		// Make selections only when both players are in the game
		if (p1 && p2 && (yourPlayerName === p2.name) && (turn === 2) ) {

			let choice = this.textContent.trim();
	
			p2Choice = choice;
			database.ref().child("/players/p2/choice").set(choice);
	
			compareChoices();
		}
	});
	
	document.querySelector("#scissors").addEventListener("click", function() {
	
		// Make selections only when both players are in the game
		if (p1 && p2 && (yourPlayerName === p2.name) && (turn === 2) ) {

			let choice = this.textContent.trim();
	
			p2Choice = choice;
			database.ref().child("/players/p2/choice").set(choice);
	
			compareChoices();
		}
	});
	
	// rps logic
	let compareChoices = () => {
		if (p1.choice === "Rock") {
			if (p2.choice === "Rock") {
				// Tie
				alert("tie");
				database.ref().child("/outcome/").set("Tie game!");
				database.ref().child("/players/p1/tie").set(p1.tie + 1);
				database.ref().child("/players/p2/tie").set(p2.tie + 1);
			} else if (p2.choice === "Paper") {
				// p2 wins
				alert("paper wins");
				database.ref().child("/outcome/").set("Paper wins!");
				database.ref().child("/players/p1/loss").set(p1.loss + 1);
				database.ref().child("/players/p2/win").set(p2.win + 1);
			} else { // scissors
				// p1 wins
				alert("rock wins");
				database.ref().child("/outcome/").set("Rock wins!");
				database.ref().child("/players/p1/win").set(p1.win + 1);
				database.ref().child("/players/p2/loss").set(p2.loss + 1);
			}
		} else if (p1.choice === "Paper") {
			if (p2.choice === "Rock") {
				// p1 wins
				alert("paper wins");
				database.ref().child("/outcome/").set("Paper wins!");
				database.ref().child("/players/p1/win").set(p1.win + 1);
				database.ref().child("/players/p2/loss").set(p2.loss + 1);
			} else if (p2.choice === "Paper") {
				// Tie
				alert("tie");
				database.ref().child("/outcome/").set("Tie game!");
				database.ref().child("/players/p1/tie").set(p1.tie + 1);
				database.ref().child("/players/p2/tie").set(p2.tie + 1);
			} else { // Scissors
				// p2 wins
				alert("scissors win");
				database.ref().child("/outcome/").set("Scissors win!");
				database.ref().child("/players/p1/loss").set(p1.loss + 1);
				database.ref().child("/players/p2/win").set(p2.win + 1);
			}
		} else if (p1.choice === "Scissors") {
			if (p2.choice === "Rock") {
				// p2 wins
				alert("rock wins");
	
				database.ref().child("/outcome/").set("Rock wins!");
				database.ref().child("/players/p1/loss").set(p1.loss + 1);
				database.ref().child("/players/p2/win").set(p2.win + 1);
			} else if (p2.choice === "Paper") {
				// p1 wins
				alert("scissors win");
	
				database.ref().child("/outcome/").set("Scissors win!");
				database.ref().child("/players/p1/win").set(p1.win + 1);
				database.ref().child("/players/p2/loss").set(p2.loss + 1);
			} else {
				// Tie
				alert("tie");
	
				database.ref().child("/outcome/").set("Tie game!");
				database.ref().child("/players/p1/tie").set(p1.tie + 1);
				database.ref().child("/players/p2/tie").set(p2.tie + 1);
			}
		}

		turn = 1;
		database.ref().child("/turn").set(1);
	};

});


