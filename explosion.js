function explosion(id)
{
	this.id = id;
	this.pos = new v3(0,0,0);
	this.t = 0;
	this.tMax = 45;
	this.initialScale = 1;
	this.model = 9;
}
explosion.prototype.update = function()
{
	this.t++;
	if (this.t >= this.tMax)
		explosions.splice(explosions.indexOf(this),1);
}
