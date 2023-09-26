// Hooks.
import { useThemeInfo } from "../../../hooks/Theme";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  useCreatePollMutation,
  useGetPollCategoriesQuery,
  useUpdatePollMutation,
} from "../../../api/pollApiSlice";
// Components.
import PollFormBody from "./PollFormBody";
import CustomProgress from "../../Progress/CustomProgress";
import {
  useDisclosure,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Heading,
  IconButton,
} from "@chakra-ui/react";

// Component.
function PollModal({ poll = false, buttonStyles, icon = false }) {
  const { ThemeColor, isDark } = useThemeInfo();
  const session = useSelector((state) => state.session);
  // Modal.
  const { isOpen, onOpen, onClose } = useDisclosure();
  // React hook form.
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
    setError,
  } = useForm();

  // Request to get poll categories.
  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useGetPollCategoriesQuery();
  // Request to create polls.
  const [createPoll, { isLoading: isCreateLoading }] = useCreatePollMutation();
  // Request to update polls.
  const [updatePoll, { isLoading: isUpdateLoading }] = useUpdatePollMutation();

  // Is loading.
  const isLoading = isCreateLoading || isUpdateLoading || isCategoriesLoading;

  // Options list.
  const initialOptionsState = {
    options: [],
    add_options: [],
    del_options: [],
  };
  const [options, setOptions] = useState(initialOptionsState);
  // Privacy Radio.
  const [privacyValue, setPrivacyValue] = useState("public");
  // Poll categories.
  const [categories, setCategories] = useState(false);

  // Default PollModal values.
  const useDefaultValues = () => {
    reset({ options: "", title: "", description: "" });
    setOptions(initialOptionsState);
    setPrivacyValue("public");
  };

  // Load poll options if exist.
  useEffect(() => {
    if (poll) {
      const pollOptions = [];
      for (const option of poll["options"]) {
        pollOptions.push(option["option_text"]);
      }
      setOptions({ ...options, options: pollOptions });
      setPrivacyValue(poll.privacy);
    }
  }, []);

  // Load poll categories.
  useEffect(() => {
    categoriesData ? setCategories(categoriesData.list) : setCategories(false);
  }, [categoriesData]);

  // Submit.
  const onSubmit = handleSubmit(async (data) => {
    try {
      data["privacy"] = privacyValue;
      data["options"] = options;

      let res = "";

      if (poll) {
        res = await updatePoll({
          poll_id: poll._id,
          poll: data,
          headers: {
            Authorization: `Token ${session.token}`,
          },
        });
        // If the values is valid.
        if (res.data) {
          onClose();
          setOptions({
            ...options,
            add_options: [],
            del_options: [],
          });
        }
      } else {
        res = await createPoll({
          poll: data,
          headers: {
            Authorization: `Token ${session.token}`,
          },
        });
        // If the values is valid.
        if (res.data) {
          onClose();
          useDefaultValues();
        }
      }

      // If server error.
      if (res.error) {
        for (const fieldName in res.error.data) {
          setError(fieldName, {
            message: res.error.data[fieldName][0],
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <>
      {/* Button to open the Modal. */}
      {icon ? (
        <IconButton onClick={onOpen} {...buttonStyles} icon={icon} />
      ) : (
        <Button onClick={onOpen} {...buttonStyles}>
          {poll ? "Edit" : "New poll"}
        </Button>
      )}

      {/* Modal. */}
      <Modal size={"xl"} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent
          m={"auto"}
          bg={isDark ? "black" : "white"}
          color={isDark ? "whiteAlpha.900" : "blackAlpha.900"}
          border={"1px solid"}
          borderColor={isDark ? "whiteAlpha.300" : "blackAlpha.200"}
          borderRadius={"14px"}
        >
          {isLoading && <CustomProgress />}
          {/* Header. */}
          <ModalHeader>
            <Heading fontSize={"2xl"}>
              {poll ? "Edit poll" : "New poll"}
            </Heading>
          </ModalHeader>
          <ModalCloseButton />
          <form onSubmit={onSubmit}>
            {/* Body. */}
            <ModalBody maxH={"calc(100vh - 300px)"} overflow={"auto"} pb={6}>
              <PollFormBody
                poll={poll && poll}
                register={register}
                watch={watch}
                reset={reset}
                setError={setError}
                errors={errors}
                options={options}
                setOptions={setOptions}
                privacyValue={privacyValue}
                setPrivacyValue={setPrivacyValue}
                categories={categories}
                isLoading={isLoading}
              />
            </ModalBody>
            {/* Footer. */}
            <ModalFooter>
              <Button
                type="submit"
                colorScheme={ThemeColor}
                mr={3}
                isDisabled={isLoading}
              >
                {poll ? "Save" : "Create"}
              </Button>
              <Button onClick={onClose} variant="ghost" isDisabled={isLoading}>
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
}

export default PollModal;
