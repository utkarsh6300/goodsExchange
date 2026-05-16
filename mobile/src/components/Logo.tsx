import React from "react";
import { Image, ImageStyle, StyleProp } from "react-native";

interface LogoProps {
  size?: number;
  style?: StyleProp<ImageStyle>;
}

export const Logo: React.FC<LogoProps> = ({ size = 100, style }) => {
  return (
    <Image
      source={require("../../assets/images/icon.png")}
      style={[{ width: size, height: size, resizeMode: "contain" }, style]}
    />
  );
};
