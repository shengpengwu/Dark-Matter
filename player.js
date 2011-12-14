function player ()
{
	this.yaw = 0;
	this.pitch = 0;
	this.roll = 0;
	this.pos = new v3(0,0,0);
	this.zScreenPos = 200;
	this.lives = 5;
	this.fireTimeout = 0;
	this.numBombs = 3;
	
	this.rollAngles = new Array();
	
	this.fwd;
	this.bck;
	this.right;
	this.left;
	
	//added by nate wed night
	this.flash = false;
	this.hit_timer = 0.0;
	this.hp = 5;
	this.maxHP = 5;
	this.phase = 1;
	this.phase_cooldown = 0;
	this.numLives = 3;
	this.state = 1;
	this.stateTimer = 0;
	this.points = 0;
	this.radius = 30;
}

player.prototype.restart = function()
{
	this.pos = new v3(0,0,0);
	this.yaw = 0;
	this.pitch = 0;
	this.roll = 0;
	this.hp = this.maxHP;
	this.phase = 1;
	this.state = 1;
	this.screenPos = new v3(0,-30,-150);
	this.zScreenPos = 200;
}
player.prototype.fireMain = function()
{
	if(this.fireTimeout == 0)
	{
		this.fireTimeout = 10;
		lasers.push(new laser(1,lasers.length,1,0,0));
		lasers.push(new laser(-1,lasers.length,1,0,0));
	}
}

player.prototype.bindMesh = function()
{	
	var i;
	for (i=0;i<models[0].meshes.length;i++)
	{
		models[0].meshes[i].bindMesh();
	}
}

player.prototype.useBomb = function()
{
	if (this.numBombs > 0)
	{
		var id = explosions.length;
		explosions.push(new explosion(id));
		explosions[id].initialScale = 4;	
		explosions[id].pos = this.pos;
		
		var i;
		for (i=asteroids.length-1;i>-1;i--)
		{
			if (asteroids[i].phase == human.phase)
			{
				asteroids[i].bombed();
			}
		}
		
		for (i=enemies.length-1;i>-1;i--)
		{
			if (enemies[i].phase == human.phase && !enemies[i].behavior.damageProof)
			{
				enemies[i].die();
			}
		}
		
		this.numBombs--;
		drawGUI();
	}
}

//new function added
player.prototype.takeDamage = function(amt)
{
	if (this.state == 1)
	{
		if (this.hit_timer <= 0.0)
		{
			this.hp -= amt;
			this.hit_timer = 60.0;
			this.flash = true;
			if (this.hp <= 0)
			{
				this.numLives--;
				this.state = 0;
				this.stateTimer = 120;
				this.hp = this.maxHP;
				

				var id = explosions.length;
				explosions.push(new explosion(id));
				explosions[id].initialScale = 2;	
				explosions[id].pos = this.pos;
				//do explosion
			}
			drawGUI();
		}
	}
}

player.prototype.update = function()
{
	if (this.state == 1)
	{
		if (this.numLives < 0)
		{
			gameOver();
		}
		if(this.fireTimeout > 0)
		{
			this.fireTimeout--;
		}
		if(this.fire)
		{
			this.fireMain();
		}
		//new
		if (this.hit_timer > 0.0)
		{
			this.hit_timer--;
			if (this.hit_timer <= 0.0)
				this.flash = false;
		}
		if (this.phase_cooldown > 0.0)
		{
			this.phase_cooldown--;
		}
		//old
		if(this.left && !this.right)
		{
			if (this.roll < 10)
				this.roll += 1.5;
			this.pos.x -= 3;
			this.pos.x = Math.max(this.pos.x,-250);
		}
		else if (this.right && !this.left)
		{
			if (this.roll > -10)
				this.roll -= 1.5;
			this.pos.x += 3;
			this.pos.x = Math.min(this.pos.x,250);
		}
		else
		{
			if (this.roll > 0)
				this.roll -= 0.5;
			else if (this.roll < 0)
				this.roll += 0.5;
		}
		if(this.fwd)
		{
			this.zScreenPos -= 3;
			this.zScreenPos = Math.max(this.zScreenPos,-260);
		}
		if(this.bck)
		{
			this.zScreenPos += 3;
			this.zScreenPos = Math.min(this.zScreenPos,260);
		}
		this.pos.z = cam.pos.z + this.zScreenPos;
				
		if (!aimType)
		{
		//deal with changing angle
			var hx = ((canvas.width/2)/250)*this.pos.x+canvas.width/2;
			var hz = ((canvas.height/2)/260)*this.zScreenPos+canvas.height/2;
			
			var dx = mousex-hx;
			var dz = mousez-hz;
			
			this.yaw = Math.atan(dx/-Math.abs(dz))*180/Math.PI;
			this.yaw = Math.max(-30,Math.min(30,this.yaw));
		}
	}
	else if (this.state == 0)
	{
		this.stateTimer--;
		if (this.stateTimer <= 0)
			this.state = 1;
	}
}