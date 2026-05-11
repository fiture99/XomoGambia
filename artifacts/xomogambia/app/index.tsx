
import { useEffect } from "react";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function Page() {
  useEffect(() => {
    // Redirect to the onboarding screen as soon as this page mounts
    router.replace("/onboarding");
  }, []);

  // Optional: show a loading indicator while redirecting
  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Text style={styles.title}>Redirecting...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 24,
  },
  main: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 960,
    marginHorizontal: "auto",
  },
  title: {
    fontSize: 64,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 36,
    color: "#38434D",
  },
});

