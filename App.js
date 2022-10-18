import React, { useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar';
import { Alert, Dimensions, Image, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Appbar, Button, Dialog, Paragraph, Portal, Provider } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { v4 as uuid } from 'uuid'
import {Buffer} from 'buffer';
import VideoPlayer from 'expo-video-player'
import { ResizeMode } from 'expo-av';


export default function App() {
  const [posts, setPosts] = useState()
  const [loading, setLoading] = useState(true)
  const [thumbnails, setThumbnails] = useState([])
  const [visible, setVisible] = React.useState(true);

  const hideDialog = () => setVisible(false);

  console.log(thumbnails)

  const getPosts = async () => {
    try {
      // TODO: proxy requests through drivet's servers to ensure privacy. dont proxy uploads though 
      const request = await fetch('https://ms.odyssey346.dev/api/v1/posts', {
        headers: {
          'User-Agent': 'MemestreamApp/1.0'
        }
      })
      const data = await request.json()
  
      console.log(data)
      console.log(request.status)
  
      setPosts(data)
  
      if (request.status) {
        Alert.alert('DEBUG', 'Memestream API data fetched')
      }

      setLoading(false)
    } catch (err) {
      console.error(err)
      Alert.alert('Error', `Failed to fetch Memestream API data. Error: ${err.message}`)
    }
  }

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
      
    });

    console.log(result);

    if (!result.cancelled) {
      const uri = Platform.OS === 'ios' ? result.uri.replace('file://', '') : result.uri
      let fileExtension = uri.substr(uri.lastIndexOf('.') + 1);

      // FIXME: Uploading files from android not possible due to some expo trickery. Do another way to do this
      let uuidlol = `${uuid()}.${fileExtension}`

      const form = new FormData();
      
      form.append('file', {
        uri,
        name: uuidlol,
        type: `${result.type}/${fileExtension}`
      })

      fetch('https://ms.odyssey346.dev/api/v1/upload', {
        method: 'POST',
        body: form,
        headers: {
          'User-Agent': 'MemestreamApp/1.0'
        }
      }).then((data) => {
        getPosts()
      }).catch(err => {
        Alert.alert('Error uploading', 'An error occured while uploading file to memestream')
      })
    }
  };

  useEffect(() =>  {
    setLoading(true)
    getPosts()
  }, [])
  
  
  return (
    <Provider>
      <ScrollView>
        <Appbar.Header>
          <Appbar.Content title={"Memestream"} />
          <Appbar.Action icon="refresh" onPress={() => { getPosts() }} />
        </Appbar.Header>

        <Button mode="contained-tonal" onPress={() => pickImage() }>Upload image</Button>

        <Portal>
          <Dialog visible={visible} onDismiss={hideDialog}>
            <Dialog.Title>Notice</Dialog.Title>
            <Dialog.Content>
              <Paragraph>Hello! Thank you for trying this app. As you probably know, this app is in pre-alpha stage, and is missing most of its functionality. They are being developed with timebeing</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideDialog}>Done</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        
        <View style={styles.container}>
          <Text>Open up </Text>
          {loading && <Text>Loading</Text>}
          {!loading && posts.reverse().map((post, i) => {
            let thumbnail = thumbnails.find((thumb => thumb.location === post.location))

            

            console.log('thumbnail', thumbnail?.location)
            return (
              <View style={styles.image}>
                <Text>{post.filetype} https://ms.odyssey346.dev/{post.location}</Text>
                {post.filetype === 'image' && (
                  <Image source={{ uri: `https://ms.odyssey346.dev${post.location}` }}   resizeMode={"contain"} style={{ height: 350 }} />
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
            )
          })}
        </View>
        <StatusBar style="auto" />
      </ScrollView>
    </Provider>
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
