import React, { useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar';
import { Alert, Dimensions, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Appbar } from 'react-native-paper';
import * as VideoThumbnails from 'expo-video-thumbnails';

export default function App() {
  const [posts, setPosts] = useState()
  const [loading, setLoading] = useState(true)
  const [thumbnails, setThumbnails] = useState([])

  console.log(thumbnails)

  const getPosts = async () => {
    try {
      const request = await fetch('https://ms.odyssey346.dev/api/v1/posts', {
        headers: {
          'User-Agent': 'MemestreamApp/1.0'
        }
      })
      const data = await request.json()
  
      console.log(data)
      console.log(request.status)
  
      setPosts(data)

      data.map((post) => {
        if (post.filetype !== 'video') return;
        generateThumbnail(post.location)
      })
  
      if (request.status) {
        Alert.alert('DEBUG', 'Memestream API data fetched')
      }

      setLoading(false)
    } catch (err) {
      console.error(err)
      Alert.alert('ERROR', err.message)
    }
  }

  const generateThumbnail = async (path) => {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(
        `https://ms.odyssey346.dev${path}`,
        {
          time: 15000,
        }
      );

      setThumbnails([...thumbnails, { location: path, uri }]);

    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() =>  {
    getPosts()
  }, [])
  
  
  return (
    <ScrollView>
      <Appbar.Header>
        <Appbar.Content title={"Memestream"} />
        <Appbar.Action icon="refresh" onPress={() => { setLoading(true); setThumbnails([]); setPosts(); getPosts() }} />
      </Appbar.Header>
      
      <View style={styles.container}>
        <Text>Open up </Text>
        {loading && <Text>Loading</Text>}
        {!loading && posts.map((post, i) => {
          let thumbnail = thumbnails.find((thumb => thumb.location === post.location))

          if (post.filetype === 'video') return;

          console.log('thumbnail', thumbnail?.location)
          return (
            <View style={styles.image}>
              <Text>{post.filetype} https://ms.odyssey346.dev/{post.location}</Text>
              {post.filetype === 'image' && (
                <Image source={{ uri: `https://ms.odyssey346.dev${post.location}` }}   resizeMode={"contain"} style={{ height: 350 }} />
              )}
            </View>
          )
        })}
      </View>
      <StatusBar style="auto" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 10
  },
  image: {
    marginTop: 30,
    padding: 10,
    color: 'white',
    backgroundColor: 'gray',
    borderRadius: 15
  }
});
