import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Link } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function SaveEnergyScreen() {
  // Energy saving tips categorized
  const tips = {
    transportation: [
      "Use public transportation when possible",
      "Consider carpooling for regular commutes",
      "Maintain proper tire pressure to improve fuel efficiency",
      "Combine errands to reduce total travel distance",
      "Consider switching to an electric or hybrid vehicle",
    ],
    home: [
      "Switch to LED light bulbs",
      "Unplug electronics when not in use",
      "Use a programmable thermostat",
      "Wash clothes in cold water",
      "Air dry clothes instead of using a dryer",
    ],
    diet: [
      "Reduce meat consumption, especially red meat",
      "Buy local and seasonal produce",
      "Grow your own herbs and vegetables",
      "Plan meals to reduce food waste",
      "Compost food scraps",
    ],
    waste: [
      "Recycle paper, plastic, glass, and metal",
      "Use reusable shopping bags",
      "Avoid single-use plastics",
      "Repair items instead of replacing them",
      "Donate or sell unwanted items instead of throwing them away",
    ],
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="lightbulb-on" size={32} color="#FFC107" />
        <Text style={styles.title}>Energy-Saving Tips</Text>
      </View>

      <View style={styles.introContainer}>
        <Text style={styles.introText}>
          Making small changes in your daily habits can significantly reduce
          your carbon footprint. Here are some practical tips to help you save
          energy and live more sustainably.
        </Text>
      </View>

      {/* Transportation Tips */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons
            name="car-electric"
            size={24}
            color="#4CAF50"
          />
          <Text style={styles.sectionTitle}>Transportation</Text>
        </View>
        {tips.transportation.map((tip, index) => (
          <View key={`transport-${index}`} style={styles.tipContainer}>
            <MaterialCommunityIcons
              name="check-circle"
              size={20}
              color="#4CAF50"
            />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>

      {/* Home Energy Tips */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons
            name="home-outline"
            size={24}
            color="#2196F3"
          />
          <Text style={styles.sectionTitle}>Home Energy</Text>
        </View>
        {tips.home.map((tip, index) => (
          <View key={`home-${index}`} style={styles.tipContainer}>
            <MaterialCommunityIcons
              name="check-circle"
              size={20}
              color="#2196F3"
            />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>

      {/* Diet Tips */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="food-apple" size={24} color="#FF5722" />
          <Text style={styles.sectionTitle}>Diet & Food</Text>
        </View>
        {tips.diet.map((tip, index) => (
          <View key={`diet-${index}`} style={styles.tipContainer}>
            <MaterialCommunityIcons
              name="check-circle"
              size={20}
              color="#FF5722"
            />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>

      {/* Waste Tips */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="recycle" size={24} color="#9C27B0" />
          <Text style={styles.sectionTitle}>Waste Reduction</Text>
        </View>
        {tips.waste.map((tip, index) => (
          <View key={`waste-${index}`} style={styles.tipContainer}>
            <MaterialCommunityIcons
              name="check-circle"
              size={20}
              color="#9C27B0"
            />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>

      {/* Back to Calculator Button */}
      <Link href="../(tabs)/carbon-footprint" asChild>
        <TouchableOpacity style={styles.backButton}>
          <MaterialCommunityIcons name="calculator" size={20} color="white" />
          <Text style={styles.buttonText}>Back to Calculator</Text>
        </TouchableOpacity>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#333",
  },
  introContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  introText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#555",
  },
  sectionContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#333",
  },
  tipContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  tipText: {
    fontSize: 16,
    color: "#555",
    marginLeft: 10,
    flex: 1,
  },
  backButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 30,
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
});
