function enemy(id)
{
	this.id = id;
	this.pos = new v3(0,0,0);
	this.rot = new v3(0,0,0);
	this.scale = new v3(1,1,1);
	this.vel = new v3(0,0,0);
	this.rotVel = new v3(0,0,0);
	this.hp = 5;
	this.maxHP = 5;
	this.phase = 1;
	this.radius = 20;
	this.dropRate = 0.05;
	this.behavior;
	this.model;
	this.flash = false;
	this.hit_timer = 0.0;
	this.ready = false;
	this.fireTimeout = 0;
	this.fireRate = 30;
}
enemy.prototype.init = function()
{
	this.pos = new v3(this.pos.x+Math.random()*100,this.pos,this.pos.z+Math.random()*100);
	this.vel = new v3(Math.random()*4-2,0,Math.random()*2-1);
	this.rotVel = new v3(0,Math.random()*5,0);
}
enemy.prototype.initSimple = function()
{
	this.vel = new v3(Math.random()*4-2,0,Math.random()*2-1);
	this.rotVel = new v3(0,Math.random()*4,0);
}
enemy.prototype.draw = function()
{
}
enemy.prototype.update = function()
{
	if (this.ready)
	{
		if (this.hit_timer > 0.0)
		{
			this.hit_timer--;
			if (this.hit_timer <= 0.0)
				this.flash = false;
		}
		
		var b = this.behavior;
		this.vel = b.update(this.vel,this.pos);
		if (human.phase == this.phase && b.rotational)
			this.rot.y += b.updateRot(this.rotVel,this.rot,this.pos);
		else
			this.rot = this.rot.add(this.rotVel);
		
		this.pos = this.pos.add(this.vel); //translate distance based on velocity and passed time

		if (b.fire)
		{
			if (this.fireTimeout > 0)
				this.fireTimeout--;
			if (human.state == 1 && human.phase == this.phase)
				this.fire();
		}

		if (this.pos.z > cam.pos.z+300)
		{
			this.offScreen();
		}
		
	}
	else
	{
		this.pos.y -= 5;
		if (this.pos.y <= 0)
			this.ready = true;
	}
}
enemy.prototype.killed = function()
{
	this.die();
}
enemy.prototype.offScreen = function()
{
	enemies.splice(enemies.indexOf(this),1);
}
enemy.prototype.fire = function()
{	
	var zdif = (this.pos.z-human.pos.z);
	var xdif = (this.pos.x-human.pos.x);
	var dist = Math.sqrt(zdif*zdif+xdif*xdif);
	var ret = 0;
	var thetaGoal = Math.acos(xdif/dist)*(90/(Math.PI/2))+90;
	if (zdif >=0)
		thetaGoal = (540-this.thetaGoal)%360;
	if (this.rot.y < thetaGoal+1 && this.rot.y > thetaGoal-1)
	{
		if(this.fireTimeout == 0)
		{
			this.fireTimeout = this.fireRate;
			lasers.push(new laser(1,lasers.length,3,this.pos,this.rot));
			lasers.push(new laser(-1,lasers.length,3,this.pos,this.rot));
		}
	}
}
enemy.prototype.takeDamage = function(type)
{
	if (!this.behavior.damageProof)
	{
		if (type == 1)
		{
			this.hp--;
			if (this.hp <= 0)
			{
				this.dropItem();
				this.killed();
			}
			this.hit_timer = 30.0;
			this.flash = true;
		}
		else if (type == 2)
		{
			this.hp = 0;
			this.killed();
		}
	}
}
enemy.prototype.die = function()
{
	this.dropItem();
	var id = explosions.length;
	explosions.push(new explosion(id));
	explosions[id].initialScale = 1.5;	
	explosions[id].pos = this.pos;
	
	human.points += 10;
	drawScore();
	enemies.splice(enemies.indexOf(this),1);
}
enemy.prototype.dropItem = function()
{
	if (Math.random() < this.dropRate)
	{
		if (Math.random() > .2)
			items.push(new bomb(items.length));
		else
			items.push(new life(items.length));
		items[items.length-1].pos = this.pos;
	}
}
function enemyDie(id)
{
}