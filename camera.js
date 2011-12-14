function camera ()
{
	this.yaw = 0;
	this.pitch = -90;
	this.roll = 0;
	this.pos = new v3(0,500,30);
	
	this.fwd;
	this.bck;
	this.right;
	this.left;
}

camera.prototype.update = function()
{
	if (this.pos.z > -levelLength && human.state == 1)
	{
		//update levelBackground.pos here
		this.pos.z -= 1.5;
	}
}