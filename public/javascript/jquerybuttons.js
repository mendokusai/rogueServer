

cheet('↑ ↑ ↓ ↓ ← → ← →', function () {
  alert('Konami!!');
  if (Game.Screen.startScreen) {
			Game.PlayerTemplate.maxHp = 80;
			this.setHp(this.getMaxHp());
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