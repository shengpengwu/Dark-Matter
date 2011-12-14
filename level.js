function level()
{
	this.events = new Array();
	this.length = 1000;
	this.id;
	this.loaded = false;
	this.boss;
	this.finished = false;
}

level.prototype.doEvents = function()
{
	var i;
	for (i=0;i<this.events.length;i++)
	{
		if (this.events[i].zpos <= -cam.pos.z && !(this.events[i].triggered))
		{
			this.events[i].doEvent();
			this.events[i].triggered = true;
		}
	}

	if (this.boss.zpos <= -cam.pos.z && !(this.boss.triggered))
	{
		this.boss.doEvent();
	}
}

function event()
{
	this.type;
	this.zpos;
	this.pos;
	this.amount;
	this.behavior;
	this.phase;
	this.model;
	this.radius;
	this.shape;
	this.dist;
	this.angle;
	this.triggered = false;
}
event.prototype.doEvent = function()
{
	//code to do event here
	//now doing event
	var i;
	switch (this.type)
	{
		case "asteroid":
			for (i=0;i<this.amount;i++)
			{
				this.addAsteroid();
			}
			break;
		case "enemy_swarm":
			for (i=0;i<this.amount;i++)
			{
				var id = enemies.length;
				enemies.push(new enemy(id));
				enemies[id].pos = new v3(this.pos.x,150,this.pos.z);
				enemies[id].phase = this.phase;
				enemies[id].model = this.model;
				enemies[id].radius = this.radius;
				switch (this.behavior)
				{
					case "simple_track":
						enemies[id].behavior = new followBehavior(1,10);
						break;
				}
				enemies[id].init();
				//enemyCt++;
			}
			break;
		case "enemy_formation":
			for (i=0;i<this.amount;i++)
			{
				var id = enemies.length;
				enemies.push(new enemy(id));
				if (this.shape == "line")
					enemies[id].pos = new v3(this.pos.x+i*this.dist*Math.sin(this.angle),150,this.pos.z-i*this.dist*Math.cos(this.angle));
				enemies[id].phase = this.phase;
				enemies[id].model = this.model;
				enemies[id].radius = this.radius;
				switch (this.behavior)
				{
					case "simple_track":
						enemies[id].behavior = new followBehavior(1,10);
						break;
				}
				enemies[id].initSimple();
			}
			break;
		case "turret":
			var id = enemies.length;
			enemies.push(new enemy(id));
			enemies[id].pos = this.pos;
			enemies[id].phase = this.phase;
			enemies[id].model = this.model;
			enemies[id].radius = this.radius;
			enemies[id].behavior = new turretBehavior();
			enemies[id].initSimple();
			break;
		case "black_hole":
			var id = enemies.length;
			enemies.push(new enemy(id));
			enemies[id].pos = this.pos;
			enemies[id].phase = this.phase;
			enemies[id].model = this.model;
			enemies[id].radius = this.radius;
			enemies[id].behavior = new blackHoleBehavior();
			enemies[id].initSimple();
			break;
	}
}

event.prototype.addAsteroid = function()
{
	var id = asteroids.length;
	asteroids.push(new asteroid(id));
	asteroids[id].radius = this.radius;				
	asteroids[id].pos = new v3(this.pos.x,150,this.pos.z);
	asteroids[id].phase = this.phase;
	asteroids[id].init();
}

function load_level(data)
{
	var levr = new level();
	var eventNum = 0;
	var lines = data.split('\n');
	for (i in lines)
	{
		var tokens = lines[i].split(' ');
		switch (tokens[0])
		{
			case "//":
				//comment line, do nothing
				break;
			case "<level>":
				//initialize level
				break;
			case "</level>":
				//close level
				break;
			case "<id>":
				levr.id = tokens[1];
				break;
			case "<length>":
				levr.length = tokens[1];
				break;
			case "<event>":
				//start event
				levr.events.push(new event());
				break;
			case "<zpos>":
				levr.events[eventNum].zpos = tokens[1];
				break;
			case "<type>":
				levr.events[eventNum].type = tokens[1];
				break;
			case "<shape>":
				levr.events[eventNum].shape = tokens[1];
				break;
			case "<dist>":
				levr.events[eventNum].dist = parseFloat(tokens[1]);
				break;
			case "<angle>":
				levr.events[eventNum].angle = parseFloat(tokens[1]);
				break;
			case "<amount>":
				levr.events[eventNum].amount = parseInt(tokens[1]);
				break;
			case "<phase>":
				levr.events[eventNum].phase = parseInt(tokens[1]);
				break;
			case "<model>":
				levr.events[eventNum].model = parseInt(tokens[1]);
				break;
			case "<radius>":
				levr.events[eventNum].radius = parseInt(tokens[1]);
				break;
			case "<pos>":
				levr.events[eventNum].pos = new v3(parseFloat(tokens[1]),parseFloat(tokens[2]),-parseFloat(tokens[3]));
				break;
			case "<behavior>":
				levr.events[eventNum].behavior = tokens[1];
				break;
			case "</event>":
				eventNum++;
				break;
			case "<boss>":
				levr.boss = new bossEvent();
				break;
			case "</boss>":
				break;
			case "<bzpos>":
				levr.boss.zpos = tokens[1];
				break;
			case "<bradius>":
				levr.boss.radius = parseInt(tokens[1]);
				break;
			case "<bpos>":
				levr.boss.pos = new v3(parseFloat(tokens[1]),parseFloat(tokens[2]),-parseFloat(tokens[3]));
				break;
			case "<bmodel>":
				levr.boss.model = parseInt(tokens[1]);
				break;		
			case "<brate>":
				levr.boss.fireRate = parseInt(tokens[1]);
				break;		
			case "<bhp>":
				levr.boss.maxHP = parseInt(tokens[1]);
				levr.boss.hp = levr.boss.maxHP;
				break;				
		}
	}
	levr.loaded = true;
	return levr;
}