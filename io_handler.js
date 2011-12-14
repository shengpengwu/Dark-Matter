function handleMouseMove(evt)
{
	if (playState == 1)
	{
		if (aimType)
		{
			if ((evt.clientX-10)/canvas.width > .5)
			{
				human.yaw = Math.min(30,30*(canvas.width/2-Math.min((evt.clientX-10),canvas.width))/(canvas.width/2));
			}
			else if ((evt.clientX-10)/canvas.width < .5)
			{
				human.yaw = Math.max(-30,-30*((evt.clientX-10)-canvas.width/2)/(canvas.width/2));
			}
			else
			{
				human.yaw = 0;
			}
		}
		else
		{
			mousex = Math.max(0,Math.min(canvas.width,evt.clientX-10));
			mousez = Math.max(0,Math.min(canvas.height,evt.clientY-10));
		}
	}
}
function handleMouseDown(evt)
{
	human.fire = true;
}
function handleMouseUp(evt)
{
	human.fire = false;
}
function handleKeyDown(evt) {
		switch (evt.keyCode) {
			case 87:  /* Up arrow was pressed */
				human.fwd = true;
			break;
			case 83:  /* Down arrow was pressed */
				human.bck = true;
			break;
			case 65:  /* Left arrow was pressed */
				human.left = true;
			break;
			case 68:  /* Right arrow was pressed */
				human.right = true;
			break;
		}
}
function handleKeyUp(evt) {
		switch (evt.keyCode) {
			case 87:  /* Up arrow was pressed */
				human.fwd = false;
			break;
			case 83:  /* Down arrow was pressed */
				human.bck = false;
			break;
			case 65:  /* Left arrow was pressed */
				human.left = false;
			break;
			case 68:  /* Right arrow was pressed */
				human.right = false;
			break;
			case 32:
				human.useBomb();
			break;
			case 69:
				if (human.phase_cooldown <= 0)
				{
					human.phase = !human.phase;
					human.phase_cooldown = 300;
					phaseOutTime = 60;
				}
			break;
			case 80:
				aimType = !aimType;
			break;
		}
}