import React, { Component, useEffect, useState } from 'react';
import { Platform, View,StyleSheet, Image as ReactNativeImage } from 'react-native';
import { Camera, CameraType, } from 'expo-camera';
import { ExpoWebGLRenderingContext, } from 'expo-gl';
import {  } from 'expo-gl';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { cameraWithTensors } from '@tensorflow/tfjs-react-native';
import { encode as btoa} from 'base-64'
import { Pose, InputImage} from '@mediapipe/pose';
const TensorCamera = cameraWithTensors(Camera);

const camera: React.FC = () => {
  const [cameraReady, setCameraReady] = useState(false);
  // 
  const [frameImageUri, setFrameImageUri] = useState("");
  const tensorToBase64 = async (tensor: tf.Tensor3D): Promise<string> => {
    const buffer = await tensor.data();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    // if(binary.length) {
    //   const newPose = new Pose();
    //   const newImage = new Image();
    //   newImage.src = binary
    //   newPose.send({image: newImage})
    // }
    return btoa(binary);
  };
  
  let textureDims;
  if (Platform.OS === 'ios') {
    textureDims = {
      height: 1920,
      width: 1080,
    };
  } else {
    textureDims = {
      height: 1200,
      width: 1600,
    };
  }
  let frameCount = 0;
  let makePredictionsEveryNFrames = 3;
  const handleCameraStream = async (images: IterableIterator<tf.Tensor3D>, updatePreview: () => void, gl: ExpoWebGLRenderingContext) => {
    const loop = async () => {
      if (frameCount % makePredictionsEveryNFrames === 0){
        const nextImageTensor = images.next().value as tf.Tensor3D;
        const base64String  = await tensorToBase64(nextImageTensor);
        setFrameImageUri(base64String)
        frameCount += 1;
        frameCount = frameCount % makePredictionsEveryNFrames;
        requestAnimationFrame(loop); 
      }
    };
    loop();
  };

  useEffect(() => {
    // Perform any camera setup here if needed
    Promise.all([    tf.setBackend("cpu"), tf.ready()]).then(() => {
      setCameraReady(true);
    })
  }, []);

  return (
    <View style={styles.container}>
      {cameraReady && (
        <TensorCamera
          style={styles.tensorCamera}
          type={CameraType.back}
          cameraTextureHeight={textureDims.height}
          cameraTextureWidth={textureDims.width}
          resizeHeight={200}
          resizeWidth={152}
          resizeDepth={3}
          onReady={(images, updatePreview, gl) => {
            handleCameraStream(images, updatePreview, gl);
          }}
          autorender={true}
          useCustomShadersToResize
        />
      )}
      {frameImageUri.length && (
        <ReactNativeImage
          source={{ uri: frameImageUri }} // Replace this with the actual processed image URI
          style={styles.image}
          resizeMode="cover" // This ensures the image covers
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  image: {
    ...StyleSheet.absoluteFillObject, // Fills the entire parent container
  },
  tensorCamera: {
    ...StyleSheet.absoluteFillObject, // Fills the entire parent container
  },
});
export default camera;
