import * as THREE from 'three' ;
import { Renderer } from 'three/webgpu';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MathUtils } from 'three';




// LOADING UI


const loadingOverlay = document.createElement("div");
loadingOverlay.id = "loadingOverlay";

const loadingTitle = document.createElement("div");
loadingTitle.id = "loadingTitle";
loadingTitle.textContent = "SIMULATING";

const loadingStatus = document.createElement("div");
loadingStatus.id = "loadingStatus";
loadingStatus.textContent = "Preparing simulation....";

const loadingBarBackground = document.createElement("div");
loadingBarBackground.id = "loadingBarBackground";

const loadingBar = document.createElement("div");
loadingBar.id = "loadingBar";

const loadingPercentage = document.createElement("div");
loadingPercentage.id = "loadingPercentage";
loadingPercentage.textContent = "0%";

loadingBarBackground.appendChild(loadingBar);

loadingOverlay.appendChild(loadingTitle);
loadingOverlay.appendChild(loadingStatus);
loadingOverlay.appendChild(loadingBarBackground);
loadingOverlay.appendChild(loadingPercentage);

document.body.appendChild(loadingOverlay);

loadingOverlay.style.display = "none";




// RENDER-END PROGRESS VARIABLES


var renderJobId = 0;
var renderStep = 0;
var renderTotalSteps = 0;
var renderStartTime = 0;
var renderPhysicsSteps = 0;
var renderCylinderSteps = 0;



function animate(time){  
    if(!renderEnd){
        calculatingForces();
        calculatingPositions();
        calculatingVelocities();
    }
    renderer.render(scene, camera);
}



function renderEndOrNot(){

    renderer.setAnimationLoop(null);

    renderJobId++;

    if(renderEnd){

        renderStep = 0;
        renderPhysicsSteps = time_run * 60;
        renderCylinderSteps = particles.length;
        renderTotalSteps = renderPhysicsSteps + renderCylinderSteps;

        renderStartTime = performance.now();

        loadingOverlay.style.display = "flex";

        loadingBar.style.width = "0%";
        loadingPercentage.textContent = "0%";
        loadingStatus.textContent = "Preparing simulation...";

        const currentJob = renderJobId;

        processRenderEnd(currentJob);

    }else{

        loadingOverlay.style.display = "none";

        renderer.setAnimationLoop(animate);

    }
}



function processRenderEnd(currentJob){

    if(currentJob !== renderJobId){
        return;
    }

    const stepsPerChunk = 5;

    for(let i = 0; i < stepsPerChunk; i++){

        if(renderStep >= renderPhysicsSteps){
            break;
        }

        calculatingForces();
        calculatingPositions();
        calculatingVelocities();

        renderStep++;
    }


    if(renderStep < renderPhysicsSteps){

        updateRenderProgress();

        requestAnimationFrame(() => {
            processRenderEnd(currentJob);
        });

        return;
    }



    loadingStatus.textContent = "Calculating molecular connections...";

    const cylinderIndex = renderStep - renderPhysicsSteps;

    if(cylinderIndex < renderCylinderSteps){

        calculatingCylinders(cylinderIndex);

        renderStep++;

        updateRenderProgress();

        requestAnimationFrame(() => {
            processRenderEnd(currentJob);
        });

        return;
    }



    loadingBar.style.width = "100%";
    loadingPercentage.textContent = "100%";
    loadingStatus.textContent = "Simulation complete";

    renderer.render(scene, camera);

    setTimeout(() => {

        if(currentJob === renderJobId){
            loadingOverlay.style.display = "none";
            renderer.setAnimationLoop(animate);
        }

    }, 500);
}



function updateRenderProgress(){

    if(renderTotalSteps === 0){
        return;
    }

    const progress = Math.min(
        renderStep / renderTotalSteps,
        1
    );

    const percentage = Math.round(progress * 100);

    loadingBar.style.width = percentage + "%";
    loadingPercentage.textContent = percentage + "%";

    const elapsedTime =
        (performance.now() - renderStartTime) / 1000;

    let remainingText = "";

    if(progress > 0 && elapsedTime > 0){

        const estimatedTotalTime =
            elapsedTime / progress;

        const remainingTime =
            Math.max(0, estimatedTotalTime - elapsedTime);

        if(remainingTime < 60){

            remainingText =
                " • ~" + remainingTime.toFixed(1) + "s remaining";

        }else{

            const minutes =
                Math.floor(remainingTime / 60);

            const seconds =
                Math.round(remainingTime % 60);

            remainingText =
                " • ~" + minutes + "m " + seconds + "s remaining";
        }
    }

    if(renderStep < renderPhysicsSteps){

        loadingStatus.textContent =
            "Simulating particle movement" + remainingText;

    }else{

        loadingStatus.textContent =
            "Calculating molecular connections" + remainingText;

    }
}



function randomVelocitiesInitation(){
    velocities.length = 0;
    for(let i = 0; i<particles.length; i++){
        velocities[i] = new THREE.Vector3(MathUtils.randFloat(0,50), MathUtils.randFloat(0,50), MathUtils.randFloat(0,50));
    }
}



function ChangeDetector(){
    const slider = document.getElementById("particleSlider");
    var Changed_No = Number(slider.value);
    const renderEndCheckbox = document.getElementById("renderEndFrame");
    renderEnd = renderEndCheckbox.checked;
    console.log(Changed_No);
    removingParticles();
    CAtom.geometry = new THREE.SphereGeometry(Changed_No*0.01 + 2);
    noOfParticles = Changed_No;
    addingParticles(Changed_No);

}



function addingParticles(Changed_No){
    repulsion_force = 100000;
    radius = 1;
    for(let i = 0; i < Changed_No; i++){
        particles.push(new THREE.Mesh(new THREE.SphereGeometry(3+(Changed_No*0.002)), new THREE.MeshBasicMaterial({color: 0xFF0000})));
        const position_new = new THREE.Vector3(MathUtils.randFloat(-10, 10),MathUtils.randFloat(-10, 10),MathUtils.randFloat(-10, 10)).normalize().multiplyScalar((Changed_No*0.4)+20);
        position[particles.length - 1] = position_new;
        particles[particles.length-1].position.copy(position_new);
        scene.add(particles[particles.length-1]);
    }
    radius = (Changed_No*0.3*radius)+20;
    repulsion_force = Changed_No * repulsion_force + 1000000;
    camera.position.set(0,((Changed_No)+200)*2,0);
    camera.lookAt(0,0,0)
    randomVelocitiesInitation();
    CAtom.geometry = new THREE.SphereGeometry((Changed_No*0.005)+10);
    renderEndOrNot()
}



function removingParticles(){
    for(let i = 0; i < particles.length; i++){
        scene.remove(particles[i]);
        particles[i].geometry.dispose();
        particles[i].material.dispose();
    }

    for(let i = 0; i < cylinders.length; i++){
        if(!cylinders[i]) continue;

        for(let j = 0; j < cylinders[i].length; j++){
            if(!cylinders[i][j]) continue;

            scene.remove(cylinders[i][j]);
            cylinders[i][j].geometry.dispose();
            cylinders[i][j].material.dispose();
        }
    }

    particles.length = 0;
    position.length = 0;
    cylinders.length = 0;
}



function calculatingVelocities(){
    for(let i = 0; i< particles.length; i++){
        velocities[i].add(forces[i].clone().multiplyScalar(1/60));
        velocities[i].multiplyScalar(0.9);
    }
}



function calculatingPositions(){
    for(let i = 0; i< particles.length; i++){
        let previous_position = position[i].clone();
        let thingy_to_add = (velocities[i].clone().multiplyScalar(1/60)).add(forces[i].clone().multiplyScalar((1/60)*(1/60)*1/2));
        let temp_position = (position[i].clone().add(thingy_to_add));
        position[i].copy(temp_position.add(temp_position.clone().normalize().multiplyScalar((radius - temp_position.length())*0.1)));
        particles[i].position.copy(position[i]);
        if(previous_position.distanceTo(position[i]) < 0.1){
            if(renderEnd){
                continue;
            }
            calculatingCylinders(i);
        }
    }
}



function calculatingForces(){
    forces.length = 0;
    for(let i = 0; i<particles.length; i++){
        let force_end = new THREE.Vector3();
        for(let j = 0; j<particles.length; j++){
            if(i===j){
                continue;
            }
            let direction = new THREE.Vector3();
            direction.subVectors(position[i], position[j]);
            let dist =  direction.length();
            if(dist === 0){
                dist = 0.00001;
            }
            direction.normalize();
            let force = direction.multiplyScalar(((repulsion_force)/(dist*dist)));
            force_end.add(force);
        }
        forces[i] = force_end;
    }
}




function calculatingCylinders(index){
    let shortest = Infinity;

    for(let i = 0; i < particles.length; i++){
        if(i === index){
            continue;
        }

        let distance = position[i].distanceTo(position[index]);

        if(distance < shortest){
            shortest = distance;
        }
    }

    if(shortest === Infinity){
        return;
    }

    if(!cylinders[index]){
        cylinders[index] = [];
    }

    for(let i = 0; i < particles.length; i++){
        if(i === index){
            continue;
        }

        let distance = position[i].distanceTo(position[index]);

        if(distance <= shortest * (1 + cylinderTolerance)){

            if(!cylinders[index][i]){
                const cylinder_geometry =
                    new THREE.CylinderGeometry(0.5, 0.5, 1, 16);

                const cylinder_material =
                    new THREE.MeshBasicMaterial({
                        color: 0x0000FF
                    });

                cylinders[index][i] =
                    new THREE.Mesh(
                        cylinder_geometry,
                        cylinder_material
                    );

                scene.add(cylinders[index][i]);
            }

            cylinders[index][i].scale.y = distance;

            cylinders[index][i].position.copy(
                position[index]
                    .clone()
                    .add(position[i])
                    .multiplyScalar(0.5)
            );

            cylinders[index][i].lookAt(position[i]);
            cylinders[index][i].rotateX(Math.PI / 2);

        } else {

            if(cylinders[index][i]){

                scene.remove(cylinders[index][i]);

                cylinders[index][i].geometry.dispose();
                cylinders[index][i].material.dispose();

                cylinders[index][i] = null;
            }
        }
    }
}





const scene =  new THREE.Scene() ; 
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / (window.innerHeight), 0.1, 1000000000000000000) ;
camera.position.set(10,10,10);
camera.lookAt(0,0,0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, (window.innerHeight) );
document.body.appendChild(renderer.domElement)

const CAtomGeometry = new THREE.SphereGeometry(2);
const CAtomMaterial = new THREE.MeshBasicMaterial({color: 0x00FF00});
const CAtom = new THREE.Mesh(CAtomGeometry, CAtomMaterial);
scene.add(CAtom);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = true;

const applyBtn = document.getElementById('applybutton');
applyBtn.addEventListener('click', ChangeDetector);


var radius = 0;
var forces = [];
var position = [];
var particles = [];
var cylinders = [];
var velocities = [];
var time_run = 20;
var noOfParticles = 0;
var repulsion_force = 1000000000000;
var cylinderTolerance = 0.4;
var renderEnd = false;



const welcomeOverlay = document.createElement("div");
welcomeOverlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.75); display: flex; align-items: center;
    justify-content: center; z-index: 200;
`;

const welcomeBox = document.createElement("div");
welcomeBox.style.cssText = `
    background: #111; border: 1px solid #777; padding: 30px;
    max-width: 400px; width: 80%; color: white; font-family: Arial, sans-serif;
`;

welcomeBox.innerHTML = `
    <h2 style="margin-top:0; font-size:18px;">Welcome to AtomSim</h2>
    <p style="color:#ccc; font-size:14px; line-height:1.6;">
        Type a number of particles in the box on the left (try <strong>1000</strong>) and hit <strong>Apply</strong> to run the simulation.<br><br>
        Click <strong>Explanation</strong> to understand how it works.<br><br>
        <strong>Left click + drag</strong> to rotate &nbsp;•&nbsp; <strong>Scroll</strong> to zoom
    </p>
    <button id="welcomeClose" style="
        padding: 7px 14px; background: #222; color: white;
        border: 1px solid #777; cursor: pointer; font-size: 13px;
    ">Got it</button>
`;

welcomeOverlay.appendChild(welcomeBox);
document.body.appendChild(welcomeOverlay);

document.getElementById("welcomeClose").addEventListener("click", function() {
    welcomeOverlay.style.display = "none";
});