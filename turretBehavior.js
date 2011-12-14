function turretBehavior()
{
	this.thetaGoal;
	this.maxTurn = 3;
	this.fire = true;
	this.rotational = true;
	this.damageProof = false;
}
turretBehavior.prototype.update = function(vel,pos)
{
	return new v3(0,0,0);
}
turretBehavior.prototype.updateRot = function(rotVel,rot,pos) 
{
	var zdif = (pos.z-human.pos.z);
	var xdif = (pos.x-human.pos.x);
	var dist = Math.sqrt(zdif*zdif+xdif*xdif);
	var ret = 0;
	this.thetaGoal = Math.acos(xdif/dist)*(90/(Math.PI/2))+90;
	if (zdif >=0)
		this.thetaGoal = (540-this.thetaGoal)%360;
	if (rot.y > this.thetaGoal+1)
		ret-=this.maxTurn;
	else if (rot.y < this.thetaGoal-1)
		ret+=this.maxTurn;
	return ret;
}
turretBehavior.prototype.fire = function()
{		
	if (this.fireTimeout > 0)
		this.fireTimeout--;
	if (human.state == 1)
		this.fire();
}