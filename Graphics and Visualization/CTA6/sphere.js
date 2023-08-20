"use strict";
var canvas;
var gl;
var numTimesToSubdivide = 4;
var index = 0;
var pointsArray = [];
var array = [];

var near = -5;
var far = 5;
var radius = 0.75;
var theta = 0;
var phi = 0;
var dr = 2.5 * Math.PI/180.0;

var left = -1.5;
var right = 1.5;
var ytop = 1.5;
var bottom = -1.5;

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);

var position = vec4(1.0, 1.0, 1.0, 1.0);
var ambient = vec4(0.4, 0.4, 0.4, 1.0);
var diffuse = vec4( 1.0, 1.0, 0.5, 1.0);
var specular = vec4( 0.5, 1.0, 1.0, 1.0);

var ambientMat = vec4( 1.0, 0.0, 1.0, 1.0 );
var diffueseMat = vec4( 1.0, 0.8, 1.0, 1.0 );
var specualrMat = vec4( 1.0, 1.0, 1.0, 1.0 );
var shinyMat = 33.0;

var ctm, ambinetCol, diffuseCol, specCol;

var modelViewMatrix, projectionMatrix, modelViewMatrixLoc, projectionMatrixLoc, normalMatrix, normalMatrixLoc;

var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

function triangle(a, b, c) {
     pointsArray.push(a);
     pointsArray.push(b);
     pointsArray.push(c);
     array.push(a[0],a[1], a[2], 0.0);
     array.push(b[0],b[1], b[2], 0.0);
     array.push(c[0],c[1], c[2], 0.0);
     index += 3;

}

function divideTriangle(a, b, c, count) {
    if ( count > 0 ) 
    {
        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);
        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);
        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else 
    {
        triangle( a, b, c );
    }
}

function tetrahedron(a, b, c, d, n) 
{
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var ambientProduct = mult(ambient, ambientMat);
    var diffuseProduct = mult(diffuse, diffueseMat);
    var specularProduct = mult(specular, specualrMat);

    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(array), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );

    document.getElementById("Button0").onclick = function(){radius *= 1.5;};
    document.getElementById("Button1").onclick = function(){radius *= 0.75;};
    document.getElementById("Button2").onclick = function(){theta += dr;};
    document.getElementById("Button3").onclick = function(){theta -= dr;};
    document.getElementById("Button4").onclick = function(){phi += dr;};
    document.getElementById("Button5").onclick = function(){phi -= dr;};

    document.getElementById("Button6").onclick = function()
    {
        numTimesToSubdivide++;
        index = 0;
        pointsArray = [];
        array = [];
        init();
    };

    document.getElementById("Button7").onclick = function()
    {
        if(numTimesToSubdivide) numTimesToSubdivide--;
        index = 0;
        pointsArray = [];
        array = [];
        init();
    };


    gl.uniform4fv( gl.getUniformLocation(program,
       "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
       "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
       "specularProduct"),flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
       "position"),flatten(position) );
    gl.uniform1f( gl.getUniformLocation(program,
       "shininess"),shinyMat );

    render();
}


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    normalMatrix = 
    [
        vec3(modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2]),
        vec3(modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2]),
        vec3(modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2])
    ];

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix) );

    for( var i=0; i<index; i+=3)
    {
        gl.drawArrays( gl.TRIANGLES, i, 3 );
    }
    window.requestAnimFrame(render);
}