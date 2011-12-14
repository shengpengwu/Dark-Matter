function fbx_parsemesh(data)
{
	var newModel = new fbx_model();
	var lines = data.split('\n');
	var newMeshes = new Array();
	var meshCount = 0;
	var newMaterials = new Array();
	var matCount = 0;
	var newTextures = new Array();
	var textCount = 0;
	var properties = new Array();
	var propCount = 0;
	var propID = "";
	var connections = new Array();
	var loc = 0;
	var ln = lines[loc];
	var findName = false;
	while (ln != "; Object properties" + '\r')
	{
		if (ln == "FBXHeaderExtension:  {" + '\r')
			findName = true;
		else if (findName)
		{
			var nextLn = ln.split(' ');
			if (nextLn[12] == "P:")
			{
				var nameTmp = nextLn[17].split('\\');
				var name = nameTmp[nameTmp.length-1].split('.');
				newModel.name = name[0];
				findName = false;
			}
		}
		
		loc++;
		ln = lines[loc];
	}
	var next = 0;
	var nextBlock = 0;
	var block;
	var tmp_str = "";
	while(ln != "; Object connections\r") //parse the object details
	{
		if (next == 0) //unknown next line, continue looping
		{
			//fill in here
			var chkLine = ln.split(' ');
			if (chkLine[4] == "Geometry:")
			{
				var p = chkLine[5].split(',');
				newMeshes.push(new fbx_mesh());
				newMeshes[meshCount].id = p[0];
			}
			else if (chkLine[8] == "Vertices:")
			{
				next = 1;
				nextBlock = 0;
			}
			else if (chkLine[13] == "\"Color\",")
			{
				var cols = chkLine[16].split(',');
				newMeshes[meshCount].color = new v4(parseFloat(cols[1]),parseFloat(cols[2]),parseFloat(cols[3]));
			}
			else if (chkLine[8] == "PolygonVertexIndex:")
			{
				next = 1;
				nextBlock = 1;
			}
			else if (chkLine[12] == "Normals:")
			{
				next = 1;
				nextBlock = 3;
			}
			else if (chkLine[12] == "UV:")
			{
				next = 1;
				nextBlock = 4;
			}
			else if (chkLine[12] == "UVIndex:")
			{
				next = 1;
				nextBlock = 5;
			}
			else if (chkLine[12] == "Smoothing:")
			{
				next = 1;
				nextBlock = 6;
			}
			else if (chkLine[12] == "Visibility:")
			{
				next = 1;
				nextBlock = 7;
			}
			else if (chkLine[4] == "Material:")
			{
				next = 1;
				nextBlock = 8;
				newMaterials.push(new fbx_material());
				newMaterials[matCount].id = chkLine[5].split(',')[0];
				block = "Material";
			}
			else if (chkLine[4] == "Texture:")
			{
				newTextures.push(new fbx_texture());
				newTextures[textCount].id = chkLine[5].split(',')[0];
				next = 1;
				block = "Texture";
			}
			else if (chkLine[4] == "Model:")
			{
				next = 1;
				nextBlock = 8;
				propID = chkLine[5].split(',')[0];
				block = "Properties";
			}
		}
		else
		{
			var lnTmp = ln.split(' ');
			ln = lnTmp[lnTmp.length-1];
			switch (nextBlock) //the next block is known, parse as needed
			{
				case 0: //vertices
					if (lnTmp[0] == "}")
					{
						next = 0;
						nextBlock++;
						var pts = tmp_str.split(',');
						tmp_str = ""; //clear the temp string
						var i;
						for (i=0;i<pts.length;i+=3)
						{
							newMeshes[meshCount].addVertex(new v3(parseFloat(pts[i]),parseFloat(pts[i+1]),parseFloat(pts[i+2])));
						}
					}
					else
						tmp_str += ln;
					break;
				case 1: //points for each poly
					if (lnTmp[0] == "}")
					{
						next = 0;
						nextBlock++;
						var pts = tmp_str.split(',');
						tmp_str = ""; //clear the temp string
						var i;
						var poly = new polygon();
						for (i=0;i<pts.length;i++)
						{
							var ind = parseInt(pts[i]);
							if (ind != Math.abs(ind)) //end of triangle strip
							{
								poly.addVertex(Math.abs(ind)-1);
								newMeshes[meshCount].addPolygon(poly);
								poly = new polygon();
							}
							else //continue adding to 
							{
								poly.addVertex(ind);
							}
						}
					}
					else
						tmp_str += ln;
					break;
				case 2: //edges.. do what with these?
					break;
				case 3: //normals
					if (lnTmp[0] == "}")
					{
						var pid = 0; //keeps track of which polygon gets the normal
						var vid = 0; //keeps track of which polygon gets the normal
						next = 0;
						var pts = tmp_str.split(',');
						tmp_str = ""; //clear the temp string
						var i;
						for (i=0;i<pts.length;i+=3)
						{
							var n = new v3(parseFloat(pts[i]),parseFloat(pts[i+1]),parseFloat(pts[i+2]));
							if (vid >= newMeshes[meshCount].polygons[pid].end)
							{
								vid = 0;
								pid++;
							}
							newMeshes[meshCount].addNormal(pid,vid,n);
							vid++;
						}
					}
					else
						tmp_str += ln;
					break;
				case 4: //uv
					if (lnTmp[0] == "}")
					{
						next = 0;
						var pts = tmp_str.split(',');
						tmp_str = ""; //clear the temp string
						var i;
						for (i=0;i<pts.length;i+=2)
						{
							var uv = new v2(parseFloat(pts[i]),parseFloat(pts[i+1]));
							newMeshes[meshCount].addUV(uv);
						}
					}
					else
						tmp_str += ln;
					break;
				case 5: //uv indicies
					if (lnTmp[0] == "}")
					{
						var pid = 0; //keeps track of which polygon gets the uv
						var uvid = 0; //keeps track of which polygon gets the uv
						next = 0;
						var pts = tmp_str.split(',');
						tmp_str = ""; //clear the temp string
						var i;
						for (i=0;i<pts.length;i++)
						{
							if (uvid >= newMeshes[meshCount].polygons[pid].end)
							{
								uvid = 0;
								pid++;
							}
							newMeshes[meshCount].addUVIndex(pid,uvid,parseInt(pts[i]));
							uvid++;
						}
					}
					else
						tmp_str += ln;
					break;
				case 6: //smoothing
					if (lnTmp[0] == "}")
					{
						next = 0;
						meshCount++;
					}
					break;
				case 7: //visibility
					if (lnTmp[0] == "}")
					{
						next = 0;
						//meshCount++;						
					}
					break;
				case 8: //properties, materials, and textures
					if (lnTmp[0] == ";" && lnTmp[1] == "Object connections")
					{
						next = 0;
					}
					else
					{
						if (block == "Material" && lnTmp[4]=="}\r")
						{
							next = 0;
							block = "";
							matCount++;
						}
						else if (block == "Properties" && lnTmp[4]=="}\r")
						{
							next = 0;
							block = "";
							propID = "";
						}
						else if (block == "Texture" && lnTmp[4]=="}\r")
						{
							next = 0;
							block = "";
							textCount++;
						}
						else if (block == "Texture")
						{
							var p,x,y,z;
							switch(lnTmp[8])
							{
								case "FileName:":
									//"C:\Users\Nate\Desktop\cover_logo.png"\r
									p = lnTmp[9].split('\\');
									x = p[p.length-1].split('"');
									var filename = path + x[0];
									newTextures[textCount].fileloc = filename;
									newTextures[textCount].img = new Image();
									newTextures[textCount].img.src = filename;
									break;
								case "ModelUVTranslation:":
									break; //	"0,0\r"
								case "ModelUVScaling:":
									break; //	"1,1\r"
							}
						}
						else if (lnTmp[12] == "P:" && block == "Properties")
						{
							var p,x,y,z;
							if (lnTmp[13] == "\"Lcl" && lnTmp[14] == "Scaling\",")
							{
									p = lnTmp[18].split(',');
									x = parseFloat(p[1]);
									y = parseFloat(p[2]);
									z = parseFloat(p[3].split('\r')[0]);
									properties.push(new fbx_property(propID,"scale",new v3(x,y,z)));
									propCount++;
							}
							else if (lnTmp[13] == "\"Lcl" && lnTmp[14] == "Rotation\",")
							{
									p = lnTmp[18].split(',');
									x = parseFloat(p[1]);
									y = parseFloat(p[2]);
									z = parseFloat(p[3].split('\r')[0]);
									properties.push(new fbx_property(propID,"rot",new v3(x,y,z)));
									propCount++;
							}
							else if (lnTmp[13] == "\"Lcl" && lnTmp[14] == "Translation\",")
							{
									p = lnTmp[18].split(',');
									x = parseFloat(p[1]);
									y = parseFloat(p[2]);
									z = parseFloat(p[3].split('\r')[0]);
									properties.push(new fbx_property(propID,"trans",new v3(x,y,z)));
									propCount++;
							}
						}
						else if (lnTmp[12] == "P:" && block == "Material")
						{
							var p,x,y,z;
							switch (lnTmp[13])
							{
								case "\"EmissiveFactor\",":
									p = lnTmp[16].split(',');
									x = p[1].split('\r');
									newMaterials[matCount].emissiveFactor = parseFloat(x[0]);
									break;
								case "\"SpecularFactor\",":
									p = lnTmp[16].split(',');
									x = p[1].split('\r');
									newMaterials[matCount].specularFactor = parseFloat(x[0]);
									break;
								case "\"ShininessExponent\",":
									p = lnTmp[16].split(',');
									x = p[1].split('\r');
									newMaterials[matCount].shininess = parseFloat(x[0]);
									break;
								case "\"Opacity\",":
									p = lnTmp[16].split(',');
									x = p[1].split('\r');
									newMaterials[matCount].opacity = parseFloat(x[0]);
									break;
								case "\"AmbientColor\",":
									p = lnTmp[16].split(',');
									x = parseFloat(p[1]);
									y = parseFloat(p[2]);
									z = parseFloat(p[3].split('\r')[0]);
									newMaterials[matCount].ambientColor = new v3(x,y,z);
									break;
								case "\"DiffuseColor\",":
									p = lnTmp[16].split(',');
									x = parseFloat(p[1]);
									y = parseFloat(p[2]);
									z = parseFloat(p[3].split('\r')[0]);
									newMaterials[matCount].diffuseColor = new v3(x,y,z);
									break;
								case "\"SpecularColor\",":
									p = lnTmp[16].split(',');
									x = parseFloat(p[1]);
									y = parseFloat(p[2]);
									z = parseFloat(p[3].split('\r')[0]);
									newMaterials[matCount].specularColor = new v3(x,y,z);
									break;
								case "\"Emissive\",":
									p = lnTmp[16].split(',');
									x = parseFloat(p[1]);
									y = parseFloat(p[2]);
									z = parseFloat(p[3].split('\r')[0]);
									newMaterials[matCount].emissive = new v3(x,y,z);
									break;
								case "\"Ambient\",":
									p = lnTmp[16].split(',');
									x = parseFloat(p[1]);
									y = parseFloat(p[2]);
									z = parseFloat(p[3].split('\r')[0]);
									newMaterials[matCount].ambient = new v3(x,y,z);
									break;
								case "\"Diffuse\",":
									p = lnTmp[16].split(',');
									x = parseFloat(p[1]);
									y = parseFloat(p[2]);
									z = parseFloat(p[3].split('\r')[0]);
									newMaterials[matCount].diffuse = new v3(x,y,z);
									break;
								case "\"Specular\",":
									p = lnTmp[16].split(',');
									x = parseFloat(p[1]);
									y = parseFloat(p[2]);
									z = parseFloat(p[3].split('\r')[0]);
									newMaterials[matCount].specular = new v3(x,y,z);
									break;
							}
						}
						/*else if (lnTmp[] == "")
						{
						}*/
					}
					break;
			}
		}
		loc++;
		ln = lines[loc];
	}
	while (ln != ";Takes section\r")
	{
		var lnTmp = ln.split(' ');		
		if (lnTmp[4] == "C:")
		{
			var args = lnTmp[5].split(',');
			switch (args[0])
			{
				case "\"OO\"":
					connections.push(new c2(args[1],args[2].split('\r')[0]));
					break;
				case "\"OP\"":
					connections.push(new c3(args[1],args[2],lnTmp[6].split('\r')[0]));
					break;
			}
		}
		loc++;
		ln = lines[loc];
	}
	
	//now everything is loaded. parse into correct model structure
	//first find model ids
	var i,j,k;
	var modelIDs = new Array();
	for (i=0;i<connections.length;i++)
	{
		if (connections[i].b == "0")
			modelIDs.push(new c2(connections[i].a,""));
	}
	//now link textures to materials
	for (i=0;i<connections.length;i++)
	{
		if (connections[i].c != null)
		{ //this is a texture linker
			var tmp_texture;
			//find texture
			for (j=0;j<newTextures.length;j++)
			{
				if (newTextures[j].id == connections[i].a)
					tmp_texture = j;
			}
			//find material
			for (j=0;j<newMaterials.length;j++)
			{
				if (newMaterials[j].id == connections[i].b)
					newMaterials[j].texture = tmp_texture;
			}
		}
	}
	
	//then link model id to geometry id
	for (i=0;i<connections.length;i++)
	{
		for (j=0;j<modelIDs.length;j++)
		{
			if (connections[i].b == modelIDs[j].a)
			{
				//found this modelID somewhere, now find the geometry it links to
				for (k=0;k<newMeshes.length;k++)
				{
					if (connections[i].a == newMeshes[k].id)
					{
						modelIDs[j].b = "" + k;
						newMeshes[k].model_id = connections[i].b;
					}
				}
			}
		}
	}	
	//now that we know the mesh id that each model id links to, find materials that match up
	for (i=0;i<connections.length;i++)
	{
		for (j=0;j<modelIDs.length;j++)
		{
			if (connections[i].b == modelIDs[j].a)
			{
				//found this modelID somewhere, now find the material it links to
				for (k=0;k<newMaterials.length;k++)
				{
					if (connections[i].a == newMaterials[k].id)
					{
						newMeshes[modelIDs[j].b].material = k;
					}
				}
			}
		}
	}
	
	//now parse mesh properties
	for (i=0;i<properties.length;i++)
	{
		for (j=0;j<newMeshes.length;j++)
		{
			if (newMeshes[j].model_id == properties[i].id)
			{ //match!
				switch (properties[i].prop)
				{
					case "trans":
						newMeshes[j].locTrans = properties[i].val;
						break;
					case "rot":
						newMeshes[j].locRot = properties[i].val;
						break;
					case "scale":
						newMeshes[j].locScale = properties[i].val;
						break;
				}
			}
		}
	}
	
	//now return the finished model
	modelsChecked++;
	newModel.textures = newTextures;
	newModel.materials = newMaterials;
	newModel.meshes = newMeshes;
	return newModel;
}