import {
  FlatList,
  Image,
  ImageBackground,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ImagesNames } from "./src/asset/constant/imagesPath";
import { deviceHeight, deviceWidth } from "./src/asset/constant/common";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const App = () => {
  const genAI = new GoogleGenerativeAI("AIzaSyCaY3EIp0qMecYje3qxhjSmdXMACQGyPBs"); // Current Key
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState([]);

  const getCurrentTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const isPM = hours >= 12;
    hours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const period = isPM ? "PM" : "AM";
    return `${hours}:${formattedMinutes} ${period}`;
  };

  const onPressSend = async () => {
    if (message.length === 0) {
      return;
    }
    Keyboard.dismiss()
    setMessage('')
    const senderMessage = {
      isSender: true,
      isReciver: false,
      message: message,
      datTime: getCurrentTime(),
    };
    setConversation((prev) => [senderMessage, ...prev]);
    setMessage("");
    const receiverResponse = await generatePromptMessage(message);
    setTimeout(() => {
      if (receiverResponse) {
        setConversation((prev) => [receiverResponse, ...prev]);
      }
    }, 500);
  };

  const generatePromptMessage = async (input) => {
    try {
      const generateModal = genAI.getGenerativeModel({ model: "gemini-pro" });
      const generateResult = await generateModal.generateContent(input);
      const result = await generateResult.response;
      const text = await result.text();
      if (text) {
        return {
          isSender: false,
          isReciver: true,
          message: text,
          datTime: getCurrentTime(),
        };
      }
    } catch (error) {
      console.error("Error generating prompt message:", error);
    }
    return null;
  };

  const SenderMessage = ({ data }) => {
    return (
      <View
        style={{
          alignSelf: "flex-end",
          marginVertical: 5,
          padding: 10,
          backgroundColor: "#d1f5d3",
          borderRadius: 10,
          maxWidth: "80%",
        }}
      >
        <Text style={{ color: "black" }}>{data.message}</Text>
        <Text style={{ fontSize: 10, color: "gray", alignSelf: "flex-end" }}>
          {data.datTime}
        </Text>
      </View>
    );
  };

  const ReceiverMessage = ({ data }) => {
    return (
      <View
        style={{
          alignSelf: "flex-start",
          marginVertical: 5,
          padding: 10,
          backgroundColor: "#f5d1d1",
          borderRadius: 10,
          maxWidth: "80%",
        }}
      >
        <Text style={{ color: "black" }}>{data.message}</Text>
        <Text style={{ fontSize: 10, color: "gray", alignSelf: "flex-end" }}>
          {data.datTime}
        </Text>
      </View>
    );
  };

  const renderChatResponse = ({ item }) => {
    return (
      <View style={{ width: deviceWidth, padding: 10 }}>
        {item.isSender && <SenderMessage data={item} />}
        {item.isReciver && <ReceiverMessage data={item} />}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ImageBackground source={ImagesNames.backgroundImages} style={styles.container}>
        <KeyboardAwareScrollView    keyboardShouldPersistTaps bounces={false} contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.container}>
            <FlatList
              data={conversation}
              renderItem={renderChatResponse}
              keyExtractor={(item, index) => index.toString()}
              inverted
              keyboardShouldPersistTaps
              contentContainerStyle={{ paddingBottom: 20 }}
            />
            <View style={styles.inputView}>
              <TextInput
                value={message}
                placeholder="Enter your prompt"
                placeholderTextColor={"gray"}
                onChangeText={(text) => setMessage(text)}
                style={{ height: 60, paddingHorizontal: 15, width: "80%", color: "black" }}
              />
              <TouchableOpacity
                disabled={message.length === 0}
                onPress={onPressSend}
                style={{ height: 50, width: 50, justifyContent: "center", alignItems: "center" }}
              >
                <Image style={{ width: 30, height: 30 }} source={ImagesNames.sendButton} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </ImageBackground>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    height: deviceHeight,
    width: deviceWidth,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  inputView: {
    backgroundColor: "white",
    width: "100%",
    height: 60,
    flexDirection: "row",
  },
});
