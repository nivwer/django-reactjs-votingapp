// Components.
import { Box, Divider, Stack, Text } from "@chakra-ui/react";
// SubComponents.
import UsernameForm from "./UsernameForm/UsernameForm";
import PasswordForm from "./PasswordForm/PasswordForm";

// Page.
function AccountSettings() {
  return (
    <Box opacity={"0.9"} w={"100%"} p={10}>
      <Stack spacing={10}>
        {/* Username. */}
        <Stack>
          <Text fontWeight={"medium"} fontSize={"2xl"}>
            Change username
          </Text>
          <Divider />
          <UsernameForm />
        </Stack>
        {/* Password. */}
        <Stack>
          <Text fontWeight={"medium"} fontSize={"2xl"}>
            Change password
          </Text>
          <Divider />
          <PasswordForm />
        </Stack>
      </Stack>
    </Box>
  );
}

export default AccountSettings;