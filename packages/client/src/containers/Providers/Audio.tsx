import type { ReactNode } from "react";
import { useCallback, useEffect, useRef } from "react";

import * as THREE from "three";

import FootSteps1SFX from "../../assets/sounds/game/footsteps1.ogg";
import FootSteps2SFX from "../../assets/sounds/game/footsteps2.ogg";
import FootSteps3SFX from "../../assets/sounds/game/footsteps3.ogg";
import FootSteps4SFX from "../../assets/sounds/game/footsteps4.ogg";
import { AudioContext } from "../../contexts/audio";
import { useVoxelize } from "../../hooks/useVoxelverses";

const WALKING_VOLUME = 0.05;
const LANDING_VOLUME = 0.1;
const WALK_STEP_DELAY = 100;
const SPRINT_STEP_DELAY = 10;

export const AudioProvider = ({
  children,
  ...rest
}: {
  children: ReactNode;
}) => {
  const { camera, rigidControls, updateHooks, world } = useVoxelize();

  const audioLoaderRef = useRef<null | THREE.AudioLoader>(null);
  const listenerRef = useRef<null | THREE.AudioListener>(null);
  const audioBuffers = useRef<Map<string, AudioBuffer>>(new Map());

  const playAudio = useCallback(
    async (audio: string, volume: number, position?: THREE.Vector3) => {
      if (!camera || !world) return;

      let audioLoader = audioLoaderRef.current as THREE.AudioLoader;

      if (!audioLoader) {
        audioLoaderRef.current = new THREE.AudioLoader();
        audioLoader = audioLoaderRef.current;
      }

      let listener = listenerRef.current as THREE.AudioListener;

      if (!listener) {
        listenerRef.current = new THREE.AudioListener();
        listener = listenerRef.current;
      }

      camera.add(listener);

      const sound = position
        ? new THREE.PositionalAudio(listener)
        : new THREE.Audio(listener);

      if (position) {
        sound.position.copy(position);
        (sound as THREE.PositionalAudio).setRefDistance(20);
        world.add(sound);
      }

      return new Promise<void>((resolve) => {
        const runBuffer = (buffer: AudioBuffer) => {
          sound.setBuffer(buffer);
          sound.setVolume(volume);
          sound.setLoop(false);
          sound.play();
          if (sound.source)
            sound.source.onended = () => {
              if (position) world.remove(sound);
              camera.remove(listener);

              resolve();
            };
          else resolve();
        };

        const existingBuffer = audioBuffers.current.get(audio);
        if (existingBuffer) {
          runBuffer(existingBuffer);
        } else {
          audioLoader.load(audio, (buffer) => {
            runBuffer(buffer);
            audioBuffers.current.set(audio, buffer);
          });
        }
      });
    },
    [camera, world]
  );

  useEffect(() => {
    if (!camera || !rigidControls || !updateHooks) return;

    const audioLoader = new THREE.AudioLoader();
    audioLoaderRef.current = audioLoader;

    const tracks = [FootSteps1SFX, FootSteps2SFX, FootSteps3SFX, FootSteps4SFX];

    const playRandomTrack = (volume: number) => {
      const track = tracks[Math.floor(Math.random() * tracks.length)];
      const below = rigidControls.position.clone();
      below.y -= 2;
      return playAudio(track, volume, below);
    };

    let playing = false;
    let shouldPlay = false;
    let soundSource: "landing" | "walking" | null = null;
    let lastRestY = 0;
    let lastVelocityMagnitude = 0;

    updateHooks.push(() => {
      const velocity = rigidControls.body.velocity;
      const velocityMagnitude =
        velocity[0] ** 2 + velocity[1] ** 2 + velocity[2] ** 2;
      lastVelocityMagnitude = velocityMagnitude;

      if (
        rigidControls.state.running &&
        rigidControls.body.atRestY === -1 &&
        lastVelocityMagnitude > 0
      ) {
        shouldPlay = true;
        soundSource = "landing";
      } else {
        shouldPlay = false;
        soundSource = null;
      }

      if (!shouldPlay) {
        if (
          lastRestY !== rigidControls.body.atRestY &&
          rigidControls.body.atRestY === -1 &&
          Math.abs(velocityMagnitude) > 0.01
        ) {
          shouldPlay = true;
          soundSource = "walking";
        } else {
          shouldPlay = false;
          soundSource = null;
        }
      }

      lastRestY = rigidControls.body.atRestY;

      if (shouldPlay && !playing) {
        playing = true;
        playRandomTrack(
          soundSource === "landing" ? LANDING_VOLUME : WALKING_VOLUME
        ).then(() => {
          setTimeout(
            () => {
              playing = false;
            },
            rigidControls.state.sprinting ? SPRINT_STEP_DELAY : WALK_STEP_DELAY
          );
        });
      }
    });
  }, [camera, playAudio, rigidControls, updateHooks, world]);

  return (
    <AudioContext.Provider value={{ playAudio }} {...rest}>
      {children}
    </AudioContext.Provider>
  );
};
