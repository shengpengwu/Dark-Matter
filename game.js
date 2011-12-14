//set up canvas and webgl vars
var canvas;
var gl;

var shaderProgram;
var shaderProgram_main;
var shaderProgram_flash;
var shaderProgram_phase;
var mvMatrix = mat4.create();
var pMatrix = mat4.create();  
var mvMatrixStack = [];

var statics = new Array();
var path = "";

//play state variables
//var meshesLoaded = false;
var playState = 0;
var time = 0;
var human = new player();
var cam = new camera();
var asteroids = new Array();
var enemies = new Array();
var items = new Array();
var lasers = new Array();
var explosions = new Array();
var levelBackground = new background();
var asteroidCt = 0;
var enemyCt = 0;
var itemCt = 0;
var explosionCt = 0;
var levNum = 1;
var numOfLevels = 5;
var lev = new level();
var boss;
var drawInstructions = false;

var levelLength = 10000;

var aimType = false;

//load in model files
var models = new Array();
var meshNum = 0;
var modelsChecked = 0;
var totalModels = 14;
var doOnce = false;
var doneSetup = 0;

//phase shift vars
var phaseOutTime = 0;
var mousex = 0;
var mousez = 0;


function preInit()
{
	loadGUI();
	T = setTimeout("drawLevelMenu()", 1/100 * 1000);
	$.get("meshes/meshids.html", function(data){
		getMeshes(data);
	}, 'html');
	//pausecomp(500);
	T = setTimeout("initGame()", 1/60 * 1000);
}
function replay()
{
	playState = 0;
	time = 0;
	human = new player();
	cam = new camera();
	asteroids = new Array();
	enemies = new Array();
	items = new Array();
	lasers = new Array();
	explosions = new Array();
	levNum = 1;
	lev = new level();
	playState = 0;
	boss = null;
	loadGUI();
	setupLevel();
}
function startGame()
{
	if (lev.loaded == true && checkLoaded)
	{
		//pausecomp(500);
		drawInstructions = false;
		playState = 1;
		loadGUI();
		drawGUI();
	}
}

function initGame() //begin the game initialization
{
	//set up drawing
	canvas = document.getElementById("myCanvas");
	gl = canvas.getContext("experimental-webgl");
	gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;

	// now we can do standard OpenGL stuff
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

	T = setTimeout("gameLoop()", 1/60 * 1000);
}

function setupGame()
{
	//initialize all loaded meshes
	initObjects();
	doneSetup = 0.33;
	//initialize lights
	initLights();
	doneSetup = 0.66;
	// make the shaders
	initShaders();
	doneSetup = 1;
	
}
function nextLevel()
{
	playState = 1;
	loadGUI();
	drawGUI();
}
function setupLevel()
{
	$.get("levels/l"+levNum+".html", function(data){
	lev = load_level(data);
	levelLength = lev.length;
	}, 'html');
}
function checkLoaded()
{
	if (modelsChecked < totalModels)
		return false;
	else
		return true;
}
function gameLoop()
{
	switch (playState)
	{
		case 0: //loading screen and instructions
			if (checkLoaded() && !doOnce)
			{
				doOnce = true;
				setupGame();
				setupLevel();
			}
			var tmp = 100*modelsChecked/totalModels+100*doneSetup;
			document.getElementById('loadingBar').style.width = tmp+"px";
			break;
		case 1: //level select
			draw();
			update();
			break;
		case 2: //play selected level
			break;
		case 3: //level breakdown after,
			break;
		case 4: //game over
			break;
	}
	T = setTimeout("gameLoop()", 1/60 * 1000);
}


function update(){
	//run update code here
	time += 1;
	time & 314;
	drawScore();
	lev.doEvents();
	var i;
	for (i=0;i<enemies.length;i++)
	{
		if (enemies[i] != null)
			enemies[i].update();
	}
	for (i=0;i<asteroids.length;i++)
	{
		if (asteroids[i] != null)
			asteroids[i].update();
	}
	for (i=0;i<explosions.length;i++)
	{
		if (explosions[i] != null)
			explosions[i].update();
	}
	for (i=0;i<items.length;i++)
	{
		if (items[i] != null)
			items[i].update();
	}
	for(i=0;i<lasers.length;i++)
	{
		if (lasers[i] != null)
			lasers[i].update();
	}
	if (boss != null)
		boss.update();
	human.update();
	cam.update();
	detectCollisions();
	if (phaseOutTime > 0)
	{
		phaseOutTime--;
	}
	if (lev.finished)
	{
		if (levNum < numOfLevels)
		{
			playState = 2;
			boss = null;
			asteroids = new Array();
			enemies = new Array();
			items = new Array();
			explosions = new Array();
			lasers = new Array();
			cam = new camera();
			human.restart();
			levNum++;
			setupLevel();
		}
		else
			playState = 3;
		loadGUI();
	}
}


function initObjects()
{
	var i,j;
	for (i=0;i<models.length;i++)
	{
		if (models[i] != null)
		{
			models[i].initMaterials();
			for (j=0;j<models[i].meshes.length;j++)
			{
				models[i].meshes[j].bindMesh();
			}
		}
	}	

	human.screenPos = new v3(0,-30,-150);
	
}

function detectCollisions()
{
	var i,j;
	//check boss with player
	if (boss != null)
	{
		var distance = human.pos.subtract(boss.pos).magnitude();
		if(distance < boss.radius)
		{//collision
			//damage player
			human.takeDamage(4);
		}
	}
	
	//check boss with lasers
	for (j=0;j<lasers.length;j++)
	{
		if (boss != null)
		{
			if (lasers[j] != null && lasers[j].type == 1 && !boss.dead)
			{
				var distance = lasers[j].pos.subtract(boss.pos).magnitude();
				if(distance < boss.radius)
				{//collision
					//damage asteroid
					boss.takeDamage(1);
					lasers[j].die();
				}
			}
		}
	}
	
	//check player with lasers
	for (j=0;j<lasers.length;j++)
	{
		if (lasers[j] != null && lasers[j].type == 2 && lasers[j].phase == human.phase)
		{
			var distance = lasers[j].pos.subtract(human.pos).magnitude();
			if(distance < human.radius)
			{//collision
				//damage asteroid
				human.takeDamage(2);
				lasers[j].die();
			}
		}
	}
	
	
	//check player against asteroids
	for (i=0;i<asteroids.length;i++)
	{
		if (asteroids[i].phase == human.phase)
		{
			var distance = human.pos.subtract(asteroids[i].pos).magnitude();
			if(distance < asteroids[i].radius+7)
			{//collision
				//damage player
				human.takeDamage(asteroids[i].maxHP);
			}
		}
	}
	
	//check player against items
	for (i=0;i<items.length;i++)
	{
		if (items[i] != null)
		{
			var distance = human.pos.subtract(items[i].pos).magnitude();
			if(distance < items[i].radius)
			{//collision
				items[i].collect();
			}
		}
	}
	//check player against enemies
	for (i=0;i<enemies.length;i++)
	{
		if (enemies[i] != null && enemies[i].phase == human.phase)
		{
			var distance = human.pos.subtract(enemies[i].pos).magnitude();
			if(distance < enemies[i].radius+7)
			{//collision
				//damage player
				human.takeDamage(2);
			}
		}
	}
	
	//check lasers against asteroids
	for (i=0;i<asteroids.length;i++)
	{
		if (asteroids[i] != null)
		{
			for (j=0;j<lasers.length;j++)
			{
				if (asteroids[i] != null)
				{
					if (lasers[j] != null && asteroids[i].phase == lasers[j].phase && lasers[j].type == 1)
					{
						var distance = lasers[j].pos.subtract(asteroids[i].pos).magnitude();
						if(distance < asteroids[i].radius)
						{//collision
							//damage asteroid
							asteroids[i].takeDamage();
							lasers[j].die();
						}
					}
				}
			}
		}
	}
	//check lasers against enemies
	for (i=0;i<enemies.length;i++)
	{
		if (enemies[i] != null)
		{
			for (j=0;j<lasers.length;j++)
			{
				if (enemies[i] != null)
				{
					if (lasers[j] != null && enemies[i].phase == lasers[j].phase && lasers[j].type == 1)
					{
						var distance = lasers[j].pos.subtract(enemies[i].pos).magnitude();
						if(distance < enemies[i].radius)
						{//collision
							//damage enemy
							enemies[i].takeDamage(1);
							lasers[j].die();
						}
					}
				}
			}
		}
	}
}

function gameOver() {
	playState = 4;
	loadGUI();
}

function transformVector(v3) {
    var vecRet = new v3(0,0,0);
    vecRet.x = v3.x - human.worldPos.x + human.screenPos.x;
    vecRet.y = v3.y - human.worldPos.y + human.screenPos.y;
    vecRet.z = v3.z - human.worldPos.z + human.screenPos.z;
    return vecRet;
}

function pausecomp(ms) {
ms += new Date().getTime();
while (new Date() < ms){}
} 

//add event listeners
window.addEventListener('keydown',handleKeyDown,true);
window.addEventListener('keyup',handleKeyUp,true);
window.addEventListener('mousemove',handleMouseMove,true);
window.addEventListener('mousedown',handleMouseDown,true);
window.addEventListener('mouseup',handleMouseUp,true);