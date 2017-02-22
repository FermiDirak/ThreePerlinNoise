var container, stats;
var camera, controls, scene, renderer;
var cube, plane;
// Create new object by parameters
var createSomething = function( klass, args ) {
    var F = function( klass, args ) {
        return klass.apply( this, args );
    };
    F.prototype = klass.prototype;
    return new F( klass, args );
};
// Cube
var materials = [];
for ( var i = 0; i < 6; i ++ ) {
    materials.push( [ new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff, wireframe: false } ) ] );
}

console.log("WTF");
var geometriesParams = [
    { type: 'BoxGeometry', args: [ 200, 200, 200, 2, 2, 2, materials ] },
    { type: 'TorusGeometry', args: [ 100, 60, 12, 12 ] },
    { type: 'TorusKnotGeometry', args: [  ] },
    { type: 'SphereGeometry', args: [ 100, 12, 12 ] },
    { type: 'SphereGeometry', args: [ 100, 5, 5 ] },
    { type: 'SphereGeometry', args: [ 100, 13, 13 ] },
    { type: 'IcosahedronGeometry', args: [ 100, 1 ] },
    { type: 'CylinderGeometry', args: [ 25, 75, 200, 8, 3 ]} ,
    { type: 'OctahedronGeometry', args: [200, 0] },
    { type: 'LatheGeometry', args: [ [
        new THREE.Vector2(0,-100),
        new THREE.Vector2(50,-50),
        new THREE.Vector2(10,0),
        new THREE.Vector2(50,050),
        new THREE.Vector2(0,100) ] ]},
    { type: 'LatheGeometry', args: [ [
        new THREE.Vector2(0,-100),
        new THREE.Vector2(50,-50),
        new THREE.Vector2(10,0),
        new THREE.Vector2(50,050),
        new THREE.Vector2(100,100) ], 12, 0, Math.PI ] },
    { type: 'LatheGeometry', args: [ [
        new THREE.Vector2(10,-100),
        new THREE.Vector2(50,-50),
        new THREE.Vector2(10,0),
        new THREE.Vector2(50,050),
        new THREE.Vector2(0,100) ], 12, Math.PI*2/3, Math.PI*3/2 ] },
    { type: 'TextGeometry', args: ['&', {
        size: 200,
        height: 50,
        curveSegments: 1
    }]},
    { type: 'PlaneGeometry', args: [ 200, 200, 4, 4 ] }
];
var loader = new THREE.FontLoader();
loader.load( 'fonts/helvetiker_regular.typeface.json', function ( font ) {
    geometriesParams[ 12 ].args[ 1 ].font = font;
} );
var info;
var geometryIndex = 0;
// start scene
init();
animate();
function nextGeometry() {
    geometryIndex ++;
    if ( geometryIndex > geometriesParams.length - 1 ) {
        geometryIndex = 0;
    }
    addStuff();
}
function switchGeometry(i) {
    geometryIndex = i;
    addStuff();
}
function updateInfo() {
    var params = geometriesParams[ geometryIndex ];
    var dropdown = '<select id="dropdown" onchange="switchGeometry(this.value)">';
    for (  i = 0; i < geometriesParams.length; i ++ ) {
        dropdown += '<option value="' + i + '"';
        dropdown += (geometryIndex == i)  ? ' selected' : '';
        dropdown += '>' + geometriesParams[i].type + '</option>';
    }
    dropdown += '</select>';
    var text =
        'Drag to spin THREE.' + params.type +
        '<br>' +
        '<br>Geometry: ' + dropdown + ' <a href="#" onclick="nextGeometry();return false;">next</a>';
    text +=
        '<br><br><font color="3333FF">Blue Arrows: Face Normals</font>' +
        '<br><font color="FF3333">Red Arrows: Vertex Normals before Geometry.mergeVertices</font>' +
        '<br>Black Arrows: Vertex Normals after Geometry.mergeVertices';
    info.innerHTML = text;
}
function addStuff() {
    if ( window.group !== undefined ) {
        scene.remove( group );
    }
    var params = geometriesParams[ geometryIndex ];
    geometry = createSomething( THREE[ params.type ], params.args );
    // scale geometry to a uniform size
    geometry.computeBoundingSphere();
    var scaleFactor = 160 / geometry.boundingSphere.radius;
    geometry.scale( scaleFactor, scaleFactor, scaleFactor );
    var originalGeometry = geometry.clone();
    originalGeometry.computeFaceNormals();
    originalGeometry.computeVertexNormals( true );
    // in case of duplicated vertices
    geometry.mergeVertices();
    geometry.computeFaceNormals();
    geometry.computeVertexNormals( true );
    updateInfo();
    var faceABCD = "abcd";
    var color, f, p, n, vertexIndex;
    for ( i = 0; i < geometry.faces.length; i ++ ) {
        f  = geometry.faces[ i ];
        n = ( f instanceof THREE.Face3 ) ? 3 : 4;
        for( var j = 0; j < n; j++ ) {
            vertexIndex = f[ faceABCD.charAt( j ) ];
            p = geometry.vertices[ vertexIndex ];
            color = new THREE.Color( 0xffffff );
            color.setHSL( ( p.y ) / 400 + 0.5, 1.0, 0.5 );
            f.vertexColors[ j ] = color;
        }
    }
    group = new THREE.Group();
    scene.add( group );
    var mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: 0xfefefe, wireframe: true, opacity: 0.5 } ) );
    group.add( mesh );
    var fvNames = [ 'a', 'b', 'c', 'd' ];
    var normalLength = 15;
    for( var f = 0, fl = geometry.faces.length; f < fl; f ++ ) {
        var face = geometry.faces[ f ];
        var centroid = new THREE.Vector3()
            .add( geometry.vertices[ face.a ] )
            .add( geometry.vertices[ face.b ] )
            .add( geometry.vertices[ face.c ] )
            .divideScalar( 3 );
        var arrow = new THREE.ArrowHelper(
            face.normal,
            centroid,
            normalLength,
            0x3333FF );
        mesh.add( arrow );
    }
    for( var f = 0, fl = originalGeometry.faces.length; f < fl; f ++ ) {
        var face = originalGeometry.faces[ f ];
        if( face.vertexNormals === undefined ) {
            continue;
        }
        for( var v = 0, vl = face.vertexNormals.length; v < vl; v ++ ) {
            var arrow = new THREE.ArrowHelper(
                face.vertexNormals[ v ],
                originalGeometry.vertices[ face[ fvNames[ v ] ] ],
                normalLength,
                0xFF3333 );
            mesh.add( arrow );
        }
    }
    for( var f = 0, fl = mesh.geometry.faces.length; f < fl; f ++ ) {
        var face = mesh.geometry.faces[ f ];
        if( face.vertexNormals === undefined ) {
            continue;
        }
        for( var v = 0, vl = face.vertexNormals.length; v < vl; v ++ ) {
            var arrow = new THREE.ArrowHelper(
                face.vertexNormals[ v ],
                mesh.geometry.vertices[ face[ fvNames[ v ] ] ],
                normalLength,
                0x000000 );
            mesh.add( arrow );
        }
    }
}
function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );
    info = document.createElement( 'div' );
    info.style.position = 'absolute';
    info.style.top = '10px';
    info.style.width = '100%';
    info.style.textAlign = 'center';
    info.innerHTML = 'Drag to spin the geometry ';
    container.appendChild( info );
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.z = 500;
    scene = new THREE.Scene();
    var light = new THREE.PointLight( 0xffffff, 1.5 );
    light.position.set( 1000, 1000, 2000 );
    scene.add( light );
    addStuff();
    renderer = new THREE.WebGLRenderer( { antialias: true } ); // WebGLRenderer CanvasRenderer
    renderer.setClearColor( 0xf0f0f0 );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );
    stats = new Stats();
    container.appendChild( stats.dom );
    //
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    window.addEventListener( 'resize', onWindowResize, false );
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}
//
function animate() {
    requestAnimationFrame( animate );
    controls.update();
    render();
    stats.update();
}
function render() {
    renderer.render( scene, camera );
}