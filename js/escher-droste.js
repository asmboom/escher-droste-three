var gui, scene, camera, render, container, orbit, mesh, material, renderer, stats;

var composer;

var clock;

var texture_url = "https://dl.dropboxusercontent.com/u/1358781/lab/grey_one_1024x1024.jpg",
    texture_size = 1024;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var lights = [];

var controls;


var data = {
    p1: -2,
    p2: -2,

};

var luce_obj = {
    x: -0.095,
    y: -0.625,
    z: -0.38
}

var mesh_obj = {
    x: 3.0,
    y: 4.0,
    z: 3.7
}

var max_width = 1024;

var renderPass, copyPass;

var render_fx, film_fx, bloom_fx, copy_fx, vrtilt_fx, hrtilt_fx, vignette_fx, film_fx, escher_fx;

var time, delta;

/** */


/* */

function init() {

    if (!Detector.webgl) {
        Detector.addGetWebGLMessage();
    }

    var h = window.innerHeight,
        w = window.innerWidth < max_width ? window.innerWidth : max_width;

    gui = new dat.GUI();

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 250);
    camera.aspect = w / h;
    camera.position.set(20, 0, 150);
    camera.lookAt(scene.position);

    scene.add(camera);

    clock = new THREE.Clock();
    renderer = new THREE.WebGLRenderer({
        antialias: false,
        preserveDrawingBuffer: true
    });

    //var devicePixelRatio = window.devicePixelRatio || 1; // Evaluates to 2 if Retina
    //console.log(devicePixelRatio)

    //renderer.enableScissorTest ( true );
    //renderer.setScissor(0, 60, w, h);

    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.setSize(w, h);
    renderer.setViewport(0, 0, w, h);
    // renderer.setPixelRatio(window.devicePixelRatio);
    //

    console.log(window.devicePixelRatio)

    //renderer.setViewport(0, 0, w, h);
    renderer.setClearColor(0x000000);

    document.getElementById("canvas").appendChild(renderer.domElement);

    /* post */

    //render_fx = new THREE.RenderPass(scene, camera);


    // var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
    //effectCopy.renderToScreen = true;*/

    /*hrtilt_fx = new THREE.ShaderPass(THREE.HorizontalTiltShiftShader);
    hrtilt_fx.uniforms.r.value = .25;
    hrtilt_fx.uniforms.h.value = 1 / h;*/

    /*vrtilt_fx = new THREE.ShaderPass(THREE.VerticalTiltShiftShader);
    vrtilt_fx.uniforms.r.value = .25;
    vrtilt_fx.uniforms.v.value = 1 /w*/

    /*film_fx = new THREE.ShaderPass(THREE.FilmShader);
    film_fx.uniforms.nIntensity.value = 0.55;
    film_fx.uniforms.sIntensity.value = 0.25;
    film_fx.uniforms.sCount.value = 512;
    film_fx.uniforms.grayscale.value = 0;

    film_fx.renderToScreen = true;*/

    /*vignette_fx = new THREE.ShaderPass(THREE.VignetteShader);
    vignette_fx.uniforms.offset.value = 1.5;
    vignette_fx.uniforms.darkness.value = .98;*/


    //composer = new THREE.EffectComposer(renderer);
    //composer.addPass(render_fx);
    //composer.addPass(vrtilt_fx);
    //composer.addPass(hrtilt_fx);
    //composer.addPass(film_fx);
    //composer.addPass(vignette_fx);

    /*controls *

    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = .8;
    controls.panSpeed = 0.8;

    controls.noZoom = false;
    controls.noPan = false;
    //controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;
    //controls.addEventListener( 'change', render )
    */

    /* lights */

    lights[0] = new THREE.PointLight(0xffffff, 1, 100)
    lights[0].position.set(1, 1, 1);

    lights[1] = new THREE.PointLight(0xff0000, .15, 100)
    lights[1].position.set(1, 0, 1);

    lights[2] = new THREE.PointLight(0x00ffff, .15, 100)
    lights[2].position.set(15, 195, 200);

    lights[3] = new THREE.AmbientLight(0x222222); // 0.2

    for (var i=0; i <= lights.length-1;  i++ ){
        scene.add(lights[i]);    
    }
    
    /*stats */

    stats = new rStats({
        values: {
            frame: {
                caption: 'Total frame time (ms)',
                over: 16
            },
            raf: {
                caption: 'Time since last rAF (ms)'
            },
            fps: {
                caption: 'Framerate (FPS)',
                below: 40
            }
        }
    });

    /* ui */

    var folder = gui.addFolder('Escher-Droste Controls');
    folder.add(data, 'p1', -2, 2).step(1).onChange(update_ui);
    folder.add(data, 'p2', -2, 2).step(1).onChange(update_ui);
    folder.open();

   /*var luci_ui = gui.addFolder('light direction');
    luci_ui.add(luce_obj, "x", -1.0, 1.0, 0.025).name("x").onChange(update_ui);
    luci_ui.add(luce_obj, "y", -1.0, 1.0, 0.025).name("y").onChange(update_ui);
    luci_ui.add(luce_obj, "z", -1.0, 1.0, 0.025).name("z").onChange(update_ui);
    folder.open();*/

    var mesh_ui = gui.addFolder('mesh rotation');
    mesh_ui.add(mesh_obj, "x", 0, 2 * Math.PI, 0.025).name("x")
    mesh_ui.add(mesh_obj, "y", 0, 2 * Math.PI, 0.025).name("y")
    mesh_ui.add(mesh_obj, "z", 0, 2 * Math.PI, 0.025).name("z")
    folder.open();

    /* mesh */

    var loader_manager = new THREE.LoadingManager();

    var loader_texture = new THREE.TextureLoader(loader_manager);
    loader_texture.crossOrigin = "anonymous";

    loader_texture.load(
        texture_url,
        run,
        // Function called when download progresses
        function(xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        // Function called when download errors
        function(xhr) {
            console.log('An error happened');
        });
    /*document.addEventListener( 'mousedown', onDocumentMouseDown, false );
            document.addEventListener( 'touchstart', onDocumentTouchStart, false );
            document.addEventListener( 'touchmove', onDocumentTouchMove, false );*/
    window.addEventListener('resize', onWindowResize, false);
}

function run(texture) {

    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.format = THREE.RGBFormat;
    
    texture.repeat.set(0.998, 0.998);
    texture.offset.set(0.001, 0.001);
    texture.needsUpdate = true;

    texture.magFilter = THREE.NearestFilter;
    texture.anisotropy = renderer.getMaxAnisotropy();

    /*var material2 = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        map: texture
    });*/

    material = new THREE.ShaderMaterial({

        uniforms: THREE.UniformsUtils.merge([
            THREE.UniformsLib['lights'], {

                time: {
                    type: "f",
                    value: 0.0
                },
                size: {
                    type: "v2",
                    value: new THREE.Vector2(texture_size, texture_size)
                },
                p1: {
                    type: "f",
                    value: -2.0
                },
                p2: {
                    type: "f",
                    value: -2.0
                },
                texture: {
                    type: "t",
                    value: texture
                },
                
                uSpecularColor: { 
                    type: "c", 
                    value: new THREE.Color( 0x00FFFF ) 
                },
                uKd: {
                    type: "f",
                    value: 0.7
                },
                uKs: {
                    type: "f",
                    value: 0.3
                },
                shininess: {
                    type: "f",
                    value: 100.0
                }

            }
        ]),
        vertexShader: document.getElementById('droste-vs').textContent,
        fragmentShader: document.getElementById('droste-fs').textContent,
        lights: true,
        fog: true
    });

    material.needsUpdate = true;
    material.uniforms.texture.value = texture;

     // material.uniforms.lightPosition.value = lights[0].position;
   // material.uniforms.lightColor.value = lights[0].color;

    //mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(200, 200, 16, 16), material);
    mesh = new THREE.Mesh(new THREE.SphereBufferGeometry(50, 32, 32), material);

    scene.add(mesh);

    mesh.rotation.set(mesh_obj.x, mesh_obj.y, mesh_obj.z);    
    //lights[0].position.set(luce_obj.x, luce_obj.y, luce_obj.z);

    camera.position.set(0, 0, 120);

    render();

}

function update_ui() {
    material.uniforms.p2.value = data.p2;
    material.uniforms.p1.value = data.p1;

    mesh.rotation.set(mesh_obj.x, mesh_obj.y, mesh_obj.z);

    //lights[0].position.set(luce_obj.x, luce_obj.y, luce_obj.z);

}

/* render */

function render() {

    stats('frame').start();
    stats('rAF').tick();
    stats('FPS').frame();

    time = Date.now() * 0.001;
    delta = clock.getDelta();

    requestAnimationFrame(render);

    material.uniforms.time.value += delta * .25;

    lights[0].position.x = Math.sin( time ) * 200;
    lights[0].position.y = Math.cos( time ) * 200;
    lights[0].position.z = Math.sin( time ) * 50;

    lights[1].position.x = Math.cos( time ) *200;
    lights[1].position.z = Math.sin( time ) * 200;
    lights[1].position.y = Math.cos( time ) * 200;


    //controls.update(delta);
    //composer.render(delta);

    renderer.render( scene, camera );

    stats('frame').end();
    stats().update();

};


window.addEventListener('load', function() {
    init();
})

function onWindowResize() {

  var h = window.innerHeight,
        w = window.innerWidth < max_width ? window.innerWidth : max_width;

    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    renderer.setViewport(0, 0, w, h);

    //composer.render(delta);

    renderer.render( scene, camera );
}


/*function onDocumentMouseDown( event ) {
 
                event.preventDefault();
         
                document.addEventListener( 'mousemove', onDocumentMouseMove, false );
                document.addEventListener( 'mouseup', onDocumentMouseUp, false );
                document.addEventListener( 'mouseout', onDocumentMouseOut, false );
         
                mouseXOnMouseDown = event.clientX - windowHalfX;
                targetRotationOnMouseDownX = targetRotationX;
         
                mouseYOnMouseDown = event.clientY - windowHalfY;
                targetRotationOnMouseDownY = targetRotationY;
 
        }
         
        function onDocumentMouseMove( event ) {
         
                mouseX = event.clientX - windowHalfX;
                mouseY = event.clientY - windowHalfY;
         
                targetRotationY = targetRotationOnMouseDownY + (mouseY - mouseYOnMouseDown) * 0.02;
                targetRotationX = targetRotationOnMouseDownX + (mouseX - mouseXOnMouseDown) * 0.02;
         
        }
         
        function onDocumentMouseUp( event ) {
         
                document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
                document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
                document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
         
        }
         
        function onDocumentMouseOut( event ) {
         
                document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
                document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
                document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
         
        }
         
        function onDocumentTouchStart( event ) {
         
                if ( event.touches.length == 1 ) {
         
                        event.preventDefault();
         
                        mouseXOnMouseDown = event.touches[ 0 ].pageX - windowHalfX;
                        targetRotationOnMouseDownX = targetRotationX;
         
                        mouseYOnMouseDown = event.touches[ 0 ].pageY - windowHalfY;
                        targetRotationOnMouseDownY = targetRotationY;
         
                }
         
        }

        function onDocumentTouchMove( event ) {

            if ( event.touches.length == 1 ) {

                    event.preventDefault();

                    mouseX = event.touches[ 0 ].pageX - windowHalfX;
                    targetRotationX = targetRotationOnMouseDownX + ( mouseX - mouseXOnMouseDown ) * 0.05;

                    mouseY = event.touches[ 0 ].pageY - windowHalfY;
                    targetRotationY = targetRotationOnMouseDownY + (mouseY - mouseYOnMouseDown) * 0.05;

            }

        }*/
