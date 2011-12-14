function laser(lr, id,type,pos,rot)
{
	if (type == 1)
	{
		this.id = id;
		var yaw = degToRad(human.yaw);
		var sy = Math.sin(yaw);
		var cy = Math.cos(yaw);
		var dx = lr * 37.84;
		var dz = -30.22;
		this.pos = new v3(human.pos.x + cy * dx + sy * dz, 0, human.pos.z + cy * dz - sy * dx);
		this.rot = new v3(0,human.yaw,0);
		this.scale = new v3(1,1,1);
		this.vel = new v3(-10 * sy, 0, -10 * cy);
		this.phase = human.phase;
		this.maxHP = 10;
		this.model = 6;
		this.model_b = 12;
		this.time = 180;
		this.type = type;
	}
	else if (type == 2)
	{
		this.id = id;
		var yaw = degToRad(boss.rot.y);
		var sy = Math.sin(yaw);
		var cy = Math.cos(yaw);
		var dx = 0;
		var dz = -62;
		this.pos = new v3(boss.pos.x + cy * dx + sy * dz, 0, boss.pos.z + cy * dz - sy * dx);
		this.rot = new v3(0,boss.rot.y,0);
		this.scale = new v3(1,1,1);
		this.vel = new v3(10 * sy, 0, 10 * cy);
		if (lr == 1)
			this.phase = human.phase;
		else
			this.phase = !human.phase;
		this.maxHP = 10;
		this.model = 12;
		this.time = 180;
		this.type = type;
	}
	else
	{
		this.id = id;
		var yaw = degToRad(rot.y);
		var sy = Math.sin(yaw);
		var cy = Math.cos(yaw);
		var dx = lr * 21.1;
		var dz = 41.9;
		this.pos = new v3(pos.x + cy * dx + sy * dz, 0,pos.z + cy * dz - sy * dx);
		this.rot = new v3(0,rot.y,0);
		this.scale = new v3(1,1,1);
		this.vel = new v3(-10 * sy, 0, -10 * cy);
		this.phase = 1;
		this.maxHP = 10;
		this.model = 12;
		this.time = 180;
		this.type = 2;
	}
}
laser.prototype.init = function()
{
}
laser.prototype.draw = function()
{
}
laser.prototype.update = function()
{
    this.pos = this.pos.add(this.vel);
	this.time--
	if (this.time <=0)
		this.die();
}
laser.prototype.die = function()
{
	lasers.splice(lasers.indexOf(this),1);
}