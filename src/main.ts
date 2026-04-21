import './style.css';
import {
    ContactShadowGroundPlugin,
    GBufferPlugin,
    IObject3D,
    LoadingScreenPlugin,
    ProgressivePlugin,
    SSAAPlugin,
    SSAOPlugin,
    ThreeViewer,
} from 'threepipe';
// import { TweakpaneUiPlugin } from '@threepipe/plugin-tweakpane';
import {
    BloomPlugin,
    DepthOfFieldPlugin,
    SSReflectionPlugin,
    TemporalAAPlugin,
} from '@threepipe/webgi-plugins';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';

gsap.registerPlugin(ScrollTrigger);

async function init() {
    const viewer = new ThreeViewer({
        // The canvas element where the scene will be rendered
        canvas: document.getElementById('threepipe-canvas') as HTMLCanvasElement,
        // Enable/Disable MSAA
        msaa: false,
        rgbm: false,
        // Set the render scale automatically based on the device pixel ratio
        renderScale: 'auto',
        // Enable/Disable tone mapping
        tonemap: true,
        // Add some plugins
        plugins: [
            // Show a loading screen while the model is downloading
            LoadingScreenPlugin,
            // Enable progressive rendering and SSAA
            ProgressivePlugin,
            SSAAPlugin,
        ],
    });

    const camera = viewer.scene.mainCamera;
    const position = camera.position;
    const target = camera.target;

    // Add post-processing plugins from threepipe and webgi.dev
    viewer.addPlugins([
        GBufferPlugin,
        SSAOPlugin,
        TemporalAAPlugin,
        BloomPlugin,
        SSReflectionPlugin,
        DepthOfFieldPlugin,
        // Add a ground with contact shadows
        ContactShadowGroundPlugin,
    ]);

    // Add a plugin with a debug UI for tweaking parameters
    // const ui = viewer.addPluginSync(new TweakpaneUiPlugin(true));

    // Load an environment map(optional). One is already set in the model loaded below.
    // await viewer.setEnvironmentMap('https://threejs.org/examples/textures/equirectangular/venice_sunset_1k.hdr', {});

    // Load a 3D model configured in the threepipe editor
    const result = await viewer.load<IObject3D>('models/scene.glb');

    // Configure plugin properties after loading the file
    const ground = viewer.getPlugin(ContactShadowGroundPlugin);
    if (ground) {
        ground.material!.roughness = 0;
        ground.material!.metalness = 0;
    }
    const bloom = viewer.getPlugin(BloomPlugin);
    if (bloom) {
        bloom.pass!.threshold = 2;
    }
    viewer.scene.background = null;
    viewer.renderManager.screenPass.clipBackgroundForce = true;
    viewer.scene.envMapIntensity = 0.5; // Set the environment map intensity

    // Add some debug UI elements for tweaking parameters
    // ui.setupPlugins(SSAAPlugin);
    // ui.setupPlugins(SSReflectionPlugin);
    // ui.setupPlugins(BloomPlugin);
    // viewer.scene.uiConfig = {
    //     expanded: true,
    // };

    console.log(result);
    function setupScrollAnimation() {
        const tl = gsap.timeline();

        //First section
        tl.to(position, { x: 5, duration: 4, onUpdate });

        let needsUpdate = true;

        function onUpdate() {
            needsUpdate = true;
            viewer.renderManager.resetShadows();
        }

        viewer.addEventListener('prevFrame', () => {
            if (needsUpdate) {
                camera.setDirty();
                needsUpdate = false;
            }
        });
    }

    setupScrollAnimation();
}

init();
