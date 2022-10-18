import React from 'react'
import { Appbar } from 'react-native-paper'

export default function TopbarComponent({ getPosts }) {
  return (
    <Appbar.Header>
      <Appbar.Content title={"Memestream"} />
      <Appbar.Action icon="refresh" onPress={() => { getPosts() }} />
    </Appbar.Header>
  )
}