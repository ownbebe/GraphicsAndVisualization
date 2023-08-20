"use strict";
var canvas;
var gl;
var points = [];
var colors = [];
var subdivide = 3;

window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if ( !gl ) 
    { 
        alert("WebGL isn't available"); 
    }

    //initialize gasket points 
    var ver = 
    [
        vec3(0.0000,  0.0000, -1.0000),
        vec3(0.0000,  0.9428,  0.3333),
        vec3(-0.8165, -0.4714,  0.3333),
        vec3(0.8165, -0.4714,  0.3333)
    ];

    divTetra(ver[0], ver[1], ver[2], ver[3],
                 subdivide);

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //enable hidden-surface removal using zBuffer to check for depth of each point
    gl.enable(gl.DEPTH_TEST);
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    //create buffer associated with vertex shader for depth test
    var CBuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, CBuff);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
    var vertexColor = gl.getAttribLocation(program, "vertexColor");
    gl.vertexAttribPointer(vertexColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexColor);
    var VBuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, VBuff);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
    var VPost = gl.getAttribLocation(program, "VPost");
    gl.vertexAttribPointer(VPost, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(VPost);

    render();
};

function tri( sideA, sideB, sideC, color )
{
    var bColor = 
    [
        vec3(0.6, 0.4, 0.8),
        vec3(1.0, 1.0, 0.2),
        vec3(0.6, 0.8, 0.9),
        vec3(1.0, 1.0, 0.0)
    ];

    //add colors 
    colors.push(bColor[color]);
    points.push(sideA);
    colors.push(bColor[color]);
    points.push(sideB);
    colors.push(bColor[color]);
    points.push(sideC);
}

function tetra(sideA, sideB, sideC, sideD)
{
    //generate tetra
    tri(sideA, sideC, sideB, 0);
    tri(sideA, sideC, sideD, 1);
    tri(sideA, sideB, sideD, 2);
    tri(sideB, sideC, sideD, 3);
}

function divTetra(sideA, sideB, sideC, sideD, count)
{
    if (count === 0)
    {
        tetra(sideA, sideB, sideC, sideD);
    }
    //find midpoints and divide into four tetras half the size of original
    else 
    {
        var ab = mix(sideA, sideB, 0.5);
        var ac = mix(sideA, sideC, 0.5);
        var ad = mix(sideA, sideD, 0.5);
        var bc = mix(sideB, sideC, 0.5);
        var bd = mix(sideB, sideD, 0.5);
        var cd = mix(sideC, sideD, 0.5);

        --count;

        divTetra(sideA, ab, ac, ad, count);
        divTetra(ab,  sideB, bc, bd, count);
        divTetra(ac, bc,  sideC, cd, count);
        divTetra(ad, bd, cd,  sideD, count);
    }
}


function render()
{   
    //clear buffers during rendering
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    gl.drawArrays(gl.TRIANGLES, 0, points.length);
}