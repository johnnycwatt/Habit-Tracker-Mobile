import React from "react";
import { Svg, Rect, Text as SvgText } from "react-native-svg";
import { View, StyleSheet, Dimensions } from "react-native";
import { useTheme } from "../context/themeContext";

interface CustomBarChartProps {
  data: number[];
  labels: string[];
}

const CustomBarChart: React.FC<CustomBarChartProps> = ({ data, labels }) => {
  const { theme } = useTheme();
  const chartWidth = Dimensions.get("window").width - 32;
  const chartHeight = 200;
  const barWidth = chartWidth / data.length - 10;
  const maxValue = Math.max(...data, 1);

  return (
    <View
      style={[
        styles.chartContainer,
        { backgroundColor: theme.colors.card },
      ]}
    >
      <Svg width={chartWidth} height={chartHeight}>
        {data.map((value, index) => {
          const barHeight = (value / maxValue) * (chartHeight - 40);
          return (
            <React.Fragment key={index}>
              {/* Bar */}
              <Rect
                x={index * (barWidth + 10)}
                y={chartHeight - barHeight - 20}
                width={barWidth}
                height={barHeight}
                fill={theme.colors.primary}
              />
              {/* Value Label */}
              <SvgText
                x={index * (barWidth + 10) + barWidth / 2}
                y={chartHeight - barHeight - 25}
                fontSize="12"
                fill={theme.colors.text}
                textAnchor="middle"
              >
                {value}
              </SvgText>
              {/* X-Axis Label */}
              <SvgText
                x={index * (barWidth + 10) + barWidth / 2}
                y={chartHeight - 5}
                fontSize="12"
                fill={theme.colors.text}
                textAnchor="middle"
              >
                {labels[index]}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default CustomBarChart;
