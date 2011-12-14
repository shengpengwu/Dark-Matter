function bossEvent()
{
	this.zpos;
	this.pos = new v3(0,0,0);
	this.rot = new v3(0,0,0);
	this.scale = new v3(1,1,1);
	this.radius;
	this.model = 11;
	this.hp;
	this.maxHP;
	this.fireRate = 20;
	this.triggered = false;
	this.flash = false;
	this.hit_timer = 0;
	this.maxTurn = 2.5;
	this.thetaGoal;
	this.fireTimeout = 0;
	this.dead = false;
}
bossEvent.prototype.update = function()
{
	if (!this.dead)
	{
		var zdif = (this.pos.z-human.pos.z);
		var xdif = (this.pos.x-human.pos.x);
		var dist = Math.sqrt(zdif*zdif+xdif*xdif);
		//this.thetaGoal = Math.acos(xdif/dist)*60-90;
		this.thetaGoal = Math.acos(xdif/dist)*180/Math.PI-90;
		if (this.rot.y > this.thetaGoal+1)
			this.rot.y-=this.maxTurn;
		else if (this.rot.y < this.thetaGoal-1)
			this.rot.y+=this.maxTurn;
		else if (this.rot.y > this.thetaGoal)
			this.rot.y -= 0.05;
		else if (this.rot.y < this.thetaGoal)
			this.rot.y += 0.05;
			
		if (this.fireTimeout > 0)
			this.fireTimeout--;
		if (human.state == 1)
			this.fire();
		
		if (this.hit_timer > 0.0)
		{
			this.hit_timer--;
			if (this.hit_timer <= 0.0)
				this.flash = false;
		}
	}
}
bossEvent.prototype.fire = function()
{
	if (this.rot.y < this.thetaGoal+0.5 && this.rot.y > this.thetaGoal-0.5)
	{
		if(this.fireTimeout == 0)
		{
			this.fireTimeout = this.fireRate;
			lasers.push(new laser(1,lasers.length,2,0,0));
			lasers.push(new laser(-1,lasers.length,2,0,0));
		}
	}
}
bossEvent.prototype.takeDamage = function(type)
{
	this.hp--;
	console.log("max:"+this.maxHP+" hp:"+this.hp);
	if (this.hp <= 0)
		this.die();
	this.hit_timer = 30.0;
	this.flash = true;
}
bossEvent.prototype.die = function()
{
	var id = explosions.length;
	explosions.push(new explosion(id));
	explosions[id].initialScale = 4;	
	explosions[id].pos = this.pos;
	human.points += 1000;
	drawScore();
	this.dead = true;
	T = setTimeout("endLevel()", 2000);
}
function endLevel()
{
	lev.finished = true;
}
bossEvent.prototype.doEvent = function()
{
	this.triggered = true;
	boss = this;
}