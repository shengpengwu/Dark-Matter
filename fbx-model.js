function fbx_model()
{
	this.textures = new Array();
	this.materials = new Array();
	this.meshes = new Array();
	this.name = "";
}
fbx_model.prototype.initMaterials = function()
{
	var i;
	for (i=0;i<this.textures.length;i++)
	{
		this.textures[i].initTexture();
	}
	var check = 0;
}

//data structure to contain individual mesh
function fbx_mesh()
{
	this.id;
	this.model_id;
	this.vertices = new Array();
	this.polygons = new Array();
	this.uvs = new Array();
	this.color = new v4(1.0,1.0,1.0,1.0);
	this.locTrans = new v3(0,0,0);
	this.locRot = new v3(0,0,0);
	this.locScale = new v3(1,1,1);
	this.vertexPosBuffer;
	this.vertexColBuffer;
	this.vertexNormBuffer;
	this.vertexUVBuffer;
	this.material;
}

fbx_mesh.prototype.addVertex = function(v)
{
	this.vertices.push(v);
}
fbx_mesh.prototype.addTriangle = function(t)
{
	this.triangles.push(t);
}
fbx_mesh.prototype.addPolygon = function(t)
{
	this.polygons.push(t);
}
fbx_mesh.prototype.addUV = function(uv)
{
	this.uvs.push(uv);
}
fbx_mesh.prototype.addNormal = function(pid,vid,n)
{
	this.polygons[pid].normals[vid] = n;
}
fbx_mesh.prototype.addUVIndex = function(pid,uvid,n)
{
	this.polygons[pid].uvs[uvid] = n;
}
fbx_mesh.prototype.bindMesh = function()
{
	var i;	
	var verts = [];
	var colors = [];
	var norms = [];
	var uv = [];
	
	this.vertexPosBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPosBuffer);
	for (i=0;i<this.polygons.length;i++)
	{
		verts = verts.concat([this.vertices[this.polygons[i].poly[0]].x,this.vertices[this.polygons[i].poly[0]].y,this.vertices[this.polygons[i].poly[0]].z]);
		verts = verts.concat([this.vertices[this.polygons[i].poly[1]].x,this.vertices[this.polygons[i].poly[1]].y,this.vertices[this.polygons[i].poly[1]].z]);
		verts = verts.concat([this.vertices[this.polygons[i].poly[2]].x,this.vertices[this.polygons[i].poly[2]].y,this.vertices[this.polygons[i].poly[2]].z]);
	}
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
	this.vertexPosBuffer.itemSize = 3;
    this.vertexPosBuffer.numItems = this.polygons.length*3;
		
	//for now generate random color buffer
	this.vertexColBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColBuffer);
	for (i=0;i<this.polygons.length;i++)
	{
		var k = 0;
		for (k=0;k<3;k++)
		{
			var r = Math.random();
			var div = Math.random();
			colors = colors.concat([r,r+div,r-div,1.0]);
		}
	}
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	this.vertexColBuffer.itemSize = 4;
    this.vertexColBuffer.numItems = this.polygons.length*3;
	
	//now bind the normals
	this.vertexNormBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormBuffer);
	for (i=0;i<this.polygons.length;i++)
	{
		norms = norms.concat([this.polygons[i].normals[0].x,this.polygons[i].normals[0].y,this.polygons[i].normals[0].z]);
		norms = norms.concat([this.polygons[i].normals[1].x,this.polygons[i].normals[1].y,this.polygons[i].normals[1].z]);
		norms = norms.concat([this.polygons[i].normals[2].x,this.polygons[i].normals[2].y,this.polygons[i].normals[2].z]);
	}
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(norms), gl.STATIC_DRAW);
	this.vertexNormBuffer.itemSize = 3;
    this.vertexNormBuffer.numItems = this.polygons.length*3;
	
	//now bind the uvs
	this.vertexUVBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexUVBuffer);
	for (i=0;i<this.polygons.length;i++)
	{
		uv = uv.concat([this.uvs[this.polygons[i].uvs[0]].x,this.uvs[this.polygons[i].uvs[0]].y]);
		uv = uv.concat([this.uvs[this.polygons[i].uvs[1]].x,this.uvs[this.polygons[i].uvs[1]].y]);
		uv = uv.concat([this.uvs[this.polygons[i].uvs[2]].x,this.uvs[this.polygons[i].uvs[2]].y]);
	}
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW);
	this.vertexUVBuffer.itemSize = 2;
    this.vertexUVBuffer.numItems = this.polygons.length*3;
}




//container for triangle strip
function polygon()
{
	this.poly = new Array();
	this.normals = new Array();
	this.uvs = new Array();
	this.end = 0;
}
polygon.prototype.addVertex = function(i)
{
	this.poly.push(i);
	this.end++;
}

function fbx_property(i,p,v)
{
	this.id = i;
	this.prop = p;
	this.val = v;
}

//data associated with gathering meshes
var currMeshTotal = 0;
var models;
function getMeshes(data)
{
	//parses the meshids.html file and then loads all meshes specified
	var lines = data.split('\n');
	for (i in lines)
	{
		var ln = lines[i].split(' ');
		meshNum = parseInt(ln[0]);
		$.get("meshes/"+ln[2], function(d2){
			var tmpModel = fbx_parsemesh(d2);
			switch (tmpModel.name)
			{
				case "player_ship":
					models[0] = tmpModel;
					break;
				case "asteroid_1":
					models[1] = tmpModel;
					break;
				case "asteroid_2":
					models[2] = tmpModel;
					break;
				case "turret_1":
					models[4] = tmpModel;
					break;
				case "asteroid_3":
					models[3] = tmpModel;
					break;
				case "laser":
					models[6] = tmpModel;
					break;
				case "background":
					models[5] = tmpModel;
					break;
				case "bomb":
					models[7] = tmpModel;
					break;
				case "ufo":
					models[8] = tmpModel;
					break;
				case "explosion_2":
					models[9] = tmpModel;
					break;
				case "life":
					models[10] = tmpModel;
					break;
				case "boss_2":
					models[11] = tmpModel;
					break;
				case "laser_2":
					models[12] = tmpModel;
					break;
				case "black_hole":
					models[13] = tmpModel;
					break;
			}
			//meshNum = models.length;
		}, 'html');
	}
}
