import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { TextInput } from "react-native-paper";
import { Link } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { auth, db } from "./../../configs/firebaseConfig"; // Adjust path as needed
import {
  collection,
  addDoc,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

// Multiplication factors for each category
const TRANSPORT_FACTORS = {
  Car: 2.3,
  Bus: 0.8,
  Train: 0.4,
  Bicycle: 0.0,
  Plane: 4.5,
};

const FUEL_FACTORS = {
  Petrol: 2.3,
  Diesel: 2.7,
  Electric: 0.5,
  Hybrid: 1.8,
};

// Base factors for other categories
const ELECTRICITY_FACTOR = 0.5; // kg CO2/kWh
const DIET_FACTORS = {
  "Meat Heavy": 3.3,
  Average: 2.5,
  Vegetarian: 1.7,
  Vegan: 1.5,
};
const WASTE_FACTOR = 0.7; // kg CO2/kg of waste

export default function CarbonFootprintCalculator() {
  // State for form inputs
  const [transportMedium, setTransportMedium] = useState("Car");
  const [fuelType, setFuelType] = useState("Petrol");
  const [dietType, setDietType] = useState("Average");
  const [hoursTraveled, setHoursTraveled] = useState("");
  const [electricityConsumption, setElectricityConsumption] = useState("");
  const [wasteGeneration, setWasteGeneration] = useState("");

  // State for calculation result
  const [carbonFootprint, setCarbonFootprint] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate carbon footprint
  const calculateFootprint = () => {
    // Convert inputs to numbers and handle empty inputs
    const hours = parseFloat(hoursTraveled) || 0;
    const electricity = parseFloat(electricityConsumption) || 0;
    const waste = parseFloat(wasteGeneration) || 0;

    // Calculate individual components
    const transportEmission =
      hours * TRANSPORT_FACTORS[transportMedium] * FUEL_FACTORS[fuelType];
    const electricityEmission = electricity * ELECTRICITY_FACTOR;
    const dietEmission = DIET_FACTORS[dietType] * 30; // Assuming 30 meals per month
    const wasteEmission = waste * WASTE_FACTOR;

    // Calculate total footprint
    const total =
      transportEmission + electricityEmission + dietEmission + wasteEmission;

    // Set the result (rounded to 2 decimal places)
    setCarbonFootprint(Math.round(total * 100) / 100);
  };

  // Save carbon footprint data to Firestore
  const saveFootprintData = async () => {
    if (!carbonFootprint) {
      Alert.alert("No Data", "Please calculate your carbon footprint first.");
      return;
    }

    if (!auth.currentUser) {
      Alert.alert(
        "Authentication Required",
        "Please sign in to save your data."
      );
      return;
    }

    setIsLoading(true);

    try {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1; // JavaScript months are 0-indexed

      // Create a document with the current date
      const recordsCollectionRef = collection(
        db,
        "carbonFootprints",
        auth.currentUser.uid,
        "records"
      );
      await addDoc(recordsCollectionRef, {
        transportMedium,
        fuelType,
        dietType,
        hoursTraveled: parseFloat(hoursTraveled) || 0,
        electricityConsumption: parseFloat(electricityConsumption) || 0,
        wasteGeneration: parseFloat(wasteGeneration) || 0,
        carbonFootprint,
        timestamp: serverTimestamp(),
        year,
        month,
        day: currentDate.getDate(),
      });

      // Also update the monthly summary for heatmap
      const monthlyDocRef = doc(
        db,
        "carbonFootprints",
        auth.currentUser.uid,
        "monthlySummary",
        `${year}-${month}`
      );

      // Get the existing document if it exists
      const monthlyDoc = await getDoc(monthlyDocRef);

      if (monthlyDoc.exists()) {
        // Update the existing document
        const currentData = monthlyDoc.data();
        const newTotal = currentData.totalFootprint + carbonFootprint;
        const newCount = currentData.count + 1;

        await setDoc(
          monthlyDocRef,
          {
            totalFootprint: newTotal,
            count: newCount,
            averageFootprint: newTotal / newCount,
            lastUpdated: serverTimestamp(),
            year,
            month,
          },
          { merge: true }
        );
      } else {
        // Create a new document
        await setDoc(monthlyDocRef, {
          year,
          month,
          totalFootprint: carbonFootprint,
          count: 1,
          averageFootprint: carbonFootprint,
          lastUpdated: serverTimestamp(),
        });
      }

      Alert.alert("Success", "Your carbon footprint data has been saved!");

      // Reset form after successful save
      setHoursTraveled("");
      setElectricityConsumption("");
      setWasteGeneration("");
      setCarbonFootprint(null);
    } catch (error) {
      console.error("Error saving data:", error);
      Alert.alert("Error", "Failed to save your data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="leaf" size={32} color="#4CAF50" />
        <Text style={styles.title}>Carbon Footprint Calculator</Text>
      </View>

      <View style={styles.formContainer}>
        {/* Transport Medium Selection */}
        <Text style={styles.label}>Transport Medium</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={transportMedium}
            onValueChange={(itemValue) => setTransportMedium(itemValue)}
            style={styles.picker}
          >
            {Object.keys(TRANSPORT_FACTORS).map((transport) => (
              <Picker.Item
                key={transport}
                label={transport}
                value={transport}
              />
            ))}
          </Picker>
        </View>

        {/* Fuel Type Selection */}
        <Text style={styles.label}>Fuel Type</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={fuelType}
            onValueChange={(itemValue) => setFuelType(itemValue)}
            style={styles.picker}
          >
            {Object.keys(FUEL_FACTORS).map((fuel) => (
              <Picker.Item key={fuel} label={fuel} value={fuel} />
            ))}
          </Picker>
        </View>

        {/* Diet Type Selection */}
        <Text style={styles.label}>Diet Type</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={dietType}
            onValueChange={(itemValue) => setDietType(itemValue)}
            style={styles.picker}
          >
            {Object.keys(DIET_FACTORS).map((diet) => (
              <Picker.Item key={diet} label={diet} value={diet} />
            ))}
          </Picker>
        </View>

        {/* Hours Traveled Input */}
        <TextInput
          label="Hours Traveled (per month)"
          value={hoursTraveled}
          onChangeText={setHoursTraveled}
          keyboardType="numeric"
          style={styles.input}
          mode="outlined"
        />

        {/* Electricity Consumption Input */}
        <TextInput
          label="Electricity Consumption (kWh per month)"
          value={electricityConsumption}
          onChangeText={setElectricityConsumption}
          keyboardType="numeric"
          style={styles.input}
          mode="outlined"
        />

        {/* Waste Generation Input */}
        <TextInput
          label="Waste Generation (kg per month)"
          value={wasteGeneration}
          onChangeText={setWasteGeneration}
          keyboardType="numeric"
          style={styles.input}
          mode="outlined"
        />

        {/* Calculate Button */}
        <TouchableOpacity
          style={styles.calculateButton}
          onPress={calculateFootprint}
        >
          <Text style={styles.buttonText}>Calculate</Text>
        </TouchableOpacity>
      </View>

      {/* Results Display */}
      {carbonFootprint !== null && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Your Carbon Footprint</Text>
          <Text style={styles.resultValue}>{carbonFootprint} kg CO₂</Text>
          <Text style={styles.resultDescription}>
            This is your estimated monthly carbon footprint based on the
            information provided.
          </Text>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveFootprintData}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Saving..." : "Save This Record"}
            </Text>
          </TouchableOpacity>

          <Link href="../screens/carbon-history" asChild>
            <TouchableOpacity style={styles.historyButton}>
              <Text style={styles.buttonText}>View History & Heatmap</Text>
            </TouchableOpacity>
          </Link>

          <Link href="../screens/save-energy" asChild>
            <TouchableOpacity style={styles.saveEnergyButton}>
              <Text style={styles.buttonText}>Get Energy-Saving Tips</Text>
            </TouchableOpacity>
          </Link>
        </View>
      )}
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
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#333",
  },
  formContainer: {
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
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#555",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
  },
  picker: {
    height: 50,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "white",
  },
  calculateButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: "#FF9800",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  historyButton: {
    backgroundColor: "#9C27B0",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  resultContainer: {
    backgroundColor: "#E8F5E9",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2E7D32",
  },
  resultValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 10,
  },
  resultDescription: {
    textAlign: "center",
    color: "#555",
    marginBottom: 20,
  },
  saveEnergyButton: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
  },
});
