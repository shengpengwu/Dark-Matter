function bomb(id)
{
	this.id = id;
	this.pos = new v3(0,0,0);
	this.rot = Math.random()*360;
	this.type = 1; //bomb
	this.radius = 20;
	this.model = 7;
}
bomb.prototype.collect = function()
{
	if (human.numBombs < 8)
	{
		human.numBombs++;
		drawGUI();
	}
	items.splice(items.indexOf(this),1);
}
bomb.prototype.update = function()
{
	this.rot += 2;
	this.rot = this.rot%360;
	if (this.pos.z > cam.pos.z+300)
		this.offScreen();
}
bomb.prototype.offScreen = function()
{
	items.splice(items.indexOf(this),1);
}
function life(id)
{
	this.id = id;
	this.pos = new v3(0,0,0);
	this.rot = Math.random()*360;
	this.type = 2; //bomb
	this.radius = 20;
	this.model = 10;
}
life.prototype.collect = function()
{
	if (human.numLives < 6)
	{
		human.numLives++;
		drawGUI();
	}
	items.splice(items.indexOf(this),1);
}
life.prototype.update = function()
{
	this.rot += 2;
	this.rot = this.rot%360;
	if (this.pos.z > cam.pos.z+300)
		this.offScreen();
}
life.prototype.offScreen = function()
{
	items.splice(items.indexOf(this),1);
}