"use strict";

var canvas;
var gl;
var NumVertices  = 36;
var pointsArray = [];
var colorsArray = [];
var near = 0.05;
var far = 10.0;
var radius = 2.0;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;
var fovy = 45.0; 
var aspect = 1.0;      
var modelViewMatrix; 
var projectionMatrix;
var modelViewMatrixLoc; 
var projectionMatrixLoc;
var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);


var vertices = [
    vec4(-0.5, -0.5,  1.5, 1.0),
    vec4(-0.5,  0.5,  1.5, 1.0),
    vec4(0.5,  0.5,  1.5, 1.0),
    vec4(0.5, -0.5,  1.5, 1.0),
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5,  0.5, 0.5, 1.0),
    vec4(0.5,  0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0)
];

var vertexColors = [
    [0.2, 1.0, 0.5, 1.0],
    [1.0, 0.5, 1.0, 1.0], 
    [1.0, 1.0, 0.0, 0.5], 
    [0.4, 1.0, 1.0, 1.0],  
    [0.5, 0.0, 1.0, 1.0], 
    [1.0, 1.0, 1.0, 1.0],  
    [1.0, 0.6, 0.5, 1.0], 
    [1.0, 0.1, 0.2, 1.0]
];

function quad(a, b, c, d) 
{
     pointsArray.push(vertices[a]);
     colorsArray.push(vertexColors[a]);
     pointsArray.push(vertices[b]);
     colorsArray.push(vertexColors[a]);
     pointsArray.push(vertices[c]);
     colorsArray.push(vertexColors[a]);
     pointsArray.push(vertices[a]);
     colorsArray.push(vertexColors[a]);
     pointsArray.push(vertices[c]);
     colorsArray.push(vertexColors[a]);
     pointsArray.push(vertices[d]);
     colorsArray.push(vertexColors[a]);
}

function colorCube()
{
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}


window.onload = function init() 
{
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if ( !gl ) 
    { 
        alert("This browser does not support webGL"); 
    }

    gl.viewport(0, 0, canvas.width, canvas.height);

    aspect =  canvas.width/canvas.height;

    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    colorCube();

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    document.getElementById("DepthFarSlider").onchange = function(event) 
    {
        far = event.target.value;
    };

    document.getElementById("DepthNearSlider").onchange = function(event) 
    {
        near = event.target.value;
    };

    document.getElementById("radiusSlider").onchange = function(event) 
    {
       radius = event.target.value;
    };

    document.getElementById("thetaSlider").onchange = function(event) 
    {
        theta = event.target.value* Math.PI/180.0;
    };

    document.getElementById("phiSlider").onchange = function(event) 
    {
        phi = event.target.value* Math.PI/180.0;
    };

    document.getElementById("aspectSlider").onchange = function(event) 
    {
        aspect = event.target.value;
    };

    document.getElementById("fovSlider").onchange = function(event) 
    {
        fovy = event.target.value;
    };

    render();
}


function render()
{

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
               radius*Math.sin(theta)*Math.sin(phi), 
               radius*Math.cos(theta));
    
    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = perspective(fovy, aspect, near, far);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
    requestAnimFrame(render);
}