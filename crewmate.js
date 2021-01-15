var CrewMate = {

	suits: ['Blue', 'Yellow', 'Pink', 'Green', 'Black'],

	logTexts: [
		{play: 'plays', mission: 'new mission'}, // English
		{play: 'joue', mission: 'une nouvelle mission'} // French
	],

	toolTips: {
		CommanderDelegate: 'The Commander asks each crew member whether they are fit to take on all the tasks. It may only be answered with "yes" or "no". Afterwards, your Commander decides who actually receives the assignment and then the task cards are revealed. The Commander may not choose themself.',
		CommanderDistribute: 'Your Commander uncovers task cards one at a time and asks each crew member in turn whether they want to take on the task. It may only be answered with "yes" or "no". Afterwards, your Commander decides who actually receives the assignment. The Commander may choose themself. Repeat the process until all the tasks are distributed. The tasks must be distributed evenly.',
		Deadzone: 'Your communication has been disrupted and you only have limited communication. When you want to communicate, place your card in front of you as you normally would. It must meet one of the three conditions (highest, single or lowest of the cards in your hand of that suit). You are not, however, allowed to place your radio communicatioon token on the card. The other crew members must use their intuition to determine what information is being transmitted.',
		SecondTrick: "Communication is completely disrupted for a short period of time.\nYou may communicate normally from the beginning of the second trick onwards.",
		ThirdTrick: "Communication is completely disrupted for a short period of time.\nYou may communicate normally from the beginning of the third trick onwards."
	},

	missions: {
		6:  {icon: 'Deadzone'},
		14: {icon: 'Deadzone'},
		18: {icon: 'SecondTrick'},
		19: {icon: 'ThirdTrick'},
		20: {
			icon: 'CommanderDelegate',
			text: 'Finally, the dust cloud clears and the wild swings of the communication module have noticeably reduced. Before you appears Jupiter in all its splendor. The gas giant is clearly appropriately named. Your absolute awe is interrupted when you notice the two damaged radar sensors.',
			hint: 'b>Your Commander chooses a crew member who receives the tasks and carries out the repair. The Commander cannot choose themself.'
		},
		21: {icon: 'Deadzone'},
		24: {icon: 'CommanderDistribute'},
		25: {icon: 'Deadzone'},
		27: {
			icon: 'CommanderDelegate',
			text: 'You determine that the tear in the hull was not without consequences. A review of the modules associated with the area indicates damage to the flux capacitor. Although currently this is not a major problem, repairs will be necessary in the long-run, if you want to make it home.',
			hint: 'Your Commander specifies who should carry out the repair. The Commander cannot choose themself.'
		},
		28: {icon: 'ThirdTrick'},
		29: {icon: 'Deadzone'},
		30: {icon: 'SecondTrick'},
		32: {icon: 'CommanderDistribute'},
		36: {icon: 'CommanderDistribute'},
		37: {
			icon: 'CommanderDelegate',
			text: 'You reach the dwarf planet Pluto. Many years ago it would have been the ninth planet. You take a moment to reminisce about how your very educated mother used to serve you noodles, and talk to you about the planets while you reflect on the changeability of things. Nevertheless, the ship must be kept on course',
			hint: 'The Commander chooses a crew member who should take care of it. The Commander cannot choose themself.'
		},
		38: {icon: 'ThirdTrick'},
		39: {icon: 'Deadzone'},
		43: {icon: 'CommanderDistribute'},
	},

	isFirefox: (navigator.userAgent.toLowerCase().indexOf('firefox') > -1),
	isChrome: (navigator.userAgent.toLowerCase().indexOf('chrome') > -1),

	observeDomChanges: function() {
		if (CrewMate.domObserver) {
			// Setup a listener to react to changes in the dom
			CrewMate.domObserver.observe(document.body, {
				// Childlist = observe additions or deletions of child nodes. The callback just has to ignore the deletions.
			    'childList': true, 
			    // By default it just observes direct children - this makes it do grandchildren, great-grandchildren etc.
			    'subtree': true
			});
		}
	},
	domChangeCallback: function(mutations) {
		// Respond to a dom change
		mutations.map(function(mutation) {
			// Look through added nodes for new log entries.
		    var nodes = mutation.addedNodes;
		    for (var i=0; i<nodes.length; i++) {
	    		// Check the new node is not a script, a stylesheet, a textarea or an input...
	    		if ((!/^(a|button|input|textarea|script|style)$/i.test(nodes[i].tagName)) && (!nodes[i].isContentEditable)) {
					var node = $(nodes[i]);
					if (node.hasClass('log_replayable')) {
						CrewMate.process(node);
					}
				}
			}
			// If this is a change to the mission number.
			if ($(mutation.target).attr('id') == 'mission_counter') {
				CrewMate.setMissionNumber(parseInt($(mutation.target).text()));
			}
			// Or end mission message.
			else if ($(mutation.target).attr('id') == 'endResult') {
				// Change end game wording
				var wording = 'Do you want to continue?';
				if ($(mutation.target).find('span.success').length > 0) { // success
					wording = 'Do you want to continue to the next mission?';
				}
				if ($(mutation.target).find('span.failure').length > 0) { // failure
					wording = 'Do you want to try this mission again?';
				}
				$('#endPanelMiddle').find('.to_translate').each(function(index, element) {
					if ($(element).text().indexOf('Do you want to ') > -1) {
						$(element).text(wording);
					}
				});
			}
		});
	},
	getURL: function(filename) {
		if (CrewMate.isFirefox) {
			return browser.runtime.getURL(filename);
		}
		else if (CrewMate.isChrome) {
			return chrome.extension.getURL(filename);
		}
	},
	loadCSS: function(url) {
		var link = document.createElement("LINK");
		link.href = url;
		link.type = "text/css";
		link.rel = "stylesheet";
		document.getElementsByTagName("HEAD")[0].appendChild(link);
	},

	setMissionNumber(missionNumber) {
		var info = CrewMate.missions[missionNumber];
		if (typeof info === 'undefined') return;

		// Update the mission text if specified.
		if (typeof info.text !== 'undefined') {
			var newMissionDiv = document.createElement("div");
			newMissionDiv.id = 'mission_description';
			newMissionDiv.appendChild(document.createTextNode(info.text));
			var hint = document.createElement("strong");
			hint.appendChild(document.createTextNode(info.hint));
			newMissionDiv.appendChild(hint);
			$('#mission_description').replaceWith(newMissionDiv);
		}
		// Add the icon if specified
		if (typeof info.icon !== 'undefined') {
			var icon = document.createElement("div");
			icon.className = 'crewMateIcon crewMate' + info.icon;
			icon.title = CrewMate.toolTips[info.icon];
			if ($('.crewMateIcon').length === 0) {
				$('#mission_description').append(icon);
			}
			else {
				$('.crewMateIcon').replaceWith(icon);
			}
		}
	},

	process: function(node) {
		// Process a log entry.
		var logMessage = node.text();
		for (var i=0; i<CrewMate.logTexts.length; i++) {
			var test = CrewMate.logTexts[i];
			if (logMessage.indexOf(test.play) > -1) { // Player plays a card
				node.find('strong').each(function(index, element) {
					var suit = $(element).attr('class');
					suit = suit[0].toUpperCase() + suit.substring(1);
					var rank = $(element).html();
					if (!CrewMate.played[suit]) CrewMate.played[suit] = {};
					CrewMate.played[suit][rank] = 1;
				});
				CrewMate.updateDisplay();
			}
			else if (logMessage.indexOf(test.mission) > -1) { // New mission started
				CrewMate.reset();
			}
		}
	},

	updateDisplay: function() {
		// Update the discard pile display.
		//console.log('Updating display');
		var suits = Object.keys(CrewMate.played);
		for (var i=0; i<suits.length; i++) {
			var suit = suits[i];
			var ranks = Object.keys(CrewMate.played[suit]);
			for (var j=0; j<ranks.length; j++) {
				var rank = ranks[j];
				//console.log(suit + rank);
				$(CrewMate.discardPile).find('.discardCard' + suit + rank).text(rank);
			}
		}
	},

	reset: function() {
		// Reset the played list.
		CrewMate.played = {};
		// Create a blank discard pile display.
		$('.discardPiles').remove();
		var discardPileDiv = document.createElement("div");
		discardPileDiv.className = 'discardPiles';
		var title = document.createElement("h3");
		title.appendChild(document.createTextNode('Played Cards'));
		discardPileDiv.appendChild(title);
		for (var i=0; i<CrewMate.suits.length; i++) {
			discardPileDiv.appendChild(CrewMate.createSuitDiv(CrewMate.suits[i]));
		}
		CrewMate.discardPile = $('#right-side-first-part').append(discardPileDiv);
	},

	createSuitDiv: function(suit) {
		// Create a discard pile for the specified suit.
		var result = document.createElement("div");
		result.className = 'discardPile discardPile' + suit;
		var title = document.createElement("div");
		title.className = 'discardTitle discardCard' + suit;
		title.appendChild(document.createTextNode(suit));
		result.appendChild(title);
		var icon = document.createElement("div");
		icon.className = 'discardIcon logicon ' + suit.toLowerCase();
		icon.title = suit;
		result.appendChild(icon);
		for (var i=9; i>=1; i--) {
			var rankDiv = document.createElement("div");
			rankDiv.className = 'discardCard discardCard' + suit + ' discardCard' + suit + i;
			result.appendChild(rankDiv);
		}
		return result;
	},

	load: function() {
		$(document).ready(function() {
			// Check this is a game of The Crew and not something else.
			if ($('#mission_description').length == 0 && $('#thecrewbugfix-table').length == 0) return;

			console.log('CrewMate loading...');
			CrewMate.loadCSS(CrewMate.getURL('crewmate.css'));
			CrewMate.reset();

			// Setup the mutation observer to pickup any changes to the DOM
			if (typeof(MutationObserver) !== 'undefined') {
				CrewMate.domObserver = new MutationObserver(CrewMate.domChangeCallback);
				CrewMate.observeDomChanges();
			}
		});
	}
}

CrewMate.load();