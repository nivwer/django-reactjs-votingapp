import { useThemeInfo } from "../../../hooks/Theme";
import { IconButton } from "@chakra-ui/react";

function CustomIconButton({ variant = "solid", ...props }) {
  const { isDark } = useThemeInfo();
  const c = "gothicPurpleAlpha";
  return (
    <IconButton
      variant={variant}
      borderRadius={"full"}
      color={isDark ? "whiteAlpha.900" : "blackAlpha.900"}
      colorScheme={"gothicPurpleAlpha"}
      border={"0px  solid"}
      borderColor={`${c}.200`}
      bg={variant == "solid" ? `${c}.200` : "transparents"}
      outline={variant == "outline" ? "1px solid" : "0px solid"}
      outlineColor={`${c}.300`}
      _hover={{
        bg: variant == "solid" ? `${c}.300` : variant == "ghost" ? `${c}.200` : `${c}.100`,
      }}
      _active={{
        bg: variant == "solid" ? `${c}.400` : variant == "ghost" ? `${c}.300` : `${c}.200`,
      }}
      {...props}
    />
  );
}

export default CustomIconButton;
