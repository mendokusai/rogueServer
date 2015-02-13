

cheet('↑ ↑ ↓ ↓ ← → ← →', function () {
  alert('Konami!!');
  window.open('https://www.youtube.com/watch?v=LsBrmSNBH5g&list=RDLsBrmSNBH5g#', '_blank');
  if (Game.Screen.startScreen) {
			var max = Game.PlayerTemplate.maxHp;
			max = 80;
			Game._currentScreen._player.increaseMaxHp(max)

		}
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