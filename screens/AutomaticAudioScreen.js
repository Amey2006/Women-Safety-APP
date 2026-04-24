import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Audio } from "expo-av";
import Voice from "@react-native-voice/voice";

export default function AutomaticAudioScreen() {
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [lastWords, setLastWords] = useState("");

  useEffect(() => {
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = (error) => {
      console.log("Speech error:", error);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [recording]);

  const onSpeechResults = async (event) => {
    const spokenText = event.value?.[0]?.toLowerCase() || "";
    setLastWords(spokenText);

    console.log("Detected:", spokenText);

    if (
      spokenText.includes("help") ||
      spokenText.includes("save")
    ) {
      await stopListening();
      await startRecordingFor10Seconds();
    }
  };

  const startListening = async () => {
    try {
      setLastWords("");

      const micPermission = await Audio.requestPermissionsAsync();

      if (!micPermission.granted) {
        Alert.alert("Permission required", "Please allow microphone permission.");
        return;
      }

      await Voice.start("en-US");
      setIsListening(true);
    } catch (error) {
      console.log("Start listening error:", error);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (error) {
      console.log("Stop listening error:", error);
    }
  };

  const startRecordingFor10Seconds = async () => {
    try {
      if (isRecording) return;

      setIsRecording(true);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);

      Alert.alert("Recording Started", "Audio recording started for 10 seconds.");

      setTimeout(async () => {
        await stopRecording(recording);
      }, 10000);
    } catch (error) {
      console.log("Recording error:", error);
      setIsRecording(false);
    }
  };

  const stopRecording = async (recordingObject) => {
    try {
      await recordingObject.stopAndUnloadAsync();

      const uri = recordingObject.getURI();
      console.log("Recording saved at:", uri);

      setRecording(null);
      setIsRecording(false);

      Alert.alert("Recording Saved", `Audio saved at:\n${uri}`);
    } catch (error) {
      console.log("Stop recording error:", error);
      setIsRecording(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Automatic Audio Test Page</Text>

      <Text style={styles.info}>
        Say "help" or "save" to automatically start 10 second audio recording.
      </Text>

      <TouchableOpacity
        style={styles.dummyButton}
        onPress={() => Alert.alert("Button", "This button is only for testing UI.")}
      >
        <Text style={styles.buttonText}>Dummy Button</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.listenButton, isListening && styles.stopButton]}
        onPress={isListening ? stopListening : startListening}
      >
        <Text style={styles.buttonText}>
          {isListening ? "Stop Listening" : "Start Listening"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.status}>
        Listening: {isListening ? "Yes" : "No"}
      </Text>

      <Text style={styles.status}>
        Recording: {isRecording ? "Yes" : "No"}
      </Text>

      <Text style={styles.words}>
        Detected Words: {lastWords || "None"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101820",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    color: "white",
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  info: {
    color: "#dcdcdc",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
  },
  dummyButton: {
    backgroundColor: "#555",
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 10,
    marginBottom: 20,
  },
  listenButton: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 10,
    marginBottom: 20,
  },
  stopButton: {
    backgroundColor: "#dc3545",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  status: {
    color: "white",
    fontSize: 16,
    marginTop: 8,
  },
  words: {
    color: "#00ff99",
    fontSize: 16,
    marginTop: 20,
    textAlign: "center",
  },
});