Game.clickButton = function(clickInput) {
	this._clickInput = clickInput;
};



cheet('↑ ↑ ↓ ↓ ← → ← → w a', function () {
  alert('Konami!!');
});


$('button').on('click', function(){
	var value = $(this).attr("value");
	//actions
	if (value === 'eat') {
		console.log('food!');

	} else if (value === 'weapon') {
		console.log('weapon');

	} else if (value === 'wear') {
		console.log('clothes!');

	} else if (value === 'drop') {
		console.log('drop!');

	} else if (value === 'grab') {
		console.log('grab!');

	//directions	
	} else if (value === 'up') {
		console.log('up!');


	} else if (value === 'down') {
		console.log('down!');
		clickInput = 'down';
		return clickInput;

	} else if (value === 'left') {

		console.log('left!');

	} else if (value === 'right') {
		console.log('right!');

	} else if (value === 'enter') {
		console.log('enter!');
		Game.switchScreen(Game.Screen.playScreen);

	} else {
		console.log ("nada");
	}
});