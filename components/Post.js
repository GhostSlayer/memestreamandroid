import React from 'react'
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import { ResizeMode } from 'expo-av';
import VideoPlayer from 'expo-video-player';
import PropTypes from 'prop-types';

export default function PostComponent({ post }) {

  return (
    <View style={styles.image}>
      <Text>{String(post.filetype).toUpperCase()}</Text>
      {post.filetype === 'image' && (
        <Image source={{ uri: `https://ms.odyssey346.dev${post.location}` }} resizeMode={"contain"} style={{ height: 350 }} />
      )}

      {post.filetype === 'video' && (
        <VideoPlayer
          videoProps={{
            shouldPlay: false,
            resizeMode: ResizeMode.CONTAIN,
            
            
            source: {
              uri: `https://ms.odyssey346.dev${post.location}`,
            },
          }}

          style={{
            height: Dimensions.get('window').height / 2,
          }}
          
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    marginTop: 15,
    padding: 10,
    color: 'white',
    backgroundColor: "#EDF2F7",
    borderRadius: 15
  }
});
