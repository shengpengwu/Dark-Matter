function background()
{
	this.pos_a = new v3(0,-400,-500);
	this.model = 5;
	this.pos_b = new v3(0,-400,-500+2304);
	this.flip = true;
	this.lastFlip = 0;
}
background.prototype.update = function()
{
}

background.prototype.draw = function(offset)
{
	var i,j;
	mat4.identity(mvMatrix);
	mat4.rotate(mvMatrix,degToRad(cam.pitch),[-1,0,0]);
	mat4.rotate(mvMatrix,degToRad(cam.yaw),[0,-1,0]);
	mat4.rotate(mvMatrix,degToRad(cam.roll),[0,0,-1]);
	mat4.translate(mvMatrix,[-cam.pos.x,-cam.pos.y,-cam.pos.z]);
	mat4.translate(mvMatrix,[this.pos_a.x+offset.x,this.pos_a.y+offset.y,this.pos_a.z+offset.z]);
	
	//lighting
	gl.uniform3f(shaderProgram.ambientColorUniform,0.2,0.2,0.2);
	var lightingDirection = [-0.25,-0.25,0.0];
	var adjustedLD = vec3.create();
	vec3.normalize(lightingDirection, adjustedLD);
	vec3.scale(adjustedLD, -1);
	gl.uniform3fv(shaderProgram.lightingDirectionUniform, adjustedLD);
	gl.uniform3f(shaderProgram.directionalColorUniform,1.1,1.1,1.1);

	//setMatrixUniforms();
	for (j=0;j<models[this.model].meshes.length;j++)
	{
		var mesh = models[this.model].meshes[j];
		var material = models[this.model].materials[mesh.material];
		var texture = models[this.model].textures[material.texture];
		mvPushMatrix();
		mat4.translate(mvMatrix,[mesh.locTrans.x,mesh.locTrans.y,mesh.locTrans.z]); //translate mesh local pos
		mat4.rotate(mvMatrix,degToRad(mesh.locRot.x-90),[1,0,0]);
		mat4.rotate(mvMatrix,degToRad(mesh.locRot.z),[0,1,0]);
		mat4.rotate(mvMatrix,degToRad(mesh.locRot.y),[0,0,1]);
		mat4.scale(mvMatrix,[mesh.locScale.x,mesh.locScale.y,mesh.locScale.z]);
	
		gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexPosBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,mesh.vertexPosBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexColBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,mesh.vertexColBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexNormBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute,mesh.vertexNormBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexUVBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexUVAttribute,mesh.vertexUVBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture.gl_text);
		gl.uniform1i(shaderProgram.samplerUniform, 0);
		
		gl.getError();
		
		setMatrixUniforms();
		gl.drawArrays(gl.TRIANGLES, 0, mesh.vertexPosBuffer.numItems);
		mvPopMatrix();
	}
}