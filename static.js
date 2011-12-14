//container for static objects
function static(pos,rot,scale,id)
{
	this.pos = pos;
	this.rMag = 0;
	this.rot = rot;
	this.scale = scale;
	this.model = id;
}

static.prototype.bindMesh = function()
{
	var i;
	for (i=0;i<models[this.model].meshes.length;i++)
	{
		models[this.model].meshes[i].bindMesh();
	}
}