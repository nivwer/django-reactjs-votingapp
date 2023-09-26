// Components.
import { Button } from "@chakra-ui/react";

// Component.
function PollCardButton({ children, isLoading }) {
  return (
    <Button flex={"1"} variant={"ghost"} isDisabled={isLoading}>
      {children}
    </Button>
  );
}

export default PollCardButton;
