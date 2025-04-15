import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Link } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { auth, db } from "../../configs/firebaseConfig"; // Update this path
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where,
} from "firebase/firestore";
import { LineChart } from "react-native-chart-kit";
import Svg, { Rect, Text as SvgText } from "react-native-svg";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const YEARS = [2023, 2024, 2025, 2026]; // Update as needed

// Color scale for heatmap
const getColor = (value, minValue, maxValue) => {
  // Scale from green (low) to red (high)
  if (value === 0) return "#e0e0e0"; // Gray for no data

  const ratio = (value - minValue) / (maxValue - minValue);

  // RGB values for gradient from green to red
  const r = Math.floor(255 * ratio);
  const g = Math.floor(255 * (1 - ratio));
  const b = 0;

  return `rgb(${r}, ${g}, ${b})`;
};

export default function CarbonHistory() {
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState([]);
  const [recentEntries, setRecentEntries] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Current year as default
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(100);

  const screenWidth = Dimensions.get("window").width - 32; // Accounting for padding
  const cellSize = Math.floor(screenWidth / 12) - 2; // 12 months with 2px gap

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    // Fetch monthly summary data for heatmap
    const fetchMonthlyData = async () => {
      try {
        const userId = auth.currentUser.uid;

        // Get monthly summary data
        const monthlySummaryRef = collection(
          db,
          "carbonFootprints",
          userId,
          "monthlySummary"
        );
        const monthlySnapshot = await getDocs(monthlySummaryRef);

        if (!monthlySnapshot.empty) {
          const data = monthlySnapshot.docs.map((doc) => doc.data());

          // Calculate min and max values for color scaling
          const values = data
            .map((item) => item.averageFootprint)
            .filter((val) => val > 0);
          if (values.length > 0) {
            setMinValue(Math.min(...values));
            setMaxValue(Math.max(...values));
          }

          setMonthlyData(data);
        }

        // Get recent entries
        const recordsRef = collection(
          db,
          "carbonFootprints",
          userId,
          "records"
        );
        const recentQuery = query(
          recordsRef,
          orderBy("timestamp", "desc"),
          limit(5)
        );
        const recentSnapshot = await getDocs(recentQuery);

        if (!recentSnapshot.empty) {
          const entries = recentSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() || new Date(),
          }));

          setRecentEntries(entries);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyData();
  }, []);

  // Prepare data for line chart
  const prepareChartData = () => {
    // Filter data for the selected year
    const yearData = monthlyData.filter((item) => item.year === selectedYear);

    // Create an array for all months with default value 0
    const monthValues = Array(12).fill(0);

    // Fill in actual values
    yearData.forEach((item) => {
      if (item.month >= 1 && item.month <= 12) {
        monthValues[item.month - 1] = item.averageFootprint || 0;
      }
    });

    return {
      labels: MONTHS,
      datasets: [
        {
          data: monthValues,
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          strokeWidth: 2,
        },
      ],
      legend: ["kg CO₂"],
    };
  };

  // Render heatmap
  const renderHeatmap = () => {
    // Filter data for the selected year
    const yearData = monthlyData.filter((item) => item.year === selectedYear);

    return (
      <View style={styles.heatmapContainer}>
        <Text style={styles.heatmapTitle}>
          Monthly Carbon Footprint Heatmap ({selectedYear})
        </Text>

        <View style={styles.heatmapLegend}>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendColor,
                { backgroundColor: getColor(minValue, minValue, maxValue) },
              ]}
            />
            <Text style={styles.legendText}>Low</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendColor,
                {
                  backgroundColor: getColor(
                    (minValue + maxValue) / 2,
                    minValue,
                    maxValue
                  ),
                },
              ]}
            />
            <Text style={styles.legendText}>Medium</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendColor,
                { backgroundColor: getColor(maxValue, minValue, maxValue) },
              ]}
            />
            <Text style={styles.legendText}>High</Text>
          </View>
        </View>

        <Svg height={cellSize + 30} width={screenWidth}>
          {MONTHS.map((month, index) => (
            <SvgText
              key={`month-${index}`}
              x={index * cellSize + cellSize / 2}
              y={20}
              fontSize={10}
              textAnchor="middle"
              fill="#555"
            >
              {month}
            </SvgText>
          ))}
        </Svg>

        <Svg height={cellSize} width={screenWidth}>
          {MONTHS.map((_, monthIndex) => {
            const monthNumber = monthIndex + 1;
            const dataForMonth = yearData.find(
              (item) => item.month === monthNumber
            );
            const value = dataForMonth ? dataForMonth.averageFootprint : 0;

            return (
              <React.Fragment key={`cell-${monthIndex}`}>
                <Rect
                  x={monthIndex * cellSize}
                  y={0}
                  width={cellSize - 2}
                  height={cellSize - 2}
                  fill={getColor(value, minValue, maxValue)}
                  rx={4}
                  ry={4}
                />
                {value > 0 && (
                  <SvgText
                    x={monthIndex * cellSize + cellSize / 2}
                    y={cellSize / 2 + 4}
                    fontSize={9}
                    textAnchor="middle"
                    fill={value > (minValue + maxValue) / 2 ? "white" : "black"}
                  >
                    {Math.round(value)}
                  </SvgText>
                )}
              </React.Fragment>
            );
          })}
        </Svg>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>
          Loading your carbon footprint data...
        </Text>
      </View>
    );
  }

  // if (!auth.currentUser) {
  //   return (
  //     <View style={styles.container}>
  //       <View style={styles.header}>
  //         <MaterialCommunityIcons name="history" size={32} color="#4CAF50" />
  //         <Text style={styles.title}>Carbon Footprint History</Text>
  //       </View>

  //       <View style={styles.messageContainer}>
  //         <Text style={styles.messageText}>
  //           Please sign in to view your carbon footprint history.
  //         </Text>

  //         <Link href="/" asChild>
  //           <TouchableOpacity style={styles.backButton}>
  //             <Text style={styles.buttonText}>Go Back</Text>
  //           </TouchableOpacity>
  //         </Link>
  //       </View>
  //     </View>
  //   );
  // }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="history" size={32} color="#4CAF50" />
        <Text style={styles.title}>Carbon Footprint History</Text>
      </View>

      {/* Year Selector */}
      <View style={styles.yearSelector}>
        <Text style={styles.sectionTitle}>Select Year:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.yearScrollView}
        >
          {YEARS.map((year) => (
            <TouchableOpacity
              key={`year-${year}`}
              style={[
                styles.yearButton,
                selectedYear === year && styles.selectedYearButton,
              ]}
              onPress={() => setSelectedYear(year)}
            >
              <Text
                style={[
                  styles.yearButtonText,
                  selectedYear === year && styles.selectedYearButtonText,
                ]}
              >
                {year}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Heatmap */}
      {renderHeatmap()}

      {/* Line Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Monthly Trend ({selectedYear})</Text>
        {monthlyData.length > 0 ? (
          <LineChart
            data={prepareChartData()}
            width={screenWidth}
            height={220}
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#4CAF50",
              },
            }}
            bezier
            style={styles.chart}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>
              No data available for {selectedYear}
            </Text>
          </View>
        )}
      </View>

      {/* Recent Entries */}
      <View style={styles.recentEntriesContainer}>
        <Text style={styles.sectionTitle}>Recent Entries</Text>

        {recentEntries.length > 0 ? (
          recentEntries.map((entry, index) => (
            <View key={entry.id} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryDate}>
                  {entry.timestamp.toDateString()}
                </Text>
                <Text style={styles.entryFootprint}>
                  {entry.carbonFootprint} kg CO₂
                </Text>
              </View>

              <View style={styles.entryDetails}>
                <View style={styles.entryDetail}>
                  <MaterialCommunityIcons name="car" size={16} color="#555" />
                  <Text style={styles.entryDetailText}>
                    {entry.transportMedium} ({entry.fuelType})
                  </Text>
                </View>

                <View style={styles.entryDetail}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={16}
                    color="#555"
                  />
                  <Text style={styles.entryDetailText}>
                    {entry.hoursTraveled} hours traveled
                  </Text>
                </View>

                <View style={styles.entryDetail}>
                  <MaterialCommunityIcons
                    name="lightning-bolt"
                    size={16}
                    color="#555"
                  />
                  <Text style={styles.entryDetailText}>
                    {entry.electricityConsumption} kWh
                  </Text>
                </View>

                <View style={styles.entryDetail}>
                  <MaterialCommunityIcons
                    name="food-apple"
                    size={16}
                    color="#555"
                  />
                  <Text style={styles.entryDetailText}>
                    {entry.dietType} diet
                  </Text>
                </View>

                <View style={styles.entryDetail}>
                  <MaterialCommunityIcons
                    name="delete"
                    size={16}
                    color="#555"
                  />
                  <Text style={styles.entryDetailText}>
                    {entry.wasteGeneration} kg waste
                  </Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No recent entries found</Text>
          </View>
        )}
      </View>

      {/* Navigation Buttons */}
      <View style={styles.buttonsContainer}>
        <Link href="../(tabs)/carbon-footprint" asChild>
          <TouchableOpacity style={styles.calculatorButton}>
            <MaterialCommunityIcons name="calculator" size={20} color="white" />
            <Text style={styles.buttonText}>Back to Calculator</Text>
          </TouchableOpacity>
        </Link>

        <Link href="./save-energy" asChild>
          <TouchableOpacity style={styles.tipsButton}>
            <MaterialCommunityIcons
              name="lightbulb-on"
              size={20}
              color="white"
            />
            <Text style={styles.buttonText}>Energy-Saving Tips</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#555",
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
  messageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
  },
  messageText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  yearSelector: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  yearScrollView: {
    flexDirection: "row",
  },
  yearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
    marginRight: 8,
  },
  selectedYearButton: {
    backgroundColor: "#4CAF50",
  },
  yearButtonText: {
    fontSize: 16,
    color: "#555",
  },
  selectedYearButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  heatmapContainer: {
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
  heatmapTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  heatmapLegend: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: "#555",
  },
  chartContainer: {
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
  chart: {
    marginVertical: 8,
    borderRadius: 10,
  },
  noDataContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  noDataText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
  recentEntriesContainer: {
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
  entryCard: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  entryDate: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
  },
  entryFootprint: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  entryDetails: {
    gap: 6,
  },
  entryDetail: {
    flexDirection: "row",
    alignItems: "center",
  },
  entryDetailText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 8,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  calculatorButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    flex: 1,
    marginRight: 8,
    flexDirection: "row",
    justifyContent: "center",
  },
  tipsButton: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    flex: 1,
    marginLeft: 8,
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 8,
  },
  backButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    width: "50%",
  },
});
