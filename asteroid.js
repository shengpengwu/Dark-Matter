function asteroid(id){
	this.id = id;
	this.pos = new v3(0,0,0);
	this.rot = new v3(0,0,0);
	this.scale = new v3(1,1,1);
	this.rotVel = new v3(0,0,0);
	this.vel = new v3(Math.random()*2-1,0,Math.random()*1-.5);
	this.model = Math.round(Math.random()*2)+1;
	this.phase = 1;
	this.maxHP = 5;
	this.hp = 1;
	this.dropRate = .01;
	this.radius = 20;
	this.flash = false;
	this.hit_timer = 0.0;
	this.ready = false;
	
}

asteroid.prototype.init = function()
{
	this.pos = new v3(this.pos.x+Math.random()*200,this.pos.y,this.pos.z+Math.random()*100);
	//this.vel = new v3(Math.random()*2+this.vel.x,0,Math.random()*2+this.vel.z);
	this.rotVel = new v3(Math.random()*2,Math.random()*2,Math.random()*2);
}
asteroid.prototype.draw = function()
{
	//
}

asteroid.prototype.update = function() 
{	
	if (this.ready)
	{
		if (this.hit_timer > 0.0)
		{
			this.hit_timer--;
			if (this.hit_timer <= 0.0)
				this.flash = false;
		}
		this.pos = this.pos.add(this.vel);
		this.rot = this.rot.add(this.rotVel);
		if (this.pos.z > cam.pos.z+300)
		{
			this.offScreen();
		}
	}
	else
	{
		this.pos.y -= 5;
		if (this.pos.y <= 0)
		{
			this.ready = true;
			this.pos.y = 0;
		}
	}
}
asteroid.prototype.offScreen = function()
{
	asteroids.splice(asteroids.indexOf(this),1);
}
asteroid.prototype.takeDamage = function()
{
	this.hp--;
	if (this.hp <= 0)
	{
		var id = explosions.length;
		explosions.push(new explosion(id));
		explosions[id].initialScale = 1;	
		explosions[id].pos = this.pos;
		human.points += 10;
		drawScore();
		this.dropItem();
		if (this.maxHP > 1)
			this.decay();
		asteroids.splice(asteroids.indexOf(this),1);
	}
	this.hit_timer = 30.0;
	this.flash = true;
}
asteroid.prototype.bombed = function()
{
	explosions[explosionCt] = new explosion(explosionCt);
	explosions[explosionCt].initialScale = 1;	
	explosions[explosionCt].pos = this.pos;//new v3(this.pos.x,this.pos.y,this.pos.z);		
	explosionCt++;
	this.dropItem();
	asteroids.splice(asteroids.indexOf(this),1);
	human.points += 10;
	drawScore();
}
asteroid.prototype.decay = function()
{
	var i;
	var num = Math.round(2*Math.random())+1;
	for (i=0;i<num;i++)
	{
		var id = asteroids.length;
		asteroids.push(new asteroid(id));
		asteroids[id].radius = this.radius*0.8;				
		asteroids[id].pos = this.pos;
		asteroids[id].phase = this.phase;
		asteroids[id].scale = new v3(this.scale.x*0.8,this.scale.y*0.8,this.scale.z*0.8);
		asteroids[id].maxHP = this.maxHP/2;
		asteroids[id].hp = 1;
		asteroids[id].vel = new v3(Math.random()*2-1,0,Math.random()*2-1);
		asteroids[id].rotVel = this.rotVel;
		asteroidCt++;
	}
}
asteroid.prototype.dropItem = function()
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
function asteroidDie(id)
{
	asteroids[id] = null;
}