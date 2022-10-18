import React, { useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar';
import { Alert, Dimensions, Image, Platform, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Appbar, Button, Dialog, Paragraph, Portal, Provider, Snackbar } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { v4 as uuid } from 'uuid'
import {Buffer} from 'buffer';
import VideoPlayer from 'expo-video-player'
import { ResizeMode } from 'expo-av';
import PostComponent from './components/Post';


export default function App() {
  const [posts, setPosts] = useState()
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = React.useState(true);
  const [snackbarData, setSnackbarData] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);

    getPosts()
      .then(() => {
        setRefreshing(false)
      }).catch(() => {
        setRefreshing(false)
      })
  }, []);

  const hideDialog = () => setVisible(false);

  const showSnackbar = (text) => {
    console.log(text)
    setSnackbarData({ visible: true, text: text })

    setTimeout(() => {
      setSnackbarData({ visible: false })
    }, 3000)
  }
  

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
      showSnackbar(`Failed to refresh Memestream API data`)
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
        console.error(err)
        Alert.alert('Error uploading', `An error occured while uploading file to memestream err`)
      })
    }
  };

  useEffect(() =>  {
    setLoading(true)
    getPosts()
  }, [])
  
  
  return (
    <Provider>
      <ScrollView
        refreshControl={
          <RefreshControl
            progressViewOffset={45}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
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
          <Snackbar
            visible={snackbarData.visible}
            style={{ marginBottom: 80 }}
            onDismiss={() => setSnackbarData({ visible: false }) }
            action={{
              label: 'Okay',
              onPress: () => {
                setSnackbarData({ visible: false })
              },
            }}>
            {snackbarData.text}
          </Snackbar>

        </Portal>
        
        <View style={styles.container}>
          <Text>Open up </Text>
          {loading && <Text>Loading</Text>}
          {!loading && posts.reverse().map((post, i) => {
            let thumbnail = thumbnails.find((thumb => thumb.location === post.location))

            

            console.log('thumbnail', thumbnail?.location)
            return ( 
              <PostComponent post={post}/>
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
