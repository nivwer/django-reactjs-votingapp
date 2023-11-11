// Hooks.
import { useThemeInfo } from "../../../../../hooks/Theme";
import { useSelector } from "react-redux";
// Components.
import { Divider, Stack } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
// SubComponents.
import NavRightDrawerButton from "./NavRightDrawerButton/NavRightDrawerButton";
// Icons.
import { FaUser, FaGear, FaGripLines } from "react-icons/fa6";

// SubComponent ( NavRightDrawer ).
function NavRightDrawerBody({ handleLogout, onClose }) {
  const { isDark } = useThemeInfo();
  const { user } = useSelector((state) => state.session);

  return (
    <Stack spacing={3}>
      {/* Divider. */}
      <Divider borderColor={isDark ? "whiteAlpha.300" : "blackAlpha.200"} />
      {/* Profile Page. */}
      <NavLink to={`/${user.username}`}>
        <NavRightDrawerButton icon={<FaUser />} onClick={onClose}>
          Profile
        </NavRightDrawerButton>
      </NavLink>

      {/* Divider. */}
      <Divider borderColor={isDark ? "whiteAlpha.300" : "blackAlpha.200"} />

      {/* User Pages. */}
      <Stack spacing={0}>
        <NavLink to={`/${user.username}`}>
          <NavRightDrawerButton icon={<FaGripLines />} onClick={onClose}>
            Your Polls
          </NavRightDrawerButton>
        </NavLink>
        <NavLink to={`/${user.username}?tab=votes`}>
          <NavRightDrawerButton icon={<FaGripLines />} onClick={onClose}>
            Your Votes
          </NavRightDrawerButton>
        </NavLink>
        <NavLink to={`/${user.username}?tab=shares`}>
          <NavRightDrawerButton icon={<FaGripLines />} onClick={onClose}>
            Your Shares
          </NavRightDrawerButton>
        </NavLink>
        <NavLink to={`/${user.username}?tab=bookmarks`}>
          <NavRightDrawerButton icon={<FaGripLines />} onClick={onClose}>
            Your Bookmarks
          </NavRightDrawerButton>
        </NavLink>
      </Stack>

      {/* Divider. */}
      <Divider borderColor={isDark ? "whiteAlpha.300" : "blackAlpha.200"} />

      {/* Settings Pages. */}
      <Stack spacing={0}>
        <NavLink to={"/settings"}>
          <NavRightDrawerButton icon={<FaGear />} onClick={onClose}>
            Settings
          </NavRightDrawerButton>
        </NavLink>
      </Stack>

      {/* Divider. */}
      <Divider borderColor={isDark ? "whiteAlpha.300" : "blackAlpha.200"} />

      {/* Sign Out. */}
      <NavRightDrawerButton onClick={handleLogout}>
        Sign Out
      </NavRightDrawerButton>
    </Stack>
  );
}

export default NavRightDrawerBody;