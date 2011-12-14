function fbx_material()
{
	this.id;
	this.ambientColor;
	this.diffuseColor;
	this.specularColor;
	this.shininess;
	this.emissive;
	this.ambient;
	this.diffuse;
	this.specular;
	this.specularFactor;
	this.opacity;
	this.emissiveFactor;
	this.texture;
}

function fbx_texture()
{
	this.id;
	this.fileloc;
	this.uvScale;
	this.uvTranslate;
	this.gl_text;
	this.img;
}
fbx_texture.prototype.initTexture = function()
{
	this.gl_text = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, this.gl_text);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.img);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.bindTexture(gl.TEXTURE_2D, null);
}