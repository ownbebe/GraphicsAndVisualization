var canvas;
var gl;
var NumVertices = 36;
var points = [];
var colors = [];
var xA = 0;
var yA = 1;
var zA = 2;
var A = 0;
var theta = [0, 0, 0];
var thetaL;

window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if(!gl)
    {
        alert("This browser does not support webGL")
    }

    cube();

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    var CBuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, CBuff);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
    var vertexColor = gl.getAttribLocation(program, "vertexColor");
    gl.vertexAttribPointer(vertexColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexColor);
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    thetaL = gl.getUniformLocation(program, "theta");

    document.getElementById("xButton").onclick = function()
    {
        A = xA;
    }

    document.getElementById("yButton").onclick = function()
    {
        A = yA;
    }

    document.getElementById("zButton").onclick = function()
    {
        A = zA;
    }

    render(); 
}

function cube()
{
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);

    
}

function quad(a, b, c, d)
{
    var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5, -0.5, -0.5, 1.0 )];

    var vertexColors = [
        [ 0.2, 1.0, 0.5, 1.0 ],
        [ 1.0, 0.5, 1.0, 1.0 ], 
        [ 1.0, 1.0, 0.0, 0.5 ], 
        [ 0.4, 1.0, 1.0, 1.0 ],  
        [ 0.5, 0.0, 1.0, 1.0 ], 
        [ 1.0, 1.0, 1.0, 1.0 ],  
        [ 1.0, 0.6, 0.5, 1.0 ], 
        [ 1.0, 0.1, 0.2, 1.0 ]];

    var indicies = [a, b, c, a, c, d];
    for(var i = 0; i < indicies.length; i++)
    {
        points.push(vertices[indicies[i]]);
        colors.push(vertexColors[a]);
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    theta[A] += 2.0;
    gl.uniform3fv(thetaL, theta);

    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
    gl.depthFunc(gl.LESS);

    requestAnimFrame(render);
}