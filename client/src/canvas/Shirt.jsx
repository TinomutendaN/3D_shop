import React, { Suspense } from 'react';
import { useSnapshot } from 'valtio';
import { Decal, useGLTF, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { easing } from 'maath';
import state from '../store';

const Shirt = () => {
  const snap = useSnapshot(state);

  // GLTF loading with progress logging
  const { nodes, materials } = useGLTF('/shirt_baked.glb', true, (progress) => {
    console.log(`Loading model: ${progress.loaded / progress.total * 100}%`);
  });

  // Load textures
  const logoTexture = snap.logoDecal ? useTexture(snap.logoDecal) : null;
  const fullTexture = snap.fullDecal ? useTexture(snap.fullDecal) : null;

  // Apply anisotropy if textures are loaded
  if (logoTexture) logoTexture.anisotropy = 16;
  if (fullTexture) fullTexture.anisotropy = 16;

  // Make sure the material and color exist before updating
  useFrame((state, delta) => {
    if (materials?.lambert1) {
      easing.dampC(materials.lambert1.color, snap.color, 0.25, delta);
    }
  });

  // Safely log the state
  const stateString = JSON.stringify(snap);
  console.log('State:', stateString);

  return (
    <group>
      <mesh
        castShadow
        geometry={nodes?.T_Shirt_male?.geometry} // Handle possible undefined nodes
        material={materials?.lambert1} // Handle possible undefined materials
        material-roughness={1}
        dispose={null}
      >
        {/* Full Texture Decal */}
        {snap.isFullTexture && fullTexture && (
          <Decal 
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={1}
            map={fullTexture}
          />
        )}

        {/* Logo Texture Decal */}
        {snap.isLogoTexture && logoTexture && (
          <Decal 
            position={[0, 0.04, 0.15]}
            rotation={[0, 0, 0]}
            scale={0.15}
            map={logoTexture}
            depthTest={false}
            depthWrite={true}
          />
        )}
      </mesh>
    </group>
  );
};

export default Shirt;

// Wrap it in Suspense to handle loading issues
<Suspense fallback={<div>Loading...</div>}>
  <Shirt />
</Suspense>;
