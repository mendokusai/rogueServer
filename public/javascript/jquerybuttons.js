Game.clickButton = function(clickInput) {
	this._clickInput = clickInput;
};



cheet('↑ ↑ ↓ ↓ ← → ← → w a', function () {
  alert('Konami!!');
});


$('button').on('click', function(){
	var value = $(this).attr("value");
	//actions
	if (value === 'enter') {
		if (Game.Screen.startScreen) {
			Game.switchScreen(Game.Screen.playScreen);
		}
	} else {
		Game.Screen.playScreen.handleInput(null, null, value);
	}
});