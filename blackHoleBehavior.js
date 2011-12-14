function blackHoleBehavior()
{
	this.thetaGoal;
	this.maxTurn = 3;
	this.fire = false;
	this.rotational = true;
	this.damageProof = true;
	this.eff_r = 250;
}
blackHoleBehavior.prototype.update = function(vel,pos)
{
	if (human.phase == 0)
	{
		var dirx = pos.x-human.pos.x;
		var dirz = pos.z-human.pos.z;
		var dist = Math.sqrt(dirx*dirx+dirz*dirz);
		if (dirx > 0 && dist < this.eff_r)
			human.pos.x += 2*(dist/this.eff_r);
		else if (dirx < 0 && dist < this.eff_r)
			human.pos.x -= 2*(dist/this.eff_r);
		
		if (dirz > 0 && dist < this.eff_r)
			human.pos.z += 2*(dist/this.eff_r);
		else if (dirz < 0 && dist < this.eff_r)
			human.pos.z -= 2*(dist/this.eff_r);
	}
		
	return new v3(0,0,0);
}
blackHoleBehavior.prototype.updateRot = function(rotVel,rot,pos) 
{
	var ret = 0;
	ret += this.maxTurn;
	ret = ret % 360;
	return ret;
}
blackHoleBehavior.prototype.fire = function()
{		
}